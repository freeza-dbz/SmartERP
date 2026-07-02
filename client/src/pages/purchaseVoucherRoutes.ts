import { Router } from 'express';
import { createPurchaseVoucher, getPurchaseVouchers } from '../controllers/purchaseVoucherController';
// Assuming some auth middleware exists
// import { protect } from '../middleware/authMiddleware';

const router = Router();

// router.use(protect); // Assuming routes are protected

router.route('/')
  .post(createPurchaseVoucher)
  .get(getPurchaseVouchers);

export default router;