import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import PurchaseVoucher from '../models/purchase.models.js';
import StockItem from '../models/stockItem.models.js';
import Ledger from '../models/ledger.models.js';

export const createPurchaseVoucher = asyncHandler(async (req, res) => {
  const { voucherNo, date, totalAmount, supplierId, companyId, items } = req.body;

  if (!voucherNo || !date || !totalAmount || !supplierId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Missing required fields.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let purchaseVoucher;
  try {
    // 1. Create the PurchaseVoucher (with embedded items)
    const purchaseVoucherArr = await PurchaseVoucher.create([{
      voucherNo,
      date: new Date(date),
      totalAmount,
      supplierId,
      companyId,
      items: items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))
    }], { session });

    purchaseVoucher = purchaseVoucherArr[0];

    // 2. Update stock item's current stock
    for (const item of items) {
      await StockItem.findByIdAndUpdate(
        item.itemId,
        { $inc: { currentStock: item.quantity } },
        { session }
      );
    }

    // 3. Update supplier's balance
    await Ledger.findByIdAndUpdate(
      supplierId,
      { $inc: { currentBalance: totalAmount } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, error.message || 'Transaction failed');
  } finally {
    session.endSession();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, purchaseVoucher, 'Purchase voucher created successfully'));
});

export const getPurchaseVouchers = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const purchaseVouchers = await PurchaseVoucher.find({ companyId })
    .populate('supplierId')
    .populate({
      path: 'items.itemId',
      model: 'StockItem'
    })
    .sort({ date: -1 });

  // Map to old Prisma structure to ensure frontend works correctly
  const formatted = purchaseVouchers.map(voucher => {
    const doc = voucher.toObject();
    doc.id = doc._id;
    doc.supplier = doc.supplierId;
    doc.items = doc.items.map(item => {
      item.item = item.itemId;
      item.id = item._id;
      return item;
    });
    return doc;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, 'Purchase vouchers fetched successfully'));
});
