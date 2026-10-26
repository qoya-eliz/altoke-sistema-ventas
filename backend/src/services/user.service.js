const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository.js');
const catalogs = require('../repositories/catalog.repository.js');
const v = require('../utils/validation.js');

class UserService {
  async generateUniqueUsername(nombres, apellidos) {
    const clean = (s) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const base =
      (clean(nombres).charAt(0) + clean(apellidos.trim().split(/\s+/)[0])).slice(0, 40) ||
      'usuario';
    let candidate = base;
    let i = 1;
    while (await userRepository.existsUsername(candidate)) {
      candidate = `${base}${++i}`;
    }
    return candidate;
  }

  validatePasswordComplexity(password) {
    if (typeof password !== 'string' || password.length < 8) {
      throw v.fail('La contraseña debe tener un mínimo de 8 caracteres.');
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw v.fail('La contraseña no puede superar 72 bytes.');
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password)
    ) {
      throw v.fail(
        'La contraseña debe contener al menos una mayúscula, una minúscula, un dígito y un carácter especial.',
      );
    }
  }

  async validateRole(id) {
    const role = v.integer(id, 'El rol', 1);
    const roles = await catalogs.getRoles();
    if (
      !roles.some(
        (r) => r.id_rol === role && ['Administrador', 'Cajero'].includes(r.nombre),
      )
    ) {
      throw v.fail('Seleccione un rol válido: Administrador o Cajero.');
    }
    return role;
  }

  async listUsers(filters) {
    return userRepository.findAll(filters);
  }

  async getUserById(id) {
    const user = await userRepository.findById(v.integer(id, 'El usuario', 1));
    if (!user) {
      throw v.fail('Usuario no encontrado.', 404);
    }
    return user;
  }

  async createUser(data) {
    const nombres = v.personName(data.nombres, 'Los nombres', 100);
    const apellidos = v.personName(data.apellidos, 'Los apellidos', 100);
    const id_rol = await this.validateRole(data.id_rol);
    const id_tipo_documento = v.integer(
      data.id_tipo_documento,
      'El tipo de documento',
      1,
    );
    const tipo = (await catalogs.getDocumentTypes()).find(
      (t) => t.id_tipo_documento === id_tipo_documento,
    );
    if (!tipo) {
      throw v.fail('Tipo de documento inválido.');
    }
    const numero_documento = v.documentNumber(tipo.abreviatura, data.numero_documento);
    if (await userRepository.findByDocument(numero_documento)) {
      throw v.fail('Ya existe un usuario registrado con este número de documento.');
    }
    this.validatePasswordComplexity(data.password);
    const password_hash = await bcrypt.hash(data.password, 10);
    for (let attempt = 0; attempt < 20; attempt++) {
      const nom_usuario = await this.generateUniqueUsername(nombres, apellidos);
      try {
        const id = await userRepository.create({
          id_rol,
          id_tipo_documento,
          numero_documento,
          nombres,
          apellidos,
          nom_usuario,
          password_hash,
          estado: v.active(data.estado),
        });
        return this.getUserById(id);
      } catch (err) {
        if (
          err.code !== 'ER_DUP_ENTRY' ||
          !(await userRepository.existsUsername(nom_usuario)) ||
          (await userRepository.findByDocument(numero_documento))
        ) {
          throw err;
        }
      }
    }
    throw v.fail('No se pudo generar un usuario único. Vuelva a intentarlo.', 409);
  }

  async updateUser(id, data) {
    const user = await this.getUserById(id);
    const nombres = v.personName(data.nombres, 'Los nombres', 100);
    const apellidos = v.personName(data.apellidos, 'Los apellidos', 100);
    const id_rol = await this.validateRole(
      data.id_rol === undefined ? user.id_rol : data.id_rol,
    );
    let password_hash = null;
    if (data.password !== undefined && data.password !== '') {
      this.validatePasswordComplexity(data.password);
      password_hash = await bcrypt.hash(data.password, 10);
    }
    // RF14: el Administrador puede modificar el rol; el documento y el usuario conservan su identidad.
    const estado = v.active(data.estado, user.estado);
    const roles = await catalogs.getRoles();
    const nextRole = roles.find((role) => role.id_rol === id_rol)?.nombre;
    await userRepository.update(id, {
      nombres,
      apellidos,
      id_rol,
      password_hash,
      estado,
    }, (current, activeAdmins) => {
      if (!current) throw v.fail('Usuario no encontrado.', 404);
      if (current.rol === 'Administrador' && current.estado && activeAdmins <= 1 &&
          (!estado || nextRole !== 'Administrador')) {
        throw v.fail('No se puede inactivar ni cambiar el rol del último administrador activo. Primero habilite a otro administrador.', 409);
      }
    });
    return this.getUserById(id);
  }

  async getMetrics() {
    return userRepository.getMetrics();
  }
}

module.exports = new UserService();
