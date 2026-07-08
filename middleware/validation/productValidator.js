const { body } = require('express-validator');

const productRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 150 }).withMessage('Name too long'),
  body('sku').trim().notEmpty().withMessage('SKU is required')
    .isLength({ max: 50 }).withMessage('SKU too long'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional({ nullable: true }).isString(),
];

module.exports = { productRules };
