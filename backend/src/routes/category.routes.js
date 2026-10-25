const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const {verifyToken} = require('../middlewares/auth.middleware');
const {checkRole} = require('../middlewares/role.middleware');

router.use(verifyToken, checkRole(['Administrador', 'Cajero']));

router.get('/', categoryController.list);
router.get('/metrics', checkRole(['Administrador']), categoryController.getMetrics);
router.get('/:id', categoryController.getById);

// Alta y modificación: exclusivo de Administrador
router.post('/', checkRole(['Administrador']), categoryController.create);
router.put('/:id', checkRole(['Administrador']), categoryController.update);

module.exports = router;
