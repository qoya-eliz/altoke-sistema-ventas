const saleService = require('../services/sale.service.js');
const { generateSalesExcel } = require('../exports/salesReportExcel.js');
const {generateTicketPdf} = require('../exports/ticketPdf');
const {generateSalesReportPdf} = require('../exports/salesReportPdf');

class SaleController {
  // Procesar venta atómica desde POS

  async createSale(req, res, next) {
    try {
      const sale = await saleService.processSale(
        req.user.id_usuario,
        {
          ...req.body,
          clave_operacion: req.get('Idempotency-Key') || req.body.clave_operacion,
        },
        req.user,
      );
      return res.status(201).json({
        success: true,
        message: '¡Venta procesada y comprobante generado exitosamente!',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  // Ver detalle de una venta por ID

  async getById(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const sale = await saleService.getSaleById(req.params.id, isCashier);
      return res.status(200).json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  // Listado de ventas con filtros (Admin Reporte o Cajero Historial)

  async list(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      } = req.query;

      const sales = await saleService.listSales(
        {
          desde,
          hasta,
          id_tipo_comprobante,
          id_metodo_pago,
          id_categoria,
          id_usuario,
          search,
          estado,
        },
        isCashier,
      );

      return res.status(200).json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }

  // Métricas del reporte de ventas

  async getMetrics(req, res, next) {
    try {
      const {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      } = req.query;

      const metrics = await saleService.getMetrics({
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      });

      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  // Exportar reporte de ventas a Excel

  async exportExcel(req, res, next) {
    try {
      const {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      } = req.query;

      const filters = {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      };
      const [sales, metrics] = await Promise.all([
        saleService.listSales(filters, false),
        saleService.getMetrics(filters),
      ]);

      const buffer = await generateSalesExcel(sales, metrics);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_ventas_${Date.now()}.xlsx`,
      );
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Exportar reporte de ventas a PDF

  async exportPdf(req, res, next) {
    try {
      const {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      } = req.query;

      const filters = {
        desde,
        hasta,
        id_tipo_comprobante,
        id_metodo_pago,
        id_categoria,
        id_usuario,
        search,
        estado,
      };
      const [sales, metrics] = await Promise.all([
        saleService.listSales(filters, false),
        saleService.getMetrics(filters),
      ]);

      const buffer = await generateSalesReportPdf(sales, metrics);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_ventas_${Date.now()}.pdf`,
      );
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Generar ticket térmico PDF de 80mm

  async printTicketPdf(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const sale = await saleService.getSaleById(req.params.id, isCashier);
      const buffer = await generateTicketPdf(sale);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename=ticket_${sale.serie_comprobante}_${sale.numero_comprobante}.pdf`,
      );
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SaleController();
