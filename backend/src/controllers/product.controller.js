const productService = require('../services/product.service.js');

class ProductController {
  async list(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const { search, id_categoria, stock_alert, estado } = req.query;
      const products = await productService.listProducts(
        { search, id_categoria, stock_alert, estado },
        isCashier,
      );
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async searchForPOS(req, res, next) {
    try {
      const { term } = req.query;
      const products = await productService.searchForPOS(term);
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const product = await productService.getProductById(req.params.id, isCashier);
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        message: 'Producto registrado exitosamente.',
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await productService.getMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
