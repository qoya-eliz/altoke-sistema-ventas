import { ValidatedInput } from '../../../components/ValidatedFields.jsx';
export default function ProductSearch({
  productQuery,
  handleProductSearchChange,
  isSearchingProducts,
  suggestions,
  addToCart,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <span className="small fw-bold text-dark d-flex align-items-center gap-1">
        <i className="bi bi-boxes text-danger"></i>
        Productos
      </span>
      <div className="position-relative" style={{ width: '65%' }}>
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted"></i>
          </span>
          <ValidatedInput
            name="productQuery"
            type="text"
            className="form-control"
            placeholder="Buscar producto por nombre o código..."
            value={productQuery}
            onChange={(e) => handleProductSearchChange(e.target.value)}
          />
        </div>

        {isSearchingProducts && <small role="status">Buscando productos…</small>}
        {/* Dropdown de Sugerencias Reactivas */}
        {suggestions.length > 0 && (
          <div
            className="list-group position-absolute w-100 shadow-lg mt-1 border"
            style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}
          >
            {suggestions.map((p) => (
              <button
                key={p.id_producto}
                type="button"
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                onClick={() => addToCart(p, new Date())}
              >
                <div>
                  <div className="fw-bold small">{p.nombre}</div>
                  <small className="text-muted">
                    Cód: {p.cod_producto} | Stock: {p.stock} uni
                  </small>
                </div>
                <span className="badge bg-danger rounded-pill fs-7">
                  S/ {Number(p.precio_venta).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
