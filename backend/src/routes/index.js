const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes.js');
const catalogRoutes = require('./catalog.routes.js');

router.use('/auth', authRoutes);
router.use('/catalogs', catalogRoutes);

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
