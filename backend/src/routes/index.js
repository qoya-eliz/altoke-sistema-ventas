const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes.js');
const catalogRoutes = require('./catalog.routes.js');
const userRoutes = require('./user.routes.js');
const clientRoutes = require('./client.routes.js');
const productRoutes = require('./product.routes.js');
const categoryRoutes = require('./category.routes.js');
const saleRoutes = require('./sale.routes.js');

router.use('/auth', authRoutes);
router.use('/catalogs', catalogRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/sales', saleRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    system: 'ALTOKE POS API REST',
    version: '1.1.0-2026',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
