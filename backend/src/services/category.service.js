const categoryRepository = require('../repositories/category.repository.js');
const { text, active, integer, fail } = require('../utils/validation.js');

class CategoryService {
  async listCategories(filters, isCashier = false) {
    return await categoryRepository.findAll({
      ...filters,
      onlyActive: isCashier,
    });
  }

  async getCategoryById(id, isCashier = false) {
    const category = await categoryRepository.findById(integer(id, 'La categoría', 1));
    if (!category) {
      const error = new Error('Categoría no encontrada.');
      error.status = 404;
      throw error;
    }
    if (isCashier && !category.estado) {
      throw fail('Acceso no permitido: la categoría se encuentra inactiva.', 403);
    }
    return category;
  }

  async createCategory(data) {
    const { descripcion, estado } = data;
    const nombre = text(data.nombre, 'El nombre de la categoría', 100);
    if (
      descripcion != null &&
      (typeof descripcion !== 'string' || descripcion.length > 255)
    ) {
      throw Object.assign(new Error('La descripción admite hasta 255 caracteres.'), {
        status: 400,
      });
    }

    if (!nombre || !nombre.trim()) {
      const error = new Error('El nombre de la categoría es obligatorio.');
      error.status = 400;
      throw error;
    }

    const existing = await categoryRepository.findByName(nombre);
    if (existing) {
      const error = new Error('Ya existe una categoría con este nombre.');
      error.status = 400;
      throw error;
    }

    const newId = await categoryRepository.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      estado: active(estado),
    });

    return await categoryRepository.findById(newId);
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error('Categoría no encontrada.');
      error.status = 404;
      throw error;
    }

    const { descripcion, estado } = data;
    const nombre = text(data.nombre, 'El nombre de la categoría', 100);
    if (
      descripcion != null &&
      (typeof descripcion !== 'string' || descripcion.length > 255)
    ) {
      throw Object.assign(new Error('La descripción admite hasta 255 caracteres.'), {
        status: 400,
      });
    }
    if (!nombre || !nombre.trim()) {
      const error = new Error('El nombre de la categoría es obligatorio.');
      error.status = 400;
      throw error;
    }

    const existing = await categoryRepository.findByName(nombre, id);
    if (existing) {
      const error = new Error('Ya existe otra categoría con este nombre.');
      error.status = 400;
      throw error;
    }

    // Regla de Negocio: No se puede inactivar si tiene más de 0 productos asociados
    const targetEstado = active(estado, category.estado);
    if (!targetEstado) {
      const associatedProductsCount =
        await categoryRepository.countAssociatedProducts(id);
      if (associatedProductsCount > 0) {
        const error = new Error(
          `No se puede cambiar el estado a inactivo porque la categoría '${category.nombre}' tiene ${associatedProductsCount} producto(s) asociado(s). Reasigne o desactive los productos antes de inactivarla.`,
        );
        error.status = 400;
        throw error;
      }
    }

    await categoryRepository.update(id, {
      nombre: nombre.trim(),
      descripcion:
        descripcion !== undefined
          ? descripcion
            ? descripcion.trim()
            : null
          : category.descripcion,
      estado: targetEstado,
    });

    return await categoryRepository.findById(id);
  }

  async getMetrics() {
    return await categoryRepository.getMetrics();
  }
}


module.exports = new CategoryService();
