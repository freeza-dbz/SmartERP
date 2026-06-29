import { Router } from "express"
const {
  createLedger,
  getLedgers,
  updateLedger,
} = require('../controllers/ledger.controller.js');

const router = Router();

router.post('/ledgers', createLedger);
router.get('/ledgers', getLedgers);
router.put('/ledgers/:id', updateLedger);

module.exports = router;