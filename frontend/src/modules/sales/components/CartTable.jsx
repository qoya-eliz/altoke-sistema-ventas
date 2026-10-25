export default function CartTable({
  cart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
}) {
  return (
    <div className="table-responsive mb-3" style={{ minHeight: '260px' }}>
      <table
        className="table table-hover align-middle mb-0"
        style={{ fontSize: '0.85rem' }}
      >
        <thead style={{ backgroundColor: '#FAF5EE' }}>
          <tr style={{ color: '#45131a' }}>
            <th>CÓDIGO</th>
            <th>PRODUCTO</th>
            <th className="text-center" style={{ width: '130px' }}>
              CANTIDAD
            </th>
            <th className="text-end" style={{ width: '90px' }}>
              P. UNIT
            </th>
            <th className="text-end" style={{ width: '95px' }}>
              P. TOTAL
            </th>
            <th className="text-center" style={{ width: '60px' }}>
              ACCIÓN
            </th>
          </tr>
        </thead>
        <tbody>
          {cart.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-5 text-muted">
                <i className="bi bi-cart-x fs-2"></i>
                <p className="mt-2 mb-0">El carrito de compras está vacío.</p>
                <small>
                  Busca y selecciona productos arriba para agregarlos a la venta.
                </small>
              </td>
            </tr>
          ) : (
            cart.map((item) => (
              <tr key={item.id_producto}>
                <td className="text-muted small">{item.cod_producto}</td>
                <td className="fw-semibold">{item.nombre}</td>
                <td className="text-center">
                  <div className="d-inline-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      onClick={() => decreaseQuantity(item.id_producto)}
                    >
                      -
                    </button>
                    <span className="fw-bold px-2">{item.cantidad}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-gold py-0 px-2 fw-bold"
                      onClick={() => increaseQuantity(item.id_producto)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="text-end">S/ {item.precio_venta.toFixed(2)}</td>
                <td className="text-end fw-bold" style={{ color: '#45131a' }}>
                  S/ {item.subtotal.toFixed(2)}
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                    onClick={() => removeFromCart(item.id_producto)}
                    title="Quitar producto"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
