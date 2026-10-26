const repo = require('../repositories/product.repository.js');
const categories = require('../repositories/category.repository.js');
const v = require('../utils/validation.js');

class ProductService {
  async listProducts(filters, isCashier = false) {
    return repo.findAll({ ...filters, onlyActive: isCashier });
  }

  async searchForPOS(term) {
    if (typeof term !== 'string' || !term.trim()) {
      return [];
    }
    return repo.searchActive(term);
  }

  async getProductById(id, isCashier = false) {
    const p = await repo.findById(v.integer(id, 'El producto', 1));
    if (!p) {
      throw v.fail('Producto no encontrado.', 404);
    }
    if (isCashier && !p.estado) {
      throw v.fail('El producto no está disponible.', 403);
    }
    return p;
  }

  async validated(data, old = null) {
    const id_categoria = v.integer(
      data.id_categoria ?? old?.id_categoria,
      'La categoría',
      1,
    );
    const category = await categories.findById(id_categoria);
    if (!category || (!category.estado && id_categoria !== old?.id_categoria)) {
      throw v.fail('Seleccione una categoría activa.');
    }
    const cod_producto = v.text(data.cod_producto, 'El código de producto', 20);
    const nombre = v.text(data.nombre, 'El nombre del producto', 150);
    const descripcion = data.descripcion == null ? '' : String(data.descripcion).trim();
    if (descripcion.length > 255) {
      throw v.fail('La descripción admite hasta 255 caracteres.');
    }
    const precio_venta = v.money(data.precio_venta, 'El precio de venta', false) / 100;
    const stock = v.integer(data.stock, 'El stock');
    const stock_minimo = v.integer(data.stock_minimo ?? old?.stock_minimo ?? 3, 'El stock mínimo');
    if (!old && stock < stock_minimo) {
      throw v.fail('El stock inicial debe ser mayor o igual al stock mínimo.');
    }
    const existing = await repo.findByCode(cod_producto);
    if (existing && existing.id_producto !== old?.id_producto) {
      throw v.fail('Ya existe un producto registrado con este código de barras.');
    }
    return {
      id_categoria,
      cod_producto,
      nombre,
      descripcion,
      precio_venta,
      stock,
      stock_minimo,
      estado: v.active(data.estado, old?.estado ?? true),
    };
  }

  async createProduct(data) {
    return repo.findById(await repo.create(await this.validated(data)));
  }

  async updateProduct(id, data) {
    const old = await this.getProductById(id);
    const clean = await this.validated(data, old);
    const original = v.integer(data.stock_original, 'El stock original');
    clean.actualizar_stock = clean.stock !== original;
    clean.stock_original = original;
    if (!(await repo.update(id, clean))) {
      throw v.fail(
        'El stock cambió durante la edición. Cierre el formulario, actualice la lista y vuelva a editar.',
        409,
      );
    }
    return repo.findById(id);
  }

  async getMetrics() {
    return repo.getMetrics();
  }
}

module.exports = new ProductService();
