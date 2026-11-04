const BaseVoucher = require('./BaseVoucher');
class BoletaVoucher extends BaseVoucher {
  getSerie() {
    return 'B001';
  }

  validate() {
    // Boleta permite DNI, CE o Público General
    if (!this.cliente) {
      throw Object.assign(
        new Error(
          'Para emitir Boleta de Venta debe seleccionarse un cliente válido o Público General.',
        ),
        { status: 400 },
      );
    }
    return true;
  }
}

module.exports = BoletaVoucher;
