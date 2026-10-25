const repo = require('../repositories/client.repository.js');
const catalogs = require('../repositories/catalog.repository.js');
const v = require('../utils/validation.js');

class ClientService {
  validateDocumentFormat(tipo, numero) {
    return v.documentNumber((tipo || '').toUpperCase(), numero);
  }

  async listClients(filters, isCashier = false) {
    return repo.findAll({ ...filters, onlyActive: isCashier });
  }

  async getClientById(id, isCashier = false) {
    const c = await repo.findById(v.integer(id, 'El cliente', 1));
    if (!c) {
      throw v.fail('Cliente no encontrado.', 404);
    }
    if (isCashier && !c.estado) {
      throw v.fail('El cliente se encuentra inactivo.', 403);
    }
    return c;
  }

  async findByDocument(numero, id_tipo = null, isCashier = false) {
    let document = v.text(numero, 'El documento', 20);
    let typeId = null;
    if (id_tipo) {
      typeId = v.integer(id_tipo, 'El tipo de documento', 1);
      const type = (await catalogs.getDocumentTypes()).find((entry) => entry.id_tipo_documento === typeId);
      if (!type) throw v.fail('Tipo de documento inválido.');
      document = v.documentNumber(type.abreviatura, document);
    }
    const c = await repo.findByDocument(document, typeId);
    return !c || (isCashier && !c.estado) ? null : c;
  }

  async createClient(data, isCashier = false) {
    const id_tipo_documento = v.integer(
      data.id_tipo_documento,
      'El tipo de documento',
      1,
    );
    const tipo = (await catalogs.getDocumentTypes()).find(
      (t) => t.id_tipo_documento === id_tipo_documento,
    );
    if (!tipo) {
      throw v.fail('Tipo de documento inválido.');
    }
    const nombre_razon_social = v.clientName(data.nombre_razon_social, tipo.abreviatura);
    const numero_documento = this.validateDocumentFormat(
      tipo.abreviatura,
      data.numero_documento,
    );
    if (numero_documento === '00000000') {
      throw v.fail('El documento 00000000 está reservado para PÚBLICO GENERAL.');
    }
    if (await repo.findByDocument(numero_documento)) {
      throw v.fail('Ya existe un cliente registrado con este número de documento.');
    }
    return repo.findById(
      await repo.create({
        id_tipo_documento,
        numero_documento,
        nombre_razon_social,
        estado: isCashier ? true : v.active(data.estado),
      }),
    );
  }

  async updateClient(id, data) {
    const c = await this.getClientById(id);
    if (c.numero_documento === '00000000') {
      throw v.fail('PÚBLICO GENERAL es un registro protegido: no se puede modificar ni inactivar porque se utiliza en el punto de venta.', 409);
    }
    await repo.update(id, {
      nombre_razon_social: v.clientName(data.nombre_razon_social, c.tipo_documento),
      estado: v.active(data.estado, c.estado),
    });
    return repo.findById(id);
  }

  async getMetrics() {
    return repo.getMetrics();
  }
}
module.exports = new ClientService();
