// Fábrica simple.
const BoletaVoucher = require('./BoletaVoucher');
const FacturaVoucher = require('./FacturaVoucher');
class VoucherFactory {
  static create(tipoComprobanteNombre, data) {
    const nombre = (tipoComprobanteNombre || '').trim().toLowerCase();
    if (nombre === 'factura' || nombre === '2') {
      return new FacturaVoucher(data);
    }
    if (nombre === 'boleta' || nombre === '1') {
      return new BoletaVoucher(data);
    }
    throw Object.assign(
      new Error(`Tipo de comprobante desconocido: ${tipoComprobanteNombre}`),
      { status: 400 },
    );
  }
}

module.exports = VoucherFactory;
