const express = require('express');
const router = express.Router();

const inventoryController = require('../controller/inventoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { stockMoveRules } = require('../middleware/validation/inventoryValidator');
const { validate } = require('../middleware/validation/authValidator');

router.use(authenticate);

router.get('/', inventoryController.getAll);
router.get('/movements', inventoryController.getMovements);
router.post('/stock-in', authorize('admin'), stockMoveRules, validate, inventoryController.stockIn);
router.post('/stock-out', authorize('admin'), stockMoveRules, validate, inventoryController.stockOut);

module.exports = router;
