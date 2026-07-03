import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: Request, res: Response) => {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ message: 'Company ID is required.' });
  }

  const cid = parseInt(companyId as string);

  try {
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

    res.status(200).json({
      data: {
        customers,
        suppliers,
        stockItems,
        todaysSales: sales._sum.totalAmount || 0,
        todaysPurchases: purchases._sum.totalAmount || 0,
        outstandingReceivables: receivables._sum.currentBalance || 0,
        outstandingPayables: payables._sum.currentBalance || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: error.message });
  }
};