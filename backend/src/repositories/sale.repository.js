const db = require('../config/db.js');

class SaleRepository {
  // Obtener siguiente número correlativo de serie con bloqueo exclusivo FOR UPDATE

  async getNextCorrelative(serie, connection) {
    const sql = `
      SELECT MAX(CAST(numero_comprobante AS UNSIGNED)) AS max_num
      FROM ventas
      WHERE serie_comprobante = ?
      FOR UPDATE
    `;
    const [rows] = await connection.query(sql, [serie]);
    const currentMax = Number(rows[0]?.max_num || 0);
    if (!Number.isSafeInteger(currentMax) || currentMax >= 99999999) {
      throw Object.assign(new Error('La serie alcanzó el límite de ocho dígitos.'), {
        status: 409,
      });
    }
    const nextNum = currentMax + 1;
    return String(nextNum).padStart(8, '0');
  }

  // Registrar cabecera de venta en transacción

  async createSale(saleData, connection) {
    const sql = `
      INSERT INTO ventas (
        id_usuario, id_cliente, id_metodo_pago, id_tipo_comprobante,
        serie_comprobante, numero_comprobante, subtotal, monto_igv, total,
        monto_recibido, vuelto, tiempo_atencion_seg, estado,
        fecha_hora_inicio, fecha_hora_fin, clave_operacion, hash_operacion, snapshot_comprobante
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETADA', ?, ?, ?, ?, ?)
    `;
    const params = [
      saleData.id_usuario,
      saleData.id_cliente,
      saleData.id_metodo_pago,
      saleData.id_tipo_comprobante,
      saleData.serie_comprobante,
      saleData.numero_comprobante,
      saleData.subtotal,
      saleData.monto_igv,
      saleData.total,
      saleData.monto_recibido,
      saleData.vuelto,
      saleData.tiempo_atencion_seg || 0,
      saleData.fecha_hora_inicio || new Date(),
      saleData.fecha_hora_fin || new Date(),
      saleData.clave_operacion,
      saleData.hash_operacion,
      JSON.stringify(saleData.snapshot_comprobante),
    ];
    const [result] = await connection.query(sql, params);
    return result.insertId;
  }

  // Registrar detalle de venta en transacción

  async createSaleDetail(detailData, connection) {
    const sql = `
      INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      detailData.id_venta,
      detailData.id_producto,
      detailData.cantidad,
      detailData.precio_unitario,
      detailData.subtotal,
    ];
    const [result] = await connection.query(sql, params);
    return result.insertId;
  }

  // Obtener venta por ID con todos sus detalles para modal o comprobante

  async findById(id_venta, connection = null) {
    const query = connection
      ? async (sql, params) => {
          const [rows] = await connection.query(sql, params);
          return rows;
        }
      : db.query.bind(db);
    const headerSql = `
      SELECT v.*,
             u.nom_usuario, CONCAT(u.nombres, ' ', u.apellidos) AS cajero_nombre,
             c.numero_documento AS cliente_documento, c.nombre_razon_social AS cliente_nombre,
             td.abreviatura AS cliente_tipo_documento,
             mp.nombre AS metodo_pago,
             tc.nombre AS tipo_comprobante
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN tipos_documento td ON c.id_tipo_documento = td.id_tipo_documento
      INNER JOIN metodos_pago mp ON v.id_metodo_pago = mp.id_metodo_pago
      INNER JOIN tipos_comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
      WHERE v.id_venta = ?
    `;
    const headerRows = await query(headerSql, [id_venta]);
    if (headerRows.length === 0) {
      return null;
    }

    const sale = headerRows[0];

    const detailsSql = `
      SELECT dv.id_detalle, dv.id_producto, dv.cantidad, dv.precio_unitario, dv.subtotal,
             p.cod_producto, p.nombre AS producto_nombre, c.nombre AS categoria_nombre
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE dv.id_venta = ?
      ORDER BY dv.id_detalle ASC
    `;
    const items = await query(detailsSql, [id_venta]);
    sale.items = items;
    if (sale.snapshot_comprobante) {
      const snapshot =
        typeof sale.snapshot_comprobante === 'string'
          ? JSON.parse(sale.snapshot_comprobante)
          : sale.snapshot_comprobante;
      for (const key of [
        'cliente_nombre',
        'cliente_documento',
        'cliente_tipo_documento',
        'cajero_nombre',
        'nom_usuario',
        'negocio',
      ]) {
        if (snapshot[key] !== undefined) {
          sale[key] = snapshot[key];
        }
      }
      if (Array.isArray(snapshot.items)) {
        sale.items = snapshot.items;
      }
    }
    sale.items = sale.items.map((item) => ({ ...item, producto_nombre: item.producto_nombre || item.nombre || 'Producto' }));
    delete sale.hash_operacion;
    delete sale.clave_operacion;
    delete sale.snapshot_comprobante;
    return sale;
  }

  // Listar ventas con filtros combinados

  async findAll({
    desde = '',
    hasta = '',
    id_tipo_comprobante = '',
    id_metodo_pago = '',
    id_categoria = '',
    id_usuario = '',
    search = '',
    excludeCancelled = false,
    estado = '',
  }) {
    let sql = `
      SELECT DISTINCT v.id_venta, v.serie_comprobante, v.numero_comprobante,
             v.subtotal, v.monto_igv, v.total, v.monto_recibido, v.vuelto,
             v.tiempo_atencion_seg, v.estado, v.fecha_hora_fin,
             u.nom_usuario, CONCAT(u.nombres, ' ', u.apellidos) AS cajero_nombre,
             c.numero_documento AS cliente_documento, c.nombre_razon_social AS cliente_nombre,
             mp.nombre AS metodo_pago,
             tc.nombre AS tipo_comprobante
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN metodos_pago mp ON v.id_metodo_pago = mp.id_metodo_pago
      INNER JOIN tipos_comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
    `;

    // Si filtra por categoría, hacemos join con detalle_ventas y productos
    if (id_categoria) {
      sql += `
        INNER JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
        INNER JOIN productos p ON dv.id_producto = p.id_producto AND p.id_categoria = ?
      `;
    }

    sql += ' WHERE 1=1';
    const params = [];

    if (id_categoria) {
      params.push(id_categoria);
    }

    // Regla de seguridad para Cajero: No ver anuladas
    if (excludeCancelled) {
      sql += " AND v.estado != 'ANULADA'";
    }

    if (estado) {
      sql += ' AND v.estado = ?';
      params.push(estado);
    }

    if (desde) {
      sql += ' AND DATE(v.fecha_hora_fin) >= ?';
      params.push(desde);
    }

    if (hasta) {
      sql += ' AND DATE(v.fecha_hora_fin) <= ?';
      params.push(hasta);
    }

    if (id_tipo_comprobante) {
      sql += ' AND v.id_tipo_comprobante = ?';
      params.push(id_tipo_comprobante);
    }

    if (id_metodo_pago) {
      sql += ' AND v.id_metodo_pago = ?';
      params.push(id_metodo_pago);
    }

    if (id_usuario) {
      sql += ' AND v.id_usuario = ?';
      params.push(id_usuario);
    }

    if (search) {
      sql += ` AND (
        CONCAT(v.serie_comprobante, '-', v.numero_comprobante) LIKE ? OR
        v.numero_comprobante LIKE ? OR
        c.nombre_razon_social LIKE ? OR
        c.numero_documento LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY v.fecha_hora_fin DESC';
    return await db.query(sql, params);
  }

  async acquireLock(name, connection) {
    const [rows] = await connection.query('SELECT GET_LOCK(?, 5) AS acquired', [name]);
    return Number(rows[0]?.acquired) === 1;
  }

  async releaseLock(name, connection) {
    await connection.query('SELECT RELEASE_LOCK(?)', [name]);
  }

  async findByOperation(key, connection) {
    const [rows] = await connection.query(
      'SELECT id_venta, hash_operacion FROM ventas WHERE clave_operacion = ?',
      [key],
    );
    return rows[0] || null;
  }

  async getMetrics(filters = {}) {
    const params = [];
    let sql = `SELECT COALESCE(SUM(v.total),0) AS ingresos_totales,COUNT(*) AS ventas_realizadas,COALESCE(AVG(v.total),0) AS ticket_promedio,COALESCE(AVG(v.tiempo_atencion_seg),0) AS tiempo_atencion_promedio FROM ventas v INNER JOIN clientes c ON v.id_cliente=c.id_cliente WHERE v.estado='COMPLETADA'`;
    if (filters.estado) {
      sql += ' AND v.estado = ?';
      params.push(filters.estado);
    }
    if (filters.desde) {
      sql += ' AND DATE(v.fecha_hora_fin)>=?';
      params.push(filters.desde);
    }
    if (filters.hasta) {
      sql += ' AND DATE(v.fecha_hora_fin)<=?';
      params.push(filters.hasta);
    }
    for (const k of ['id_tipo_comprobante', 'id_metodo_pago', 'id_usuario']) {
      if (filters[k]) {
        sql += ` AND v.${k}=?`;
        params.push(filters[k]);
      }
    }
    if (filters.id_categoria) {
      sql +=
        ' AND EXISTS (SELECT 1 FROM detalle_ventas dv INNER JOIN productos p ON p.id_producto=dv.id_producto WHERE dv.id_venta=v.id_venta AND p.id_categoria=?)';
      params.push(filters.id_categoria);
    }
    if (filters.search) {
      sql +=
        " AND (CONCAT(v.serie_comprobante,'-',v.numero_comprobante) LIKE ? OR v.numero_comprobante LIKE ? OR c.nombre_razon_social LIKE ? OR c.numero_documento LIKE ?)";
      params.push(...Array(4).fill(`%${filters.search}%`));
    }
    const rows = await db.query(sql, params);
    return rows[0];
  }
}


module.exports = new SaleRepository();
