const categoryService = require('../services/category.service.js');

class CategoryController {
  async list(req, res, next) {
    try {
      const isCashier = req.user.rol === 'Cajero';
      const { search, estado } = req.query;
      const categories = await categoryService.listCategories(
        { search, estado },
        isCashier,
      );
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(
        req.params.id,
        req.user.rol === 'Cajero',
      );
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newCategory = await categoryService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        message: 'Categoría registrada exitosamente.',
        data: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await categoryService.updateCategory(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await categoryService.getMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
