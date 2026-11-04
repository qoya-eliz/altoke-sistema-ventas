const { getJwtSecret } = require('../config/auth.js');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

// Middleware para verificar la validez del token JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: No se proporcionó token de autenticación.',
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    // Validar existencia y estado activo en la base de datos
    const identity = await userRepository.findById(decoded.id_usuario);
    const users = identity ? [identity] : [];

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: El usuario no existe.',
      });
    }

    const user = users[0];
    if (!user.estado) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Usuario inactivo. Contacte al Administrador.',
        code: 'INACTIVE_USER',
      });
    }

    req.user = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      rol: user.rol,
      nom_usuario: user.nom_usuario,
      nombres: user.nombres,
      apellidos: user.apellidos,
      nombre_completo: `${user.nombres} ${user.apellidos}`.trim(),
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido o manipulado.',
    });
  }
};

module.exports = { verifyToken };
