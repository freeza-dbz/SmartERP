import { Router } from "express"
const {
  createStockGroup,
  getStockGroups,
} = require('../controllers/stockGroupController.js');

const router = Router();

router.post('/groups', createStockGroup);
router.get('/groups', getStockGroups);

module.exports = router;