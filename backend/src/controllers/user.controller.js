const userService = require('../services/user.service.js');

class UserController {
  async list(req, res, next) {
    try {
      const { search, id_rol, estado } = req.query;
      const users = await userService.listUsers({ search, id_rol, estado });
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Datos del usuario actualizados exitosamente.',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await userService.getMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
