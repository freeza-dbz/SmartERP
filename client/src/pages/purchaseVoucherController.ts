import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPurchaseVoucher = async (req: Request, res: Response) => {
  const { voucherNo, date, totalAmount, supplierId, companyId, items } = req.body;

  if (!voucherNo || !date || !totalAmount || !supplierId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the PurchaseVoucher
      const purchaseVoucher = await tx.purchaseVoucher.create({
        data: {
          voucherNo,
          date: new Date(date),
          totalAmount,
          supplierId,
          companyId,
        },
      });

      // 2. Create PurchaseVoucherItem entries and update stock
      for (const item of items) {
        // Create purchase voucher item
        await tx.purchaseVoucherItem.create({
          data: {
            voucherId: purchaseVoucher.id,
            itemId: item.itemId,
            quantity: item.quantity,
            rate: item.rate,
          },
        });

        // Update stock item's current stock
        await tx.stockItem.update({
          where: { id: item.itemId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }

      // 3. Update supplier's balance
      await tx.ledger.update({
        where: { id: supplierId },
        data: {
          currentBalance: {
            increment: totalAmount, // Purchase increases liability (amount to be paid)
          },
        },
      });

      return purchaseVoucher;
    });

    res.status(201).json({ message: 'Purchase voucher created successfully', data: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create purchase voucher', error: error.message });
  }
};

export const getPurchaseVouchers = async (req: Request, res: Response) => {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ message: 'Company ID is required.' });
  }

  try {
    const purchaseVouchers = await prisma.purchaseVoucher.findMany({
      where: {
        companyId: parseInt(companyId as string),
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json({ data: purchaseVouchers });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch purchase vouchers', error: error.message });
  }
};