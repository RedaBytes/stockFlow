const productModel = require('../model/productModel');

async function getAll(req, res, next) {
  try {
    const products = await productModel.findAll();
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, sku, price, description } = req.body;

    const existing = await productModel.findBySku(sku);
    if (existing) {
      return res.status(409).json({ message: 'A product with this SKU already exists' });
    }

    const product = await productModel.create({ name, sku, price, description });
    return res.status(201).json({ product });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, sku, price, description } = req.body;

    const existing = await productModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const skuOwner = await productModel.findBySku(sku);
    if (skuOwner && String(skuOwner.id) !== String(req.params.id)) {
      return res.status(409).json({ message: 'A product with this SKU already exists' });
    }

    const product = await productModel.update(req.params.id, { name, sku, price, description });
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await productModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
