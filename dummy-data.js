require('dotenv').config();
const db = require('./config/db');
const supplierModel = require('./model/supplierModel');
const productModel = require('./model/productModel');
const inventoryModel = require('./model/inventoryModel');

const SUPPLIERS = [
  { name: 'Nairobi Textiles Ltd', email: 'sales@nairobitextiles.com', phone: '+254 700 123 456' },
  { name: 'Addis Hardware Supply', email: 'contact@addishardware.et', phone: '+251 911 234 567' },
  { name: 'Pacific Electronics Co', email: 'orders@pacificelec.com', phone: '+1 415 555 0182' },
  { name: 'GreenLeaf Packaging', email: 'hello@greenleafpack.com', phone: '+44 20 7946 0958' },
  { name: 'Lagos Furniture Works', email: 'info@lagosfurniture.ng', phone: '+234 802 345 6789' },
  { name: 'Cairo Office Supplies', email: 'sales@cairooffice.eg', phone: '+20 100 234 5678' },
  { name: 'Shenzhen Micro Components', email: 'export@szmicro.cn', phone: '+86 755 8888 0192' },
  { name: 'Mumbai Textile Traders', email: 'contact@mumbaitextile.in', phone: '+91 22 4567 8901' },
  { name: 'Berlin Precision Tools', email: 'info@berlintools.de', phone: '+49 30 1234 5678' },
  { name: 'Toronto Home Goods', email: 'orders@torontohome.ca', phone: '+1 416 555 0134' },
  { name: 'Accra Food Distributors', email: 'sales@accrafood.gh', phone: '+233 24 456 7890' },
  { name: 'Kampala AgroSupply', email: 'info@kampalaagro.ug', phone: '+256 772 345 678' },
  { name: 'Dubai General Trading LLC', email: 'sales@dubaigt.ae', phone: '+971 4 123 4567' },
  { name: 'São Paulo Auto Parts', email: 'vendas@spautoparts.com.br', phone: '+55 11 4567 8901' },
  { name: 'Manila Sports Equipment', email: 'orders@manilasports.ph', phone: '+63 2 8123 4567' },
];

const PRODUCTS = [
  { name: 'Wireless Mouse', sku: 'ELEC-WM-001', price: 14.99, description: 'Ergonomic 2.4GHz wireless mouse' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KB-002', price: 49.99, description: 'RGB backlit, blue switches' },
  { name: 'USB-C Charging Cable 2m', sku: 'ELEC-CB-010', price: 6.50, description: 'Braided nylon, fast charging' },
  { name: 'A4 Paper Ream (500 sheets)', sku: 'OFF-PP-100', price: 5.25, description: '80gsm printer paper' },
  { name: 'Stainless Steel Water Bottle', sku: 'HOME-WB-045', price: 12.00, description: '750ml insulated bottle' },
  { name: 'Corrugated Shipping Box (M)', sku: 'PKG-BOX-030', price: 1.15, description: '12x9x6 inch, brown' },
  { name: 'Bluetooth Speaker Mini', sku: 'ELEC-SP-011', price: 22.50, description: 'Portable, 8hr battery' },
  { name: 'Laptop Stand Aluminum', sku: 'ELEC-LS-012', price: 18.75, description: 'Adjustable, foldable' },
  { name: 'Power Bank 10000mAh', sku: 'ELEC-PB-013', price: 19.99, description: 'Dual USB output' },
  { name: 'HDMI Cable 1.5m', sku: 'ELEC-CB-014', price: 4.20, description: '4K supported' },
  { name: 'Sticky Notes Pack (12)', sku: 'OFF-SN-101', price: 3.10, description: '3x3 inch, assorted colors' },
  { name: 'Ballpoint Pens (Box of 50)', sku: 'OFF-PN-102', price: 7.80, description: 'Blue ink, medium tip' },
  { name: 'Desk Organizer Tray', sku: 'OFF-DO-103', price: 9.40, description: '5-compartment, plastic' },
  { name: 'Whiteboard Marker Set', sku: 'OFF-WM-104', price: 6.00, description: '4 colors, low odor' },
  { name: 'Lever Arch File Folder', sku: 'OFF-FF-105', price: 2.75, description: 'A4 size, assorted colors' },
  { name: 'Ceramic Coffee Mug', sku: 'HOME-MG-046', price: 5.50, description: '350ml, dishwasher safe' },
  { name: 'LED Desk Lamp', sku: 'HOME-DL-047', price: 16.20, description: 'Adjustable brightness, USB powered' },
  { name: 'Cotton Bath Towel', sku: 'HOME-TW-048', price: 8.90, description: '70x140cm, quick-dry' },
  { name: 'Non-Stick Frying Pan 24cm', sku: 'HOME-FP-049', price: 15.60, description: 'Aluminum, induction compatible' },
  { name: 'Bubble Wrap Roll (50m)', sku: 'PKG-BW-031', price: 11.30, description: '10mm bubbles' },
  { name: 'Packing Tape (Pack of 6)', sku: 'PKG-TP-032', price: 8.45, description: 'Clear, 48mm width' },
  { name: 'Padded Envelope (Size D)', sku: 'PKG-EN-033', price: 0.65, description: 'Bubble-lined, brown' },
  { name: 'Stretch Wrap Film', sku: 'PKG-SW-034', price: 13.75, description: '500mm x 300m roll' },
  { name: 'Basmati Rice 5kg', sku: 'FOOD-RC-060', price: 9.20, description: 'Long grain, premium' },
  { name: 'Cooking Oil 5L', sku: 'FOOD-OL-061', price: 14.50, description: 'Sunflower oil' },
  { name: 'Instant Coffee 200g', sku: 'FOOD-CF-062', price: 6.75, description: 'Freeze-dried granules' },
  { name: 'Cordless Drill 18V', sku: 'TOOL-DR-070', price: 65.00, description: 'Lithium-ion, 2 batteries included' },
  { name: 'Claw Hammer 16oz', sku: 'TOOL-HM-071', price: 11.25, description: 'Fiberglass handle' },
  { name: 'Adjustable Wrench Set', sku: 'TOOL-WR-072', price: 24.90, description: '3-piece, chrome vanadium' },
  { name: 'Football (Size 5)', sku: 'SPRT-FB-080', price: 17.00, description: 'Match quality, synthetic leather' },
];

const MOVEMENTS = [
  ['ELEC-WM-001', 'IN', 100],
  ['ELEC-KB-002', 'IN', 40],
  ['ELEC-CB-010', 'IN', 250],
  ['OFF-PP-100', 'IN', 60],
  ['ELEC-WM-001', 'OUT', 15],
  ['HOME-WB-045', 'IN', 80],
  ['OFF-PP-100', 'OUT', 5],
  ['PKG-BOX-030', 'IN', 500],
  ['ELEC-KB-002', 'OUT', 3],
  ['ELEC-SP-011', 'IN', 120],
  ['ELEC-LS-012', 'IN', 75],
  ['ELEC-PB-013', 'IN', 90],
  ['ELEC-CB-014', 'IN', 200],
  ['ELEC-SP-011', 'OUT', 22],
  ['ELEC-PB-013', 'OUT', 10],
  ['OFF-SN-101', 'IN', 300],
  ['OFF-PN-102', 'IN', 150],
  ['OFF-DO-103', 'IN', 65],
  ['OFF-WM-104', 'IN', 110],
  ['OFF-FF-105', 'IN', 400],
  ['OFF-SN-101', 'OUT', 45],
  ['OFF-PN-102', 'OUT', 30],
  ['HOME-MG-046', 'IN', 140],
  ['HOME-DL-047', 'IN', 55],
  ['HOME-TW-048', 'IN', 95],
  ['HOME-FP-049', 'IN', 40],
  ['HOME-MG-046', 'OUT', 18],
  ['HOME-DL-047', 'OUT', 6],
  ['PKG-BW-031', 'IN', 60],
  ['PKG-TP-032', 'IN', 180],
  ['PKG-EN-033', 'IN', 1000],
  ['PKG-SW-034', 'IN', 45],
  ['PKG-EN-033', 'OUT', 220],
  ['PKG-TP-032', 'OUT', 35],
  ['FOOD-RC-060', 'IN', 200],
  ['FOOD-OL-061', 'IN', 130],
  ['FOOD-CF-062', 'IN', 175],
  ['FOOD-RC-060', 'OUT', 40],
  ['FOOD-CF-062', 'OUT', 25],
  ['TOOL-DR-070', 'IN', 30],
  ['TOOL-HM-071', 'IN', 85],
  ['TOOL-WR-072', 'IN', 50],
  ['TOOL-DR-070', 'OUT', 4],
  ['SPRT-FB-080', 'IN', 70],
  ['SPRT-FB-080', 'OUT', 12],
];

async function seedSuppliers() {
  const existing = await supplierModel.findAll();
  const existingNames = new Set(existing.map((s) => s.name));

  for (const supplier of SUPPLIERS) {
    if (existingNames.has(supplier.name)) {
      console.log(`  skip (exists): ${supplier.name}`);
      continue;
    }
    await supplierModel.create(supplier);
    console.log(`  created supplier: ${supplier.name}`);
  }
}

async function seedProducts() {
  for (const product of PRODUCTS) {
    const existing = await productModel.findBySku(product.sku);
    if (existing) {
      console.log(`  skip (exists): ${product.sku} - ${product.name}`);
      continue;
    }
    await productModel.create(product);
    console.log(`  created product: ${product.sku} - ${product.name}`);
  }
}

async function seedMovements() {
  for (const [sku, type, quantity] of MOVEMENTS) {
    const product = await productModel.findBySku(sku);
    if (!product) {
      console.log(`  skip movement, product not found: ${sku}`);
      continue;
    }
    if (type === 'IN') {
      await inventoryModel.stockIn(product.id, quantity);
    } else {
      await inventoryModel.stockOut(product.id, quantity);
    }
    console.log(`  ${type} ${quantity} - ${sku}`);
  }
}

async function main() {
  console.log('Seeding suppliers...');
  await seedSuppliers();

  console.log('\nSeeding products...');
  await seedProducts();

  console.log('\nApplying stock movements...');
  await seedMovements();

  console.log('\nDone. Log in and check the Dashboard, Products, Suppliers, and Movements pages.');
}

main()
  .catch((err) => {
    console.error('Failed to seed dummy data:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    db.pool.end();
  });