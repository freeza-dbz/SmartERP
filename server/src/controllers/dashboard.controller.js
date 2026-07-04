import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import Ledger from '../models/ledger.models.js';
import StockItem from '../models/stockItem.models.js';
import SalesVoucher from '../models/saleVouchers.models.js';
import PurchaseVoucher from '../models/purchase.models.js';
import mongoose from 'mongoose';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const customerCount = Ledger.countDocuments({
    companyId: companyId,
    type: 'CUSTOMER',
  });

  const supplierCount = Ledger.countDocuments({
    companyId: companyId,
    type: 'SUPPLIER',
  });

  const stockItemCount = StockItem.countDocuments({
    companyId: companyId,
  });

  const todaysSales = SalesVoucher.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        invoiceDate: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  const todaysPurchases = PurchaseVoucher.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        date: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  const outstandingReceivables = Ledger.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        type: 'CUSTOMER',
      },
    },
    {
      $group: {
        _id: null,
        currentBalance: { $sum: '$currentBalance' },
      },
    },
  ]);

  const outstandingPayables = Ledger.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        type: 'SUPPLIER',
      },
    },
    {
      $group: {
        _id: null,
        currentBalance: { $sum: '$currentBalance' },
      },
    },
  ]);

  const [
    customers,
    suppliers,
    stockItems,
    sales,
    purchases,
    receivables,
    payables,
  ] = await Promise.all([
    customerCount,
    supplierCount,
    stockItemCount,
    todaysSales,
    todaysPurchases,
    outstandingReceivables,
    outstandingPayables,
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customers,
        suppliers,
        stockItems,
        todaysSales: sales.length > 0 ? sales[0].totalAmount : 0,
        todaysPurchases: purchases.length > 0 ? purchases[0].totalAmount : 0,
        outstandingReceivables: receivables.length > 0 ? receivables[0].currentBalance : 0,
        outstandingPayables: payables.length > 0 ? payables[0].currentBalance : 0,
      },
      'Dashboard summary fetched successfully'
    )
  );
});
