const db = require('../config/db.js');

class ProductRepository {
  async findAll({
    search = '',
    id_categoria = '',
    stock_alert = '',
    estado = '',
    onlyActive = false,
  }) {
    let sql = `
      SELECT p.id_producto, p.id_categoria, p.cod_producto, p.nombre,
             p.descripcion, p.precio_venta, p.stock, p.stock_minimo,
             p.estado, p.created_at, c.nombre AS categoria
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE 1=1
    `;
    const params = [];

    // Regla de Cajero: jamás exponer inactivos
    if (onlyActive) {
      sql += ' AND p.estado = 1';
    } else if (estado !== '' && estado !== null && estado !== undefined) {
      sql += ' AND p.estado = ?';
      params.push(
        estado === 'true' || estado === true || estado === 1 || estado === '1' ? 1 : 0,
      );
    }

    if (id_categoria) {
      sql += ' AND p.id_categoria = ?';
      params.push(id_categoria);
    }

    if (stock_alert === 'bajo') {
      sql += ' AND p.stock <= p.stock_minimo';
    }

    if (search) {
      sql += ' AND (p.cod_producto LIKE ? OR p.nombre LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY p.id_producto DESC';
    return await db.query(sql, params);
  }

  async searchActive(term) {
    const cleanTerm = (term || '').trim();
    const sql = `
      SELECT p.id_producto, p.id_categoria, p.cod_producto, p.nombre,
             p.descripcion, p.precio_venta, p.stock, p.stock_minimo,
             p.estado, c.nombre AS categoria
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.estado = 1
        AND (p.cod_producto LIKE ? OR p.nombre LIKE ?)
      ORDER BY p.nombre ASC
      LIMIT 15
    `;
    const pattern = `%${cleanTerm}%`;
    return await db.query(sql, [pattern, pattern]);
  }

  async findById(id_producto, connection = null) {
    const sql =
      `
      SELECT p.id_producto, p.id_categoria, p.cod_producto, p.nombre,
             p.descripcion, p.precio_venta, p.stock, p.stock_minimo,
             p.estado, p.created_at, c.nombre AS categoria
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ?
    ` + (connection ? ' FOR UPDATE' : '');
    if (connection) {
      const [rows] = await connection.query(sql, [id_producto]);
      return rows[0] || null;
    }
    const rows = await db.query(sql, [id_producto]);
    return rows[0] || null;
  }

  async findByCode(cod_producto) {
    const rows = await db.query(
      `SELECT p.id_producto, p.id_categoria, p.cod_producto, p.nombre,
              p.descripcion, p.precio_venta, p.stock, p.stock_minimo,
              p.estado, c.nombre AS categoria
       FROM productos p
       INNER JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.cod_producto = ?`,
      [cod_producto.trim()],
    );
    return rows[0] || null;
  }

  async create({
    id_categoria,
    cod_producto,
    nombre,
    descripcion,
    precio_venta,
    stock,
    stock_minimo,
    estado = true,
  }) {
    const result = await db.execute(
      `INSERT INTO productos (id_categoria, cod_producto, nombre, descripcion, precio_venta, stock, stock_minimo, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_categoria,
        cod_producto.trim(),
        nombre.trim(),
        descripcion ? descripcion.trim() : null,
        precio_venta,
        stock,
        stock_minimo,
        estado ? 1 : 0,
      ],
    );
    return result.insertId;
  }

  async update(id_producto, data) {
    const fields = [
      'id_categoria = ?',
      'cod_producto = ?',
      'nombre = ?',
      'descripcion = ?',
      'precio_venta = ?',
      'stock_minimo = ?',
      'estado = ?',
    ];
    const params = [
      data.id_categoria,
      data.cod_producto,
      data.nombre,
      data.descripcion || null,
      data.precio_venta,
      data.stock_minimo,
      data.estado ? 1 : 0,
    ];
    // Editar precio/nombre no vuelve a guardar una copia obsoleta del stock.
    if (data.actualizar_stock) {
      fields.push('stock = ?');
      params.push(data.stock);
    }
    params.push(id_producto);
    let sql = `UPDATE productos SET ${fields.join(', ')} WHERE id_producto = ?`;
    if (data.actualizar_stock) {
      sql += ' AND stock = ?';
      params.push(data.stock_original);
    }
    const result = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  // Descuento o incremento atómico de stock dentro de una transacción

  async adjustStock(id_producto, quantityToDeduct, connection) {
    const sql =
      'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?';
    const [result] = await connection.query(sql, [
      quantityToDeduct,
      id_producto,
      quantityToDeduct,
    ]);
    return result.affectedRows > 0;
  }

  async getMetrics() {
    const rows = await db.query(`
      SELECT 
        COUNT(*) AS total_productos,
        SUM(CASE WHEN stock <= stock_minimo THEN 1 ELSE 0 END) AS stock_bajo,
        (SELECT COUNT(*) FROM categorias WHERE estado = 1) AS categorias_activas
      FROM productos;
    `);
    return rows[0];
  }
}

module.exports = new ProductRepository();
