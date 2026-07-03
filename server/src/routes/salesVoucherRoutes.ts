import { Router } from 'express';
import { createSalesVoucher, getSalesVouchers, generateSalesVoucherPDF } from '../controllers/salesVoucherController';

const router = Router();

router.route('/')
  .post(createSalesVoucher)
  .get(getSalesVouchers);

router.route('/:id/pdf')
  .get(generateSalesVoucherPDF);

export default router;