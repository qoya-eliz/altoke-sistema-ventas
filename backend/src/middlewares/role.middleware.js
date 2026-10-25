const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere rol [${allowedRoles.join(', ')}]. Su rol actual es '${req.user ? req.user.rol : 'No definido'}'.`,
      });
    }
    next();
  };
};

module.exports = { checkRole };
