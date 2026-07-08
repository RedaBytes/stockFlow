const db = require('../config/db');

async function findAll() {
  const result = await db.query(
    `SELECT p.id AS product_id, p.name, p.sku, COALESCE(i.quantity, 0) AS quantity
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     ORDER BY p.id`
  );
  return result.rows;
}

async function getQuantity(productId) {
  const result = await db.query('SELECT quantity FROM inventory WHERE product_id = $1', [productId]);
  return result.rows[0] ? result.rows[0].quantity : null;
}

async function stockIn(productId, quantity) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const movement = await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity)
       VALUES ($1, 'IN', $2) RETURNING *`,
      [productId, quantity]
    );

    const inventory = await client.query(
      `INSERT INTO inventory (product_id, quantity)
       VALUES ($1, $2)
       ON CONFLICT (product_id)
       DO UPDATE SET quantity = inventory.quantity + $2, updated_at = NOW()
       RETURNING *`,
      [productId, quantity]
    );

    await client.query('COMMIT');
    return { movement: movement.rows[0], inventory: inventory.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function stockOut(productId, quantity) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query(
      'SELECT quantity FROM inventory WHERE product_id = $1 FOR UPDATE',
      [productId]
    );

    const currentQty = current.rows[0] ? current.rows[0].quantity : 0;
    if (currentQty < quantity) {
      await client.query('ROLLBACK');
      const err = new Error(`Insufficient stock. Available: ${currentQty}, requested: ${quantity}`);
      err.status = 400;
      throw err;
    }

    const movement = await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity)
       VALUES ($1, 'OUT', $2) RETURNING *`,
      [productId, quantity]
    );

    const inventory = await client.query(
      `UPDATE inventory SET quantity = quantity - $2, updated_at = NOW()
       WHERE product_id = $1 RETURNING *`,
      [productId, quantity]
    );

    await client.query('COMMIT');
    return { movement: movement.rows[0], inventory: inventory.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findMovements() {
  const result = await db.query(
    `SELECT sm.id, sm.product_id, p.name AS product_name, p.sku, sm.type, sm.quantity, sm.created_at
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     ORDER BY sm.created_at DESC, sm.id DESC`
  );
  return result.rows;
}

async function findLowStock(threshold = 10) {
  const result = await db.query(
    `SELECT p.id, p.name, p.sku, COALESCE(i.quantity, 0) AS quantity
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE COALESCE(i.quantity, 0) < $1
     ORDER BY quantity ASC`,
    [threshold]
  );
  return result.rows;
}

module.exports = { findAll, getQuantity, stockIn, stockOut, findMovements, findLowStock };
