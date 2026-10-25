const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
const {verifyToken} = require('../middlewares/auth.middleware');
const {checkRole} = require('../middlewares/role.middleware');

// Módulo exclusivo de Administrador
router.use(verifyToken, checkRole(['Administrador']));

router.get('/', userController.list);
router.get('/metrics', userController.getMetrics);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);

module.exports = router;
