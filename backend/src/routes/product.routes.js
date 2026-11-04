const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const {verifyToken} = require('../middlewares/auth.middleware');
const {checkRole} = require('../middlewares/role.middleware');

router.use(verifyToken, checkRole(['Administrador', 'Cajero']));

router.get('/', productController.list);
router.get('/search-pos', productController.searchForPOS);
router.get('/metrics', checkRole(['Administrador']), productController.getMetrics);
router.get('/:id', productController.getById);

// Alta y modificación: exclusivo de Administrador
router.post('/', checkRole(['Administrador']), productController.create);
router.put('/:id', checkRole(['Administrador']), productController.update);

module.exports = router;
