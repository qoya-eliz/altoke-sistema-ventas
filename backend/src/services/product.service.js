const repo = require('../repositories/product.repository.js');
const categories = require('../repositories/category.repository.js');
const v = require('../utils/validation.js');
const { LIMITS, MESSAGES, formatInternalCode } = require('../../../shared/validation-catalog.js');

class ProductService {
  async listProducts(filters, isCashier = false) {
    return repo.findAll({ ...filters, onlyActive: isCashier });
  }

  async searchForPOS(term) {
    if (typeof term !== 'string' || !term.trim()) {
      return [];
    }
    const found = await repo.searchActive(term);
    if (!found.length) {
      // Código exacto de un producto desactivado: se avisa en lugar de "sin resultados".
      const clean = term.trim();
      let exact = null;
      if (/^\d{13}$/.test(clean)) exact = await repo.findByBarcode(clean);
      else if (/^ALT-\d{4}$/i.test(clean)) exact = await repo.findByCode(clean.toUpperCase());
      if (exact && !exact.estado) throw v.fail(MESSAGES.productInactive, 409);
    }
    return found;
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
      'id_categoria',
    );
    const category = await categories.findById(id_categoria);
    if (!category || (!category.estado && id_categoria !== old?.id_categoria)) {
      throw v.fail('Seleccione una categoría activa.', 400, 'id_categoria');
    }
    if (data.cod_producto !== undefined) {
      throw v.fail(MESSAGES.internalCodeAuto, 400, 'cod_producto');
    }
    const codigo_barras = v.barcode(data.codigo_barras);
    const nombre = v.text(data.nombre, 'El nombre del producto', 150, 'nombre');
    const descripcion = v.description(data.descripcion);
    const precio_venta = v.money(data.precio_venta, 'El precio de venta', false, 'precio_venta') / 100;
    const stock = v.integer(data.stock, 'El stock', 0, 'stock');
    const stock_minimo = v.integer(
      data.stock_minimo ?? old?.stock_minimo ?? LIMITS.stock_minimo_default,
      'El stock mínimo',
      0,
      'stock_minimo',
    );
    if (!old && stock < stock_minimo) {
      throw v.fail(MESSAGES.stockBelowMin, 400, 'stock');
    }
    const existing = await repo.findByBarcode(codigo_barras);
    if (existing && existing.id_producto !== old?.id_producto) {
      throw v.fail(MESSAGES.barcodeDuplicate, 400, 'codigo_barras');
    }
    return {
      id_categoria,
      codigo_barras,
      nombre,
      descripcion,
      precio_venta,
      stock,
      stock_minimo,
      estado: v.active(data.estado, old?.estado ?? true),
    };
  }

  async createProduct(data) {
    const clean = await this.validated(data);
    clean.cod_producto = formatInternalCode(await repo.nextInternalNumber());
    return repo.findById(await repo.create(clean));
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
