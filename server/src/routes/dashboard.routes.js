import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import verifyJWT from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/summary').get(getDashboardSummary);

export default router;