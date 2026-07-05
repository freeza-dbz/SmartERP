import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import Ledger from '../models/ledger.models.js';
import SalesVoucher from '../models/saleVouchers.models.js';
import PurchaseVoucher from '../models/purchase.models.js';

// Trial Balance: All ledgers with their current balances
export const getTrialBalance = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) throw new ApiError(400, 'Company ID is required.');

  const ledgers = await Ledger.find({ companyId }).select('name type openingBalance currentBalance');

  const rows = ledgers.map(l => {
    const balance = l.currentBalance;
    const isDebitType = ['CUSTOMER', 'ASSET', 'EXPENSE'].includes(l.type);
    return {
      name: l.name,
      type: l.type,
      debit: isDebitType ? Math.abs(balance) : 0,
      credit: !isDebitType ? Math.abs(balance) : 0,
    };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return res.status(200).json(new ApiResponse(200, { rows, totalDebit, totalCredit }, 'Trial balance fetched'));
});

// Profit & Loss: Sales (income) vs Purchases (expenses)
export const getProfitLoss = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) throw new ApiError(400, 'Company ID is required.');

  const cId = new mongoose.Types.ObjectId(companyId);

  const [salesResult, purchaseResult, incomeLedgers, expenseLedgers] = await Promise.all([
    SalesVoucher.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    PurchaseVoucher.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Ledger.find({ companyId, type: 'INCOME' }).select('name currentBalance'),
    Ledger.find({ companyId, type: 'EXPENSE' }).select('name currentBalance'),
  ]);

  const salesTotal = salesResult.length > 0 ? salesResult[0].total : 0;
  const purchasesTotal = purchaseResult.length > 0 ? purchaseResult[0].total : 0;

  const income = [
    { name: 'Sales', amount: salesTotal },
    ...incomeLedgers.map(l => ({ name: l.name, amount: l.currentBalance })),
  ];

  const expenses = [
    { name: 'Purchases', amount: purchasesTotal },
    ...expenseLedgers.map(l => ({ name: l.name, amount: l.currentBalance })),
  ];

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return res.status(200).json(new ApiResponse(200, { income, expenses, totalIncome, totalExpenses, netProfit }, 'P&L fetched'));
});

// Balance Sheet: Assets vs Liabilities
export const getBalanceSheet = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) throw new ApiError(400, 'Company ID is required.');

  const cId = new mongoose.Types.ObjectId(companyId);

  const [ledgers, salesResult, purchaseResult] = await Promise.all([
    Ledger.find({ companyId }).select('name type currentBalance openingBalance'),
    SalesVoucher.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    PurchaseVoucher.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
  ]);

  const salesTotal = salesResult.length > 0 ? salesResult[0].total : 0;
  const purchasesTotal = purchaseResult.length > 0 ? purchaseResult[0].total : 0;
  const netProfit = salesTotal - purchasesTotal;

  // Group ledgers by type
  const customers = ledgers.filter(l => l.type === 'CUSTOMER');
  const assets = ledgers.filter(l => l.type === 'ASSET');
  const cashBank = ledgers.filter(l => ['CASH', 'BANK'].includes(l.type));
  const liabilities = ledgers.filter(l => l.type === 'LIABILITY');
  const suppliers = ledgers.filter(l => l.type === 'SUPPLIER');

  const totalReceivables = customers.reduce((s, l) => s + l.currentBalance, 0);
  const totalAssets = assets.reduce((s, l) => s + l.currentBalance, 0);
  const totalCashBank = cashBank.reduce((s, l) => s + l.currentBalance, 0);

  const totalPayables = suppliers.reduce((s, l) => s + l.currentBalance, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.currentBalance, 0);

  const assetGroups = [
    { group: 'Current Assets', items: [
      { name: 'Accounts Receivable', amount: totalReceivables },
      ...cashBank.map(l => ({ name: l.name, amount: l.currentBalance })),
    ]},
    { group: 'Fixed Assets', items: assets.map(l => ({ name: l.name, amount: l.currentBalance })) },
  ];

  const liabilityGroups = [
    { group: 'Current Liabilities', items: [
      { name: 'Accounts Payable', amount: totalPayables },
      ...liabilities.map(l => ({ name: l.name, amount: l.currentBalance })),
    ]},
    { group: 'Capital', items: [
      { name: 'Net Profit / (Loss)', amount: netProfit },
    ]},
  ];

  const totalA = totalReceivables + totalAssets + totalCashBank;
  const totalL = totalPayables + totalLiabilities + netProfit;

  return res.status(200).json(new ApiResponse(200, {
    assetGroups,
    liabilityGroups,
    totalAssets: totalA,
    totalLiabilities: totalL,
  }, 'Balance sheet fetched'));
});

// Receipts: Sales vouchers = money received from customers
export const getReceipts = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) throw new ApiError(400, 'Company ID is required.');

  const vouchers = await SalesVoucher.find({ companyId })
    .populate('customerId', 'name')
    .sort({ invoiceDate: -1 })
    .limit(50);

  const formatted = vouchers.map(v => ({
    id: v._id,
    receiptNo: v.invoiceNo,
    date: v.invoiceDate,
    customer: v.customerId?.name || 'Unknown',
    mode: 'Sales',
    amount: v.totalAmount,
  }));

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0,0,0,0);
  const thisMonthTotal = vouchers
    .filter(v => new Date(v.invoiceDate) >= thisMonth)
    .reduce((s, v) => s + v.totalAmount, 0);

  const totalOutstanding = await Ledger.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), type: 'CUSTOMER' } },
    { $group: { _id: null, total: { $sum: '$currentBalance' } } }
  ]);

  return res.status(200).json(new ApiResponse(200, {
    receipts: formatted,
    thisMonthTotal,
    transactionCount: vouchers.length,
    outstandingTotal: totalOutstanding.length > 0 ? totalOutstanding[0].total : 0,
  }, 'Receipts fetched'));
});

// Payments: Purchase vouchers = money paid to suppliers
export const getPayments = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) throw new ApiError(400, 'Company ID is required.');

  const vouchers = await PurchaseVoucher.find({ companyId })
    .populate('supplierId', 'name')
    .sort({ date: -1 })
    .limit(50);

  const formatted = vouchers.map(v => ({
    id: v._id,
    paymentNo: v.voucherNo,
    date: v.date,
    supplier: v.supplierId?.name || 'Unknown',
    mode: 'Purchase',
    amount: v.totalAmount,
  }));

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0,0,0,0);
  const thisMonthTotal = vouchers
    .filter(v => new Date(v.date) >= thisMonth)
    .reduce((s, v) => s + v.totalAmount, 0);

  const totalOutstanding = await Ledger.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), type: 'SUPPLIER' } },
    { $group: { _id: null, total: { $sum: '$currentBalance' } } }
  ]);

  return res.status(200).json(new ApiResponse(200, {
    payments: formatted,
    thisMonthTotal,
    transactionCount: vouchers.length,
    outstandingTotal: totalOutstanding.length > 0 ? totalOutstanding[0].total : 0,
  }, 'Payments fetched'));
});
