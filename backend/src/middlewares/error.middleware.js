// Middleware centralizado de manejo de errores
const errorHandler = (err, req, res, next) => {
  if (!err.status && !['ER_DUP_ENTRY', 'ER_ROW_IS_REFERENCED_2'].includes(err.code)) {
    console.error('Error interno:', { name: err.name, code: err.code });
  }

  // Errores de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message:
        'Operación denegada: Ya existe un registro con estos datos únicos (código, documento o nombre de usuario).',
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message:
        'No se puede eliminar el registro porque tiene transacciones o registros relacionados en el sistema.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'El registro relacionado seleccionado no existe.',
    });
  }
  if (['ER_BAD_FIELD_ERROR', 'ER_NO_SUCH_TABLE'].includes(err.code)) {
    return res.status(503).json({
      success: false,
      message: 'La base de datos necesita la migración de instalación. Revise README.',
    });
  }
  if (['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(err.code)) {
    return res.status(409).json({
      success: false,
      message: 'Otra operación está actualizando estos datos. Vuelva a intentarlo.',
    });
  }
  // Error de validación personalizada
  if (err.status) {
    if (err.code === 'LOGIN_LOCKED') {
      res.setHeader('Retry-After', String(err.retryAfter));
    }
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(['IDEMPOTENCY_PENDING', 'LOGIN_LOCKED'].includes(err.code) ? { code: err.code } : {}),
      ...(err.code === 'LOGIN_LOCKED' ? { retry_after_seconds: err.retryAfter } : {}),
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno en el servidor. Por favor intente más tarde.',
  });
};

module.exports = errorHandler;
