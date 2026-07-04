import { Router } from "express"
import  {
  createLedger,
  getLedgers,
  updateLedger,
} from "../controllers/ledger.controller.js"
import verifyJWT from "../middleware/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

// Standard REST endpoints for new MastersPage integration
router.route('/')
  .post(createLedger)
  .get(getLedgers);

router.route('/:id')
  .put(updateLedger);

// Deprecated custom endpoints (kept for legacy TransactionsPage calls)
router.post('/createLedgers', createLedger);
router.get('/fetchLedgers', getLedgers);
router.put('/updateLedgers/:id', updateLedger);

export default router;