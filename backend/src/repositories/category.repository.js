const db = require('../config/db.js');

class CategoryRepository {
  async findAll({ search = '', estado = '', onlyActive = false }) {
    let sql = `
      SELECT c.id_categoria, c.nombre, c.descripcion, c.estado,
             COUNT(p.id_producto) AS productos_asociados
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria
      WHERE 1=1
    `;
    const params = [];

    if (onlyActive) {
      sql += ' AND c.estado = 1';
    } else if (estado !== '' && estado !== null && estado !== undefined) {
      sql += ' AND c.estado = ?';
      params.push(
        estado === 'true' || estado === true || estado === 1 || estado === '1' ? 1 : 0,
      );
    }

    if (search) {
      sql += ' AND (c.nombre LIKE ? OR c.descripcion LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' GROUP BY c.id_categoria ORDER BY c.id_categoria ASC';
    return await db.query(sql, params);
  }

  async findById(id_categoria) {
    const rows = await db.query(
      'SELECT id_categoria, nombre, descripcion, estado FROM categorias WHERE id_categoria = ?',
      [id_categoria],
    );
    return rows[0] || null;
  }

  async findByName(nombre, excludeId = null) {
    let sql = 'SELECT id_categoria FROM categorias WHERE LOWER(nombre) = LOWER(?)';
    const params = [nombre.trim()];
    if (excludeId) {
      sql += ' AND id_categoria != ?';
      params.push(excludeId);
    }
    const rows = await db.query(sql, params);
    return rows[0] || null;
  }

  async create({ nombre, descripcion, estado = true }) {
    const result = await db.execute(
      'INSERT INTO categorias (nombre, descripcion, estado) VALUES (?, ?, ?)',
      [nombre.trim(), descripcion ? descripcion.trim() : null, estado ? 1 : 0],
    );
    return result.insertId;
  }

  async update(id_categoria, { nombre, descripcion, estado }) {
    const sql =
      'UPDATE categorias SET nombre = ?, descripcion = ?, estado = ? WHERE id_categoria = ?';
    await db.execute(sql, [
      nombre.trim(),
      descripcion ? descripcion.trim() : null,
      estado ? 1 : 0,
      id_categoria,
    ]);
    return true;
  }

  async countAssociatedProducts(id_categoria) {
    const rows = await db.query(
      'SELECT COUNT(*) AS count FROM productos WHERE id_categoria = ? AND estado = 1',
      [id_categoria],
    );
    return rows[0]?.count || 0;
  }

  async getMetrics() {
    const rows = await db.query(`
      SELECT 
        COUNT(*) AS total_familias,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS categorias_activas
      FROM categorias;
    `);

    // Categoría más vendida
    const topCatRows = await db.query(`
      SELECT c.nombre AS categoria_mas_vendida, SUM(dv.cantidad) as total_vendido
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      INNER JOIN ventas v ON dv.id_venta = v.id_venta AND v.estado = 'COMPLETADA'
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      GROUP BY c.id_categoria
      ORDER BY total_vendido DESC
      LIMIT 1;
    `);

    return {
      total_familias: rows[0]?.total_familias || 0,
      categorias_activas: rows[0]?.categorias_activas || 0,
      categoria_mas_vendida: topCatRows[0]?.categoria_mas_vendida || 'Sin ventas',
    };
  }
}


module.exports = new CategoryRepository();
