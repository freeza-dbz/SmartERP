import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import SalesVoucher from '../models/saleVouchers.models.js';
import StockItem from '../models/stockItem.models.js';
import Ledger from '../models/ledger.models.js';
import Company from '../models/company.model.js';

export const createSalesVoucher = asyncHandler(async (req, res) => {
  const { invoiceNo, invoiceDate, totalAmount, customerId, companyId, items } = req.body;

  if (!invoiceNo || !invoiceDate || !totalAmount || !customerId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Missing required fields.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let salesVoucher;
  try {
    // 1. Check for sufficient stock for all items
    const itemIds = items.map((item) => item.itemId);
    const stockItems = await StockItem.find({ _id: { $in: itemIds } }).session(session);

    const stockMap = new Map(
      stockItems.map((si) => [si._id.toString(), { currentStock: si.currentStock, name: si.name }])
    );

    for (const item of items) {
      const stockInfo = stockMap.get(item.itemId.toString());
      if (!stockInfo || stockInfo.currentStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for item: ${stockInfo?.name || `ID ${item.itemId}`}. Available: ${stockInfo?.currentStock || 0}, Required: ${item.quantity}`
        );
      }
    }

    // 2. Create the SalesVoucher
    const salesVoucherArr = await SalesVoucher.create([{
      invoiceNo,
      invoiceDate: new Date(invoiceDate),
      totalAmount,
      customerId,
      companyId,
      items: items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))
    }], { session });

    salesVoucher = salesVoucherArr[0];

    // 3. Update stock item's current stock
    for (const item of items) {
      await StockItem.findByIdAndUpdate(
        item.itemId,
        { $inc: { currentStock: -item.quantity } },
        { session }
      );
    }

    // 4. Update customer's balance (increase receivable)
    await Ledger.findByIdAndUpdate(
      customerId,
      { $inc: { currentBalance: totalAmount } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(error.statusCode || 500, error.message || 'Transaction failed');
  } finally {
    session.endSession();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, salesVoucher, 'Sales voucher created successfully'));
});

export const getSalesVouchers = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'Company ID is required.');
  }

  const salesVouchers = await SalesVoucher.find({ companyId })
    .populate('customerId')
    .populate({
      path: 'items.itemId',
      model: 'StockItem'
    })
    .sort({ invoiceDate: -1 });

  // Map to old Prisma structure
  const formatted = salesVouchers.map(voucher => {
    const doc = voucher.toObject();
    doc.id = doc._id;
    doc.customer = doc.customerId;
    doc.items = doc.items.map(item => {
      item.item = item.itemId;
      item.id = item._id;
      return item;
    });
    return doc;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, 'Sales vouchers fetched successfully'));
});

export const generateSalesVoucherPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sale = await SalesVoucher.findById(id)
    .populate('companyId')
    .populate('customerId')
    .populate({
      path: 'items.itemId',
      model: 'StockItem'
    });

  if (!sale) {
    throw new ApiError(404, 'Sales voucher not found');
  }

  // format for PDF code backward compatibility
  const saleDoc = sale.toObject();
  saleDoc.company = saleDoc.companyId;
  saleDoc.customer = saleDoc.customerId;
  saleDoc.items = saleDoc.items.map(i => {
      i.item = i.itemId;
      return i;
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 10;
  const headerFontSize = 18;
  const subHeaderFontSize = 12;
  const margin = 50;
  let y = height - margin;

  // Header
  page.drawText('TAX INVOICE', {
    x: margin,
    y,
    font: boldFont,
    size: headerFontSize,
    color: rgb(0.1, 0.1, 0.1),
  });

  const companyNameText = saleDoc.company.name;
  const companyNameWidth = boldFont.widthOfTextAtSize(companyNameText, subHeaderFontSize);
  page.drawText(companyNameText, {
    x: width - margin - companyNameWidth,
    y: y + 5,
    font: boldFont,
    size: subHeaderFontSize,
  });

  y -= headerFontSize + 20;

  // Company and Customer details
  const companyX = margin;
  const customerX = width / 2 + margin / 2;

  page.drawText('Bill From:', { x: companyX, y, font: boldFont, size: fontSize });
  y -= fontSize + 5;
  page.drawText(saleDoc.company.name, { x: companyX, y, font, size: fontSize });
  y -= fontSize + 5;
  page.drawText(saleDoc.company.address || '', { x: companyX, y, font, size: fontSize, maxWidth: (width / 2) - (margin * 2) });
  y -= fontSize + 5;
  page.drawText(`GSTIN: ${saleDoc.company.gstNumber || ''}`, { x: companyX, y, font, size: fontSize });

  let yCustomer = height - margin - headerFontSize - 20;
  page.drawText('Bill To:', { x: customerX, y: yCustomer, font: boldFont, size: fontSize });
  yCustomer -= fontSize + 5;
  page.drawText(saleDoc.customer.name, { x: customerX, y: yCustomer, font, size: fontSize });

  y = Math.min(y, yCustomer) - 30;

  // Invoice details
  page.drawText(`Invoice No: ${saleDoc.invoiceNo}`, { x: margin, y, font: boldFont, size: fontSize });
  const dateText = `Date: ${new Date(saleDoc.invoiceDate).toLocaleDateString()}`;
  const dateTextWidth = boldFont.widthOfTextAtSize(dateText, fontSize);
  page.drawText(dateText, { x: width - margin - dateTextWidth, y, font: boldFont, size: fontSize });
  y -= fontSize + 20;

  // Table Header
  const tableTop = y;
  const itemX = margin;
  const qtyX = 300;
  const rateX = 380;
  const amountX = 480;

  page.drawText('Item', { x: itemX, y: tableTop, font: boldFont, size: fontSize });
  page.drawText('Quantity', { x: qtyX, y: tableTop, font: boldFont, size: fontSize });
  page.drawText('Rate', { x: rateX, y: tableTop, font: boldFont, size: fontSize });
  page.drawText('Amount', { x: amountX, y: tableTop, font: boldFont, size: fontSize });
  y -= fontSize + 5;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 10;

  // Table Rows
  saleDoc.items.forEach((saleItem) => {
    const itemAmount = Number(saleItem.quantity) * Number(saleItem.rate);
    page.drawText(saleItem.item.name, { x: itemX, y, font, size: fontSize, maxWidth: qtyX - itemX - 10 });
    page.drawText(saleItem.quantity.toString(), { x: qtyX, y, font, size: fontSize });
    page.drawText(Number(saleItem.rate).toFixed(2), { x: rateX, y, font, size: fontSize });
    page.drawText(itemAmount.toFixed(2), { x: amountX, y, font, size: fontSize });
    y -= fontSize + 10;
  });

  // Line after items
  page.drawLine({ start: { x: margin, y: y + 5 }, end: { x: width - margin, y: y + 5 }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });
  y -= 10;

  // Total
  const totalText = `Total: ${Number(saleDoc.totalAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
  const totalTextWidth = boldFont.widthOfTextAtSize(totalText, subHeaderFontSize);
  page.drawText(totalText, { x: width - margin - totalTextWidth, y, font: boldFont, size: subHeaderFontSize });

  const pdfBytes = await pdfDoc.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${saleDoc.invoiceNo}.pdf`);
  res.send(Buffer.from(pdfBytes));
});
