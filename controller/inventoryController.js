const inventoryModel = require('../model/inventoryModel');
const productModel = require('../model/productModel');

async function getAll(req, res, next) {
  try {
    const inventory = await inventoryModel.findAll();
    return res.json({ inventory });
  } catch (err) {
    return next(err);
  }
}

async function getMovements(req, res, next) {
  try {
    const movements = await inventoryModel.findMovements();
    return res.json({ movements });
  } catch (err) {
    return next(err);
  }
}

async function stockIn(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await inventoryModel.stockIn(productId, quantity);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function stockOut(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await inventoryModel.stockOut(productId, quantity);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, getMovements, stockIn, stockOut };
