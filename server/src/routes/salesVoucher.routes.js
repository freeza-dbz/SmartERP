import { Router } from 'express';
import { createSalesVoucher, getSalesVouchers, generateSalesVoucherPDF } from '../controllers/salesVoucher.controller.js';
import verifyJWT from '../middleware/auth.middleware.js';

const router = Router();

router.route('/:id/pdf').get(generateSalesVoucherPDF);

router.use(verifyJWT);

router.route('/')
  .post(createSalesVoucher)
  .get(getSalesVouchers);

export default router;
