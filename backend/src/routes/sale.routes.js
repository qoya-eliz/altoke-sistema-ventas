const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller.js');
const {verifyToken} = require('../middlewares/auth.middleware');
const {checkRole} = require('../middlewares/role.middleware');

router.use(verifyToken, checkRole(['Administrador', 'Cajero']));

// Registro de ventas (POS)
router.post('/', checkRole(['Cajero']), saleController.createSale);

// Listado de ventas (Reporte o Historial)
router.get('/', saleController.list);

// Métricas de ventas: exclusivo de Administrador
router.get('/metrics', checkRole(['Administrador']), saleController.getMetrics);

// Exportaciones: exclusivo de Administrador
router.get('/export/excel', checkRole(['Administrador']), saleController.exportExcel);
router.get('/export/pdf', checkRole(['Administrador']), saleController.exportPdf);

// Detalle de venta y ticket
router.get('/:id', saleController.getById);
router.get('/:id/ticket-pdf', saleController.printTicketPdf);

module.exports = router;
