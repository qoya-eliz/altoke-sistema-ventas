const db = require('../config/db.js');

class ClientRepository {
  async findAll({
    search = '',
    id_tipo_documento = '',
    estado = '',
    onlyActive = false,
  }) {
    let sql = `
      SELECT c.id_cliente, c.id_tipo_documento, c.numero_documento,
             c.nombre_razon_social, c.estado, c.created_at,
             td.abreviatura AS tipo_documento, td.descripcion AS tipo_documento_desc
      FROM clientes c
      INNER JOIN tipos_documento td ON c.id_tipo_documento = td.id_tipo_documento
      WHERE 1=1
    `;
    const params = [];

    // Regla de seguridad estricta para Cajeros: solo ver activos
    if (onlyActive) {
      sql += ' AND c.estado = 1';
    } else if (estado !== '' && estado !== null && estado !== undefined) {
      sql += ' AND c.estado = ?';
      params.push(
        estado === 'true' || estado === true || estado === 1 || estado === '1' ? 1 : 0,
      );
    }

    if (id_tipo_documento) {
      sql += ' AND c.id_tipo_documento = ?';
      params.push(id_tipo_documento);
    }

    if (search) {
      sql += ' AND (c.numero_documento LIKE ? OR c.nombre_razon_social LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY c.id_cliente DESC';
    return await db.query(sql, params);
  }

  async findById(id_cliente, connection = null) {
    const query = connection
      ? async (sql, params) => {
          const [rows] = await connection.query(sql, params);
          return rows;
        }
      : db.query.bind(db);
    const rows = await query(
      `SELECT c.id_cliente, c.id_tipo_documento, c.numero_documento,
              c.nombre_razon_social, c.estado, c.created_at,
              td.abreviatura AS tipo_documento, td.descripcion AS tipo_documento_desc
       FROM clientes c
       INNER JOIN tipos_documento td ON c.id_tipo_documento = td.id_tipo_documento
       WHERE c.id_cliente = ?` + (connection ? ' FOR UPDATE' : ''),
      [id_cliente],
    );
    return rows[0] || null;
  }

  async findByDocument(numero_documento, id_tipo_documento = null) {
    let sql = `
      SELECT c.id_cliente, c.id_tipo_documento, c.numero_documento,
             c.nombre_razon_social, c.estado, c.created_at,
             td.abreviatura AS tipo_documento, td.descripcion AS tipo_documento_desc
      FROM clientes c
      INNER JOIN tipos_documento td ON c.id_tipo_documento = td.id_tipo_documento
      WHERE c.numero_documento = ?
    `;
    const params = [numero_documento];
    if (id_tipo_documento) {
      sql += ' AND c.id_tipo_documento = ?';
      params.push(id_tipo_documento);
    }
    const rows = await db.query(sql, params);
    return rows[0] || null;
  }

  async create({
    id_tipo_documento,
    numero_documento,
    nombre_razon_social,
    estado = true,
  }) {
    const result = await db.execute(
      `INSERT INTO clientes (id_tipo_documento, numero_documento, nombre_razon_social, estado)
       VALUES (?, ?, ?, ?)`,
      [id_tipo_documento, numero_documento, nombre_razon_social, estado ? 1 : 0],
    );
    return result.insertId;
  }

  async update(id_cliente, { nombre_razon_social, estado }) {
    // Tipo y número de documento quedan bloqueados según requerimiento
    const sql = `UPDATE clientes SET nombre_razon_social = ?, estado = ? WHERE id_cliente = ?`;
    await db.execute(sql, [nombre_razon_social, estado ? 1 : 0, id_cliente]);
    return true;
  }

  async getMetrics() {
    const rows = await db.query(`
      SELECT 
        COUNT(*) AS total_clientes,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS clientes_activos,
        SUM(CASE WHEN numero_documento = '00000000' THEN 1 ELSE 0 END) AS clientes_genericos
      FROM clientes;
    `);
    return rows[0];
  }
}


module.exports = new ClientRepository();
