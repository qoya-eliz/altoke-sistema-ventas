const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller.js');
const {verifyToken} = require('../middlewares/auth.middleware');
const {checkRole} = require('../middlewares/role.middleware');

// Ambos roles pueden acceder a clientes (con filtrado interno por rol)
router.use(verifyToken, checkRole(['Administrador', 'Cajero']));

router.get('/', clientController.list);
router.get('/metrics', checkRole(['Administrador']), clientController.getMetrics);
router.get('/search', clientController.findByDocument);
router.get('/:id', clientController.getById);

// Alta de cliente: permitido a Administrador y a Cajero (desde el modal de venta POS)
router.post('/', clientController.create);

// Modificación: exclusivo de Administrador
router.put('/:id', checkRole(['Administrador']), clientController.update);

module.exports = router;
