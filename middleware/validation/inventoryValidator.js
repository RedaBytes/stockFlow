const { body } = require('express-validator');

const stockMoveRules = [
  body('productId').isInt({ min: 1 }).withMessage('A valid productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

module.exports = { stockMoveRules };
