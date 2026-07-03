import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';

const prisma = new PrismaClient();

export const createSalesVoucher = asyncHandler(async (req, res) => {
  const { invoiceNo, invoiceDate, totalAmount, customerId, companyId, items } = req.body;

  if (!invoiceNo || !invoiceDate || !totalAmount || !customerId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Missing required fields.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Check for sufficient stock for all items
    const itemIds = items.map((item) => item.itemId);
    const stockItems = await tx.stockItem.findMany({
      where: { id: { in: itemIds } },
    });

    const stockMap = new Map(
      stockItems.map((si) => [si.id, { currentStock: si.currentStock, name: si.name }])
    );

    for (const item of items) {
      const stockInfo = stockMap.get(item.itemId);
      if (!stockInfo || stockInfo.currentStock.lessThan(item.quantity)) {
        throw new ApiError(
          400,
          `Insufficient stock for item: ${stockInfo?.name || `ID ${item.itemId}`}. Available: ${stockInfo?.currentStock || 0}, Required: ${item.quantity}`
        );
      }
    }

    // 2. Create the SalesVoucher
    const salesVoucher = await tx.salesVoucher.create({
      data: {
        invoiceNo,
        invoiceDate: new Date(invoiceDate),
        totalAmount,
        customerId,
        companyId,
      },
    });

    // 3. Create SalesVoucherItem entries and update stock
    for (const item of items) {
      await tx.salesVoucherItem.create({
        data: {
          voucherId: salesVoucher.id,
          itemId: item.itemId,
          quantity: item.quantity,
          rate: item.rate,
        },
      });

      // Decrease stock item's current stock
      await tx.stockItem.update({
        where: { id: item.itemId },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 4. Update customer's balance (increase receivable)
    await tx.ledger.update({
      where: { id: customerId },
      data: {
        currentBalance: {
          increment: totalAmount,
        },
      },
    });

    return salesVoucher;
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Sales voucher created successfully'));
});

export const getSalesVouchers = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const salesVouchers = await prisma.salesVoucher.findMany({
    where: {
      companyId: parseInt(companyId),
    },
    include: {
      customer: true,
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: {
      invoiceDate: 'desc',
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, salesVouchers, 'Sales vouchers fetched successfully'));
});
