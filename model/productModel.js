const db = require('../config/db');

async function findAll() {
  const result = await db.query(
    `SELECT p.id, p.name, p.sku, p.price, p.description, p.created_at, p.updated_at,
            COALESCE(i.quantity, 0) AS quantity
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     ORDER BY p.id`
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT p.id, p.name, p.sku, p.price, p.description, p.created_at, p.updated_at,
            COALESCE(i.quantity, 0) AS quantity
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findBySku(sku) {
  const result = await db.query('SELECT * FROM products WHERE sku = $1', [sku]);
  return result.rows[0] || null;
}

async function create({ name, sku, price, description }) {
  const result = await db.query(
    `INSERT INTO products (name, sku, price, description)
     VALUES ($1, $2, $3, $4) RETURNING id, name, sku, price, description, created_at, updated_at`,
    [name, sku, price, description || null]
  );
  const product = result.rows[0];
  await db.query(
    `INSERT INTO inventory (product_id, quantity) VALUES ($1, 0)
     ON CONFLICT (product_id) DO NOTHING`,
    [product.id]
  );
  return product;
}

async function update(id, { name, sku, price, description }) {
  const result = await db.query(
    `UPDATE products
     SET name = $1, sku = $2, price = $3, description = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING id, name, sku, price, description, created_at, updated_at`,
    [name, sku, price, description || null, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

async function count() {
  const result = await db.query('SELECT COUNT(*)::int AS count FROM products');
  return result.rows[0].count;
}

module.exports = { findAll, findById, findBySku, create, update, remove, count };
