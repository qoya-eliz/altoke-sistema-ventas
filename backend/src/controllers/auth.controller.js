const authService = require('../services/auth.service.js');

class AuthController {
  async login(req, res, next) {
    try {
      const { nom_usuario, password } = req.body;
      const result = await authService.login(nom_usuario, password);
      return res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
