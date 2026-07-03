import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';

const prisma = new PrismaClient();

export const createPurchaseVoucher = asyncHandler(async (req, res) => {
  const { voucherNo, date, totalAmount, supplierId, companyId, items } = req.body;

  if (!voucherNo || !date || !totalAmount || !supplierId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Missing required fields.');
  }

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

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Purchase voucher created successfully'));
});

export const getPurchaseVouchers = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const purchaseVouchers = await prisma.purchaseVoucher.findMany({
    where: {
      companyId: parseInt(companyId),
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

  return res
    .status(200)
    .json(new ApiResponse(200, purchaseVouchers, 'Purchase vouchers fetched successfully'));
});
