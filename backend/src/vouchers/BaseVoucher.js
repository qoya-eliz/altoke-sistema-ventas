class BaseVoucher {
  constructor(data) {
    this.cliente = data.cliente;
    this.items = data.items;
    this.metodoPago = data.metodoPago;
  }

  validate() {
    throw Object.assign(new Error('El método validate() debe ser implementado.'), {
      status: 400,
    });
  }

  getSerie() {
    throw Object.assign(new Error('El método getSerie() debe ser implementado.'), {
      status: 400,
    });
  }
}

module.exports = BaseVoucher;
