import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const prisma = new PrismaClient();

export const createSalesVoucher = async (req: Request, res: Response) => {
  const { invoiceNo, invoiceDate, totalAmount, customerId, companyId, items } = req.body;

  if (!invoiceNo || !invoiceDate || !totalAmount || !customerId || !companyId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check for sufficient stock for all items
      const itemIds = items.map((item: { itemId: number }) => item.itemId);
      const stockItems = await tx.stockItem.findMany({
        where: { id: { in: itemIds } },
      });

      const stockMap = new Map<number, { currentStock: Decimal; name: string }>(
        stockItems.map((si) => [si.id, { currentStock: si.currentStock, name: si.name }])
      );

      for (const item of items) {
        const stockInfo = stockMap.get(item.itemId);
        if (!stockInfo || stockInfo.currentStock.lessThan(item.quantity)) {
          throw new Error(`Insufficient stock for item: ${stockInfo?.name || `ID ${item.itemId}`}. Available: ${stockInfo?.currentStock || 0}, Required: ${item.quantity}`);
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

    res.status(201).json({ message: 'Sales voucher created successfully', data: result });
  } catch (error: any) {
    // Check if the error is due to insufficient stock
    if (error.message.startsWith('Insufficient stock')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create sales voucher', error: error.message });
  }
};

export const getSalesVouchers = async (req: Request, res: Response) => {
    const { companyId } = req.query;

    if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required.' });
    }

    try {
        const salesVouchers = await prisma.salesVoucher.findMany({
            where: {
                companyId: parseInt(companyId as string),
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

        res.status(200).json({ data: salesVouchers });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch sales vouchers', error: error.message });
    }
};

export const generateSalesVoucherPDF = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const sale = await prisma.salesVoucher.findUnique({
            where: { id: parseInt(id) },
            include: {
                company: true,
                customer: true,
                items: {
                    include: {
                        item: true, // StockItem
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sales voucher not found' });
        }

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
        
        const companyNameText = sale.company.name;
        const companyNameWidth = boldFont.widthOfTextAtSize(companyNameText, subHeaderFontSize);
        page.drawText(companyNameText, { x: width - margin - companyNameWidth, y: y + 5, font: boldFont, size: subHeaderFontSize });

        y -= headerFontSize + 20;

        // Company and Customer details
        const companyX = margin;
        const customerX = width / 2 + margin / 2;

        page.drawText('Bill From:', { x: companyX, y, font: boldFont, size: fontSize });
        y -= fontSize + 5;
        page.drawText(sale.company.name, { x: companyX, y, font, size: fontSize });
        y -= fontSize + 5;
        page.drawText(sale.company.address || '', { x: companyX, y, font, size: fontSize, maxWidth: (width/2) - (margin * 2) });
        y -= fontSize + 5;
        page.drawText(`GSTIN: ${sale.company.gstNumber || ''}`, { x: companyX, y, font, size: fontSize });

        let yCustomer = height - margin - headerFontSize - 20;
        page.drawText('Bill To:', { x: customerX, y: yCustomer, font: boldFont, size: fontSize });
        yCustomer -= fontSize + 5;
        page.drawText(sale.customer.name, { x: customerX, y: yCustomer, font, size: fontSize });

        y = Math.min(y, yCustomer) - 30;

        // Invoice details
        page.drawText(`Invoice No: ${sale.invoiceNo}`, { x: margin, y, font: boldFont, size: fontSize });
        const dateText = `Date: ${new Date(sale.invoiceDate).toLocaleDateString()}`;
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
        sale.items.forEach(saleItem => {
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
        const totalText = `Total: ${Number(sale.totalAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
        const totalTextWidth = boldFont.widthOfTextAtSize(totalText, subHeaderFontSize);
        page.drawText(totalText, { x: width - margin - totalTextWidth, y, font: boldFont, size: subHeaderFontSize });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNo}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error: any) {
        res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
};

export const generateSalesVoucherPDF = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const sale = await prisma.salesVoucher.findUnique({
            where: { id: parseInt(id) },
            include: {
                company: true,
                customer: true,
                items: {
                    include: {
                        item: true, // StockItem
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sales voucher not found' });
        }

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
        
        const companyNameText = sale.company.name;
        const companyNameWidth = boldFont.widthOfTextAtSize(companyNameText, subHeaderFontSize);
        page.drawText(companyNameText, { x: width - margin - companyNameWidth, y: y + 5, font: boldFont, size: subHeaderFontSize });

        y -= headerFontSize + 20;

        // Company and Customer details
        const companyX = margin;
        const customerX = width / 2 + margin / 2;

        page.drawText('Bill From:', { x: companyX, y, font: boldFont, size: fontSize });
        y -= fontSize + 5;
        page.drawText(sale.company.name, { x: companyX, y, font, size: fontSize });
        y -= fontSize + 5;
        page.drawText(sale.company.address || '', { x: companyX, y, font, size: fontSize, maxWidth: (width/2) - (margin * 2) });
        y -= fontSize + 5;
        page.drawText(`GSTIN: ${sale.company.gstNumber || ''}`, { x: companyX, y, font, size: fontSize });

        let yCustomer = height - margin - headerFontSize - 20;
        page.drawText('Bill To:', { x: customerX, y: yCustomer, font: boldFont, size: fontSize });
        yCustomer -= fontSize + 5;
        page.drawText(sale.customer.name, { x: customerX, y: yCustomer, font, size: fontSize });

        y = Math.min(y, yCustomer) - 30;

        // Invoice details
        page.drawText(`Invoice No: ${sale.invoiceNo}`, { x: margin, y, font: boldFont, size: fontSize });
        const dateText = `Date: ${new Date(sale.invoiceDate).toLocaleDateString()}`;
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
        sale.items.forEach(saleItem => {
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
        const totalText = `Total: ${Number(sale.totalAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
        const totalTextWidth = boldFont.widthOfTextAtSize(totalText, subHeaderFontSize);
        page.drawText(totalText, { x: width - margin - totalTextWidth, y, font: boldFont, size: subHeaderFontSize });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNo}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error: any) {
        res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
};