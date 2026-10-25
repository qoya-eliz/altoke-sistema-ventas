const db = require('../config/db.js');

class UserRepository {
  async findByUsername(nom_usuario) {
    const rows = await db.query(
      `SELECT u.*, r.nombre AS rol, td.abreviatura AS tipo_documento
       FROM usuarios u
       INNER JOIN roles r ON u.id_rol = r.id_rol
       INNER JOIN tipos_documento td ON u.id_tipo_documento = td.id_tipo_documento
       WHERE u.nom_usuario = ?`,
      [nom_usuario],
    );
    return rows[0] || null;
  }

  async findById(id_usuario) {
    const rows = await db.query(
      `SELECT u.id_usuario, u.id_rol, u.id_tipo_documento, u.numero_documento,
              u.nombres, u.apellidos, u.nom_usuario, u.estado, u.created_at,
              r.nombre AS rol, td.abreviatura AS tipo_documento
       FROM usuarios u
       INNER JOIN roles r ON u.id_rol = r.id_rol
       INNER JOIN tipos_documento td ON u.id_tipo_documento = td.id_tipo_documento
       WHERE u.id_usuario = ?`,
      [id_usuario],
    );
    return rows[0] || null;
  }

  async findByDocument(numero_documento) {
    const rows = await db.query(
      'SELECT id_usuario FROM usuarios WHERE numero_documento = ?',
      [numero_documento],
    );
    return rows[0] || null;
  }

  async existsUsername(nom_usuario, excludeId = null) {
    let sql = 'SELECT id_usuario FROM usuarios WHERE nom_usuario = ?';
    const params = [nom_usuario];
    if (excludeId) {
      sql += ' AND id_usuario != ?';
      params.push(excludeId);
    }
    const rows = await db.query(sql, params);
    return rows.length > 0;
  }

  async findAll({ search = '', id_rol = '', estado = '' }) {
    let sql = `
      SELECT u.id_usuario, u.id_rol, u.id_tipo_documento, u.numero_documento,
             u.nombres, u.apellidos, u.nom_usuario, u.estado, u.created_at,
             r.nombre AS rol, td.abreviatura AS tipo_documento
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      INNER JOIN tipos_documento td ON u.id_tipo_documento = td.id_tipo_documento
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.numero_documento LIKE ? OR u.nombres LIKE ? OR u.apellidos LIKE ? OR u.nom_usuario LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (id_rol) {
      sql += ` AND u.id_rol = ?`;
      params.push(id_rol);
    }

    if (estado !== '' && estado !== null && estado !== undefined) {
      sql += ` AND u.estado = ?`;
      params.push(
        estado === 'true' || estado === true || estado === 1 || estado === '1' ? 1 : 0,
      );
    }

    sql += ' ORDER BY u.id_usuario DESC';
    return await db.query(sql, params);
  }

  async create({
    id_rol,
    id_tipo_documento,
    numero_documento,
    nombres,
    apellidos,
    nom_usuario,
    password_hash,
    estado = true,
  }) {
    const result = await db.execute(
      `INSERT INTO usuarios (id_rol, id_tipo_documento, numero_documento, nombres, apellidos, nom_usuario, password_hash, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_rol,
        id_tipo_documento,
        numero_documento,
        nombres,
        apellidos,
        nom_usuario,
        password_hash,
        estado ? 1 : 0,
      ],
    );
    return result.insertId;
  }

  async update(id_usuario, { nombres, apellidos, id_rol, password_hash, estado }, validateChange) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Serializa modificaciones de permisos para proteger al último administrador.
      await connection.query("SELECT id_rol FROM roles WHERE nombre='Administrador' FOR UPDATE");
      const [currentRows] = await connection.query(
        'SELECT u.*, r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? FOR UPDATE',
        [id_usuario],
      );
      const [admins] = await connection.query(
        "SELECT u.id_usuario FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE r.nombre='Administrador' AND u.estado=TRUE FOR UPDATE",
      );
      validateChange(currentRows[0], admins.length);
      const fields = ['nombres = ?', 'apellidos = ?', 'id_rol = ?', 'estado = ?'];
      const params = [nombres, apellidos, id_rol, estado ? 1 : 0];
      if (password_hash) {
        fields.push('password_hash = ?');
        params.push(password_hash);
      }
      params.push(id_usuario);
      await connection.execute(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, params);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getMetrics() {
    const rows = await db.query(`
      SELECT 
        COUNT(*) AS total_usuarios,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS personal_activo,
        COUNT(DISTINCT id_rol) AS roles_configurados,
        SUM(CASE WHEN estado=1 AND id_rol=(SELECT id_rol FROM roles WHERE nombre='Administrador') THEN 1 ELSE 0 END) AS administradores_activos
      FROM usuarios;
    `);
    return rows[0];
  }
}

module.exports = new UserRepository();
