import { Router } from 'express';
import { createPurchaseVoucher, getPurchaseVouchers } from '../controllers/purchaseVoucher.controller.js';
import verifyJWT from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
  .post(createPurchaseVoucher)
  .get(getPurchaseVouchers);

export default router;
