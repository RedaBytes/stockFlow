const productModel = require('../model/productModel');
const supplierModel = require('../model/supplierModel');
const inventoryModel = require('../model/inventoryModel');

const LOW_STOCK_THRESHOLD = 10;

async function getSummary(req, res, next) {
  try {
    const [totalProducts, totalSuppliers, lowStockProducts] = await Promise.all([
      productModel.count(),
      supplierModel.count(),
      inventoryModel.findLowStock(LOW_STOCK_THRESHOLD),
    ]);

    return res.json({
      totalProducts,
      totalSuppliers,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowStockProducts,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSummary };
