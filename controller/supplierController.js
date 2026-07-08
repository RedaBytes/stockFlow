const supplierModel = require('../model/supplierModel');

async function getAll(req, res, next) {
  try {
    const suppliers = await supplierModel.findAll();
    return res.json({ suppliers });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const supplier = await supplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    return res.json({ supplier });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const supplier = await supplierModel.create({ name, email, phone });
    return res.status(201).json({ supplier });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const existing = await supplierModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    const supplier = await supplierModel.update(req.params.id, { name, email, phone });
    return res.json({ supplier });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await supplierModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
