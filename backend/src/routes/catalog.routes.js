const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

router.get('/', verifyToken, catalogController.getAllCatalogs);

module.exports = router;
