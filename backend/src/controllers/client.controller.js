const clientService = require('../services/client.service.js');

class ClientController {
  async list(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const { search, id_tipo_documento, estado } = req.query;
      const clients = await clientService.listClients(
        { search, id_tipo_documento, estado },
        isCashier,
      );
      return res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const client = await clientService.getClientById(req.params.id, isCashier);
      return res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  async findByDocument(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const { numero, id_tipo } = req.query;
      if (!numero) {
        return res.status(400).json({
          success: false,
          message: 'Debe ingresar el número de documento a buscar.',
        });
      }
      const client = await clientService.findByDocument(numero, id_tipo, isCashier);
      if (!client) {
        return res.status(200).json({
          success: true,
          found: false,
          message: 'Cliente no registrado',
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        found: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newClient = await clientService.createClient(
        req.body,
        req.user.rol === 'Cajero',
      );
      return res.status(201).json({
        success: true,
        message: 'Cliente registrado exitosamente.',
        data: newClient,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await clientService.updateClient(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Datos del cliente actualizados exitosamente.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await clientService.getMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();
