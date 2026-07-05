import { Router } from 'express';
import verifyJWT from '../middleware/auth.middleware.js';
import {
  getTrialBalance,
  getProfitLoss,
  getBalanceSheet,
  getReceipts,
  getPayments,
} from '../controllers/reports.controller.js';

const router = Router();
router.use(verifyJWT);

router.route('/trial-balance').get(getTrialBalance);
router.route('/profit-loss').get(getProfitLoss);
router.route('/balance-sheet').get(getBalanceSheet);
router.route('/receipts').get(getReceipts);
router.route('/payments').get(getPayments);

export default router;
