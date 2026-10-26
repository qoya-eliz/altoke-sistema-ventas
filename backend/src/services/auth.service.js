const { getJwtSecret } = require('../config/auth.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository.js');

const failedLogins = new Map();
const MAX_FAILURES = 3;
const BLOCK_DURATION_MS = 2 * 60 * 1000;

function lockedError(until) {
  return Object.assign(new Error('Demasiados intentos fallidos. Intente nuevamente en dos minutos.'), {
    status: 429,
    code: 'LOGIN_LOCKED',
    retryAfter: Math.max(1, Math.ceil((until - Date.now()) / 1000)),
  });
}

function checkLoginBlock(key) {
  const attempt = failedLogins.get(key);
  if (attempt?.blockedUntil > Date.now()) throw lockedError(attempt.blockedUntil);
  if (attempt?.blockedUntil) failedLogins.delete(key);
}

function rejectCredentials(key) {
  const previous = failedLogins.get(key);
  const failures = (previous?.failures || 0) + 1;
  const blockedUntil = failures >= MAX_FAILURES ? Date.now() + BLOCK_DURATION_MS : 0;
  failedLogins.set(key, { failures, blockedUntil, updatedAt: Date.now() });
  if (blockedUntil) throw lockedError(blockedUntil);
  throw Object.assign(new Error('Credenciales incorrectas. Verifique su usuario y contraseña.'), { status: 401 });
}

class AuthService {
  async login(nom_usuario, password) {
    if (
      typeof nom_usuario !== 'string' ||
      !nom_usuario.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      const error = new Error('Por favor ingrese su usuario y contraseña.');
      error.status = 400;
      throw error;
    }

    // Normaliza las variantes de una misma cuenta. El identificador evita eludir el
    // bloqueo cambiando mayúsculas o tildes en un nombre de acceso existente.
    const username = nom_usuario.trim();
    const user = await userRepository.findByUsername(username);
    const key = user ? `user:${user.id_usuario}` : `unknown:${username.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}`;
    // Descarta contadores abandonados para no acumular nombres inexistentes.
    const now = Date.now();
    for (const [storedKey, attempt] of failedLogins) {
      if (now - attempt.updatedAt > 30 * 60 * 1000) failedLogins.delete(storedKey);
    }
    checkLoginBlock(key);
    if (!user) rejectCredentials(key);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    // Otra solicitud pudo completar el tercer fallo mientras se comparaba el hash.
    checkLoginBlock(key);
    if (!isMatch) rejectCredentials(key);

    if (!user.estado) {
      const error = new Error(
        'Su usuario se encuentra inhabilitado. Contacte al Administrador.',
      );
      error.status = 403;
      throw error;
    }

    failedLogins.delete(key);

    const secret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        rol: user.rol,
        nom_usuario: user.nom_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
      },
      secret,
      { expiresIn },
    );

    return {
      token,
      user: {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        rol: user.rol,
        nom_usuario: user.nom_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        numero_documento: user.numero_documento,
        tipo_documento: user.tipo_documento,
      },
    };
  }
}


module.exports = new AuthService();
