const catalogService = require('../services/catalog.service.js');

class CatalogController {
  async getAllCatalogs(req, res, next) {
    try {
      const [roles, tiposDocumento, metodosPago, tiposComprobante] = await Promise.all([
        catalogService.getRoles(),
        catalogService.getDocumentTypes(),
        catalogService.getPaymentMethods(),
        catalogService.getVoucherTypes(),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          negocio: require('../config/business.js'),
          roles,
          tipos_documento: tiposDocumento,
          metodos_pago: metodosPago,
          tipos_comprobante: tiposComprobante,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();
