require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./router/authRouter');
const productRoutes = require ('./router/productRouter');
const supplierRoutes = require('./router/supplierRouter');
const inventoryRoutes = require('./router/inventoryRouter');
const dashboardRoutes = require('./router/dashboardRouter');
const userRoutes = require('./router/userRouter');


const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());
app.use(generalLimiter);
app.use(express.static('public'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);


app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StockFlow API listening on http://localhost:${PORT}`);
});

module.exports = app;
