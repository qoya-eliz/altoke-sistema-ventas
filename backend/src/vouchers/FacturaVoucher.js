const { documentNumber } = require('../utils/validation');
const BaseVoucher = require('./BaseVoucher');
class FacturaVoucher extends BaseVoucher {
  getSerie() {
    return 'F001';
  }

  validate() {
    // Factura exige obligatoriamente cliente con RUC válido (11 dígitos numéricos)
    if (!this.cliente) {
      throw Object.assign(
        new Error('Para emitir Factura es obligatorio asociar un cliente con RUC.'),
        { status: 400 },
      );
    }

    const doc = (this.cliente.numero_documento || '').trim();
    const tipo = (
      this.cliente.tipo_documento ||
      this.cliente.tipo_documento_abreviatura ||
      ''
    ).toUpperCase();

    if (tipo !== 'RUC') {
      throw Object.assign(
        new Error(
          'Para emitir Factura el cliente debe contar con un RUC válido de 11 dígitos.',
        ),
        { status: 400 },
      );
    }

    documentNumber('RUC', doc);

    return true;
  }
}

module.exports = FacturaVoucher;
