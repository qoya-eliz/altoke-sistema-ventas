const db = require('../config/db.js');

class CatalogRepository {
  async getRoles() {
    return await db.query('SELECT id_rol, nombre FROM roles ORDER BY id_rol ASC');
  }

  async getDocumentTypes() {
    return await db.query(
      'SELECT id_tipo_documento, abreviatura, descripcion FROM tipos_documento ORDER BY id_tipo_documento ASC',
    );
  }

  async getPaymentMethods() {
    return await db.query(
      'SELECT id_metodo_pago, nombre FROM metodos_pago ORDER BY id_metodo_pago ASC',
    );
  }

  async getVoucherTypes() {
    return await db.query(
      'SELECT id_tipo_comprobante, nombre FROM tipos_comprobante ORDER BY id_tipo_comprobante ASC',
    );
  }
}


module.exports = new CatalogRepository();
