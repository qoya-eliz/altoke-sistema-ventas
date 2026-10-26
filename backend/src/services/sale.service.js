const { presentReceipt } = require('../utils/receipt');
const crypto = require('crypto');
const business = require('../config/business.js');
const db = require('../config/db.js');
const sales = require('../repositories/sale.repository.js');
const products = require('../repositories/product.repository.js');
const clients = require('../repositories/client.repository.js');
const catalogs = require('../repositories/catalog.repository.js');
const VoucherFactory = require('../vouchers/VoucherFactory.js');
const v = require('../utils/validation.js');

function validateSalesFilters(filters) {
  const validated = v.validateDates(filters);
  if (validated.estado && !['COMPLETADA', 'ANULADA'].includes(validated.estado)) {
    throw v.fail('Seleccione un estado de venta válido: Completada o Anulada.');
  }
  return validated;
}

class SaleService {
  async processSale(id_usuario, payload, actor = {}) {
    const id_cliente = v.integer(payload.id_cliente, 'El cliente', 1);
    const id_tipo_comprobante = v.integer(
      payload.id_tipo_comprobante,
      'El tipo de comprobante',
      1,
    );
    const id_metodo_pago = v.integer(payload.id_metodo_pago, 'El método de pago', 1);
    const operation = v.text(
      payload.clave_operacion,
      'El identificador de la operación',
      64,
    );
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(operation)) {
      throw v.fail('El identificador de la operación no es válido.');
    }
    if (!Array.isArray(payload.items) || !payload.items.length) {
      throw v.fail('El carrito de compras está vacío.');
    }
    const items = payload.items
      .map((item) => ({
        id_producto: v.integer(item.id_producto, 'El producto', 1),
        cantidad: v.integer(item.cantidad, 'La cantidad', 1),
        precio_unitario:
          item.precio_unitario === undefined
            ? undefined
            : v.money(item.precio_unitario, 'El precio unitario') / 100,
      }))
      .sort((a, b) => a.id_producto - b.id_producto);
    if (new Set(items.map((i) => i.id_producto)).size !== items.length) {
      throw v.fail('El carrito contiene líneas repetidas del mismo producto.');
    }
    const clave_operacion = crypto
      .createHash('sha256')
      .update(`${id_usuario}:${operation}`)
      .digest('hex');
    const hash_operacion = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          id_cliente,
          id_tipo_comprobante,
          id_metodo_pago,
          items,
          monto_recibido: payload.monto_recibido,
        }),
      )
      .digest('hex');
    const type = (await catalogs.getVoucherTypes()).find(
      (t) => t.id_tipo_comprobante === id_tipo_comprobante,
    );
    const method = (await catalogs.getPaymentMethods()).find(
      (t) => t.id_metodo_pago === id_metodo_pago,
    );
    if (!type || !method) {
      throw v.fail('Tipo de comprobante o método de pago inválido.');
    }
    let connection;
    let begun = false;
    const locks = [];
    try {
      connection = await db.getConnection();
      const lock = async (name) => {
        if (!(await sales.acquireLock(name, connection))) {
          const error = v.fail(
            'La operación está siendo procesada. Reintente con la misma venta.',
            409,
          );
          error.code = 'IDEMPOTENCY_PENDING';
          throw error;
        }
        locks.push(name);
      };
      await lock(`op:${clave_operacion.slice(0, 60)}`);
      const previous = await sales.findByOperation(clave_operacion, connection);
      if (previous) {
        if (previous.hash_operacion !== hash_operacion) {
          throw v.fail(
            'La operación ya fue utilizada con otros datos. No se registró otra venta.',
            409,
          );
        }
        return await presentReceipt(await sales.findById(previous.id_venta, connection));
      }
      const serie = VoucherFactory.create(type.nombre, { cliente: {} }).getSerie();
      // Se serializa el correlativo por serie, incluso cuando aún no existen ventas.
      await lock(`serie:${serie}`);
      await connection.beginTransaction();
      begun = true;
      const client = await clients.findById(id_cliente, connection);
      if (!client || !client.estado) {
        throw v.fail('Seleccione un cliente activo.');
      }
      VoucherFactory.create(type.nombre, {
        cliente: client,
        items,
        metodoPago: method,
      }).validate();
      let totalCents = 0;
      const details = [];
      for (const item of items) {
        const p = await products.findById(item.id_producto, connection);
        if (!p || !p.estado) {
          throw v.fail('Uno de los productos ya no está activo.');
        }
        if (p.stock < item.cantidad) {
          throw v.fail(`Stock insuficiente para '${p.nombre}'. Disponible: ${p.stock}.`);
        }
        const price = v.money(p.precio_venta, 'El precio del producto', false);
        if (
          item.precio_unitario !== undefined &&
          v.money(item.precio_unitario) !== price
        ) {
          throw v.fail(
            `El precio de '${p.nombre}' cambió. Retire el producto y vuelva a agregarlo para confirmar el importe.`,
            409,
          );
        }
        const amount = price * item.cantidad;
        totalCents += amount;
        details.push({
          id_producto: p.id_producto,
          producto_nombre: p.nombre,
          cod_producto: p.cod_producto,
          categoria_nombre: p.categoria,
          cantidad: item.cantidad,
          precio_unitario: price / 100,
          subtotal: amount / 100,
        });
      }
      if (!Number.isSafeInteger(totalCents) || totalCents > 9999999999) {
        throw v.fail('El total excede el importe permitido.');
      }
      const cash = method.nombre.toLowerCase() === 'efectivo';
      const received = cash
        ? v.money(payload.monto_recibido, 'El monto recibido')
        : totalCents;
      if (received < totalCents) {
        throw v.fail('El monto recibido es insuficiente para completar la venta.');
      }
      const now = new Date();
      const start = payload.fecha_hora_inicio ? new Date(payload.fecha_hora_inicio) : now;
      if (Number.isNaN(start.getTime()) || start > now) {
        throw v.fail('La fecha de inicio de atención no es válida.');
      }
      const subtotal = Math.round(totalCents / 1.18);
      const tiempo = Math.floor((now - start) / 1000);
      if (tiempo > 2147483647) {
        throw v.fail('El tiempo de atención está fuera de rango.');
      }
      const numero = await sales.getNextCorrelative(serie, connection);
      const snapshot_comprobante = {
        negocio: business,
        cliente_nombre: client.nombre_razon_social,
        cliente_documento: client.numero_documento,
        cliente_tipo_documento: client.tipo_documento,
        cajero_nombre:
          actor.nombre_completo ||
          [actor.nombres, actor.apellidos].filter(Boolean).join(' '),
        nom_usuario: actor.nom_usuario,
        items: details,
      };
      const id = await sales.createSale(
        {
          id_usuario,
          id_cliente,
          id_tipo_comprobante,
          id_metodo_pago,
          serie_comprobante: serie,
          numero_comprobante: numero,
          subtotal: subtotal / 100,
          monto_igv: (totalCents - subtotal) / 100,
          total: totalCents / 100,
          monto_recibido: received / 100,
          vuelto: (received - totalCents) / 100,
          tiempo_atencion_seg: tiempo,
          fecha_hora_inicio: start,
          fecha_hora_fin: now,
          clave_operacion,
          hash_operacion,
          snapshot_comprobante,
        },
        connection,
      );
      for (const item of details) {
        await sales.createSaleDetail({ ...item, id_venta: id }, connection);
        if (!(await products.adjustStock(item.id_producto, item.cantidad, connection))) {
          throw v.fail('El stock cambió durante el cobro. Reintente la venta.', 409);
        }
      }
      // Leer con la misma conexión antes del COMMIT evita informar un fallo después de guardar.
      const result = await sales.findById(id, connection);
      const receipt = await presentReceipt(result);
      await connection.commit();
      begun = false;
      return receipt;
    } catch (error) {
      if (begun) {
        try {
          await connection.rollback();
        } catch {}
      }
      throw error;
    } finally {
      if (connection) {
        for (const name of locks.reverse()) {
          try {
            await sales.releaseLock(name, connection);
          } catch {}
        }
        connection.release();
      }
    }
  }

  async getSaleById(id, isCashier = false) {
    const sale = await sales.findById(v.integer(id, 'La venta', 1));
    if (!sale) {
      throw v.fail('Venta no encontrada.', 404);
    }
    if (isCashier && sale.estado === 'ANULADA') {
      throw v.fail('Acceso no permitido a ventas anuladas.', 403);
    }
    return presentReceipt(sale);
  }

  async listSales(filters, isCashier = false) {
    return sales.findAll({ ...validateSalesFilters(filters), excludeCancelled: isCashier });
  }

  async getMetrics(filters) {
    return sales.getMetrics(validateSalesFilters(filters));
  }
}

module.exports = new SaleService();
