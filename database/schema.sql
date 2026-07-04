-- =========================================================
-- StockFlow: Multi-Warehouse Inventory & Order Management
-- PostgreSQL DDL Schema
-- =========================================================

-- Clean slate (safe for dev re-runs)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS customer_order_items CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS product_suppliers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS po_status;
DROP TYPE IF EXISTS co_status;
DROP TYPE IF EXISTS movement_type;

-- =========================================================
-- ENUM TYPES
-- =========================================================
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE po_status AS ENUM ('pending', 'approved', 'received', 'cancelled');
CREATE TYPE co_status AS ENUM ('pending', 'fulfilled', 'cancelled');
CREATE TYPE movement_type AS ENUM ('purchase_receipt', 'customer_fulfillment', 'adjustment');

-- =========================================================
-- USERS  (Authentication + Authorization)
-- =========================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    role            user_role     NOT NULL DEFAULT 'staff',
    warehouse_id    INTEGER,              -- staff can be scoped to one warehouse (FK added after warehouses table)
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =========================================================
-- WAREHOUSES
-- =========================================================
CREATE TABLE warehouses (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    location    VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_warehouse
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;

-- =========================================================
-- SUPPLIERS
-- =========================================================
CREATE TABLE suppliers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(30),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE products (
    id                  SERIAL PRIMARY KEY,
    sku                 VARCHAR(50)   NOT NULL UNIQUE,
    name                VARCHAR(150)  NOT NULL,
    description         TEXT,
    unit_price          NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    reorder_threshold   INTEGER       NOT NULL DEFAULT 10 CHECK (reorder_threshold >= 0),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PRODUCT_SUPPLIERS (many-to-many: which suppliers provide which product)
-- =========================================================
CREATE TABLE product_suppliers (
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id     INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_cost   NUMERIC(10,2) NOT NULL CHECK (supplier_cost >= 0),
    PRIMARY KEY (product_id, supplier_id)
);

-- =========================================================
-- INVENTORY (stock level per product, per warehouse)
-- =========================================================
CREATE TABLE inventory (
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, warehouse_id)
);

-- =========================================================
-- PURCHASE ORDERS (business -> supplier, restocking)
-- =========================================================
CREATE TABLE purchase_orders (
    id              SERIAL PRIMARY KEY,
    supplier_id     INTEGER NOT NULL REFERENCES suppliers(id),
    warehouse_id    INTEGER NOT NULL REFERENCES warehouses(id),
    status          po_status NOT NULL DEFAULT 'pending',
    created_by      INTEGER NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_at     TIMESTAMPTZ
);

CREATE TABLE purchase_order_items (
    id                  SERIAL PRIMARY KEY,
    purchase_order_id   INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id          INTEGER NOT NULL REFERENCES products(id),
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost           NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0)
);

-- =========================================================
-- CUSTOMER ORDERS (business -> customer, fulfillment)
-- =========================================================
CREATE TABLE customer_orders (
    id              SERIAL PRIMARY KEY,
    customer_name   VARCHAR(150) NOT NULL,
    customer_email  VARCHAR(150),
    warehouse_id    INTEGER NOT NULL REFERENCES warehouses(id),
    status          co_status NOT NULL DEFAULT 'pending',
    created_by      INTEGER NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fulfilled_at    TIMESTAMPTZ
);

CREATE TABLE customer_order_items (
    id                  SERIAL PRIMARY KEY,
    customer_order_id   INTEGER NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_id          INTEGER NOT NULL REFERENCES products(id),
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- =========================================================
-- STOCK MOVEMENTS (full audit trail of every inventory change)
-- =========================================================
CREATE TABLE stock_movements (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id),
    warehouse_id    INTEGER NOT NULL REFERENCES warehouses(id),
    change_qty      INTEGER NOT NULL,              -- positive = stock in, negative = stock out
    movement_type   movement_type NOT NULL,
    reference_id    INTEGER,                       -- purchase_order_id or customer_order_id
    performed_by    INTEGER NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- REFRESH TOKENS (JWT refresh/rotation support)
-- =========================================================
CREATE TABLE refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES for common lookups
-- =========================================================
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_co_status ON customer_orders(status);
CREATE INDEX idx_stock_movements_product_wh ON stock_movements(product_id, warehouse_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
