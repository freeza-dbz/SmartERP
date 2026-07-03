import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';

const prisma = new PrismaClient();

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const cid = parseInt(companyId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const customerCount = prisma.ledger.count({
    where: { companyId: cid, type: 'CUSTOMER' },
  });

  const supplierCount = prisma.ledger.count({
    where: { companyId: cid, type: 'SUPPLIER' },
  });

  const stockItemCount = prisma.stockItem.count({
    where: { companyId: cid },
  });

  const todaysSales = prisma.salesVoucher.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      companyId: cid,
      invoiceDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const todaysPurchases = prisma.purchaseVoucher.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      companyId: cid,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const outstandingReceivables = prisma.ledger.aggregate({
    _sum: {
      currentBalance: true,
    },
    where: {
      companyId: cid,
      type: 'CUSTOMER',
    },
  });

  const outstandingPayables = prisma.ledger.aggregate({
    _sum: {
      currentBalance: true,
    },
    where: {
      companyId: cid,
      type: 'SUPPLIER',
    },
  });

  const [customers, suppliers, stockItems, sales, purchases, receivables, payables] = await Promise.all([
    customerCount,
    supplierCount,
    stockItemCount,
    todaysSales,
    todaysPurchases,
    outstandingReceivables,
    outstandingPayables,
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          customers,
          suppliers,
          stockItems,
          todaysSales: sales._sum.totalAmount || 0,
          todaysPurchases: purchases._sum.totalAmount || 0,
          outstandingReceivables: receivables._sum.currentBalance || 0,
          outstandingPayables: payables._sum.currentBalance || 0,
        },
        'Dashboard summary fetched successfully'
      )
    );
});
