export default function ProductsTable({ isAdmin, currentProducts, openEdit }) {
  return (
    <div className="table-responsive">
      <table
        className="table table-hover align-middle mb-0"
        style={{ fontSize: '0.86rem' }}
      >
        <thead style={{ backgroundColor: '#FAF5EE' }}>
          <tr style={{ color: '#45131a' }}>
            <th>CÓDIGO</th>
            <th>NOMBRE DEL PRODUCTO</th>
            <th>CATEGORÍA</th>
            <th className="text-end">PRECIO VENTA</th>
            <th className="text-center">STOCK ACTUAL</th>
            <th className="text-center">STOCK MÍNIMO</th>
            <th>ESTADO</th>
            {isAdmin && <th className="text-center">ACCIONES</th>}
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((p) => {
            const isLowStock = p.stock <= p.stock_minimo;
            return (
              <tr key={p.id_producto}>
                <td className="fw-semibold text-muted">{p.cod_producto}</td>
                <td className="fw-bold text-dark">{p.nombre}</td>
                <td>
                  <span className="badge bg-light text-dark border">{p.categoria}</span>
                </td>
                <td className="text-end fw-bold">
                  S/ {Number(p.precio_venta).toFixed(2)}
                </td>
                <td className="text-center">
                  <span
                    className={`badge ${isLowStock ? 'bg-danger text-white' : 'bg-success text-white'}`}
                  >
                    {p.stock} uni
                  </span>
                </td>
                <td className="text-center text-muted">{p.stock_minimo} uni</td>
                <td>
                  <span className={`status-pill ${p.estado ? 'active' : 'inactive'}`}>
                    {p.estado ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-warning py-0 px-2"
                      onClick={() => openEdit(p)}
                      title="Editar producto"
                    >
                      <i className="bi bi-pencil-square" style={{ color: '#b27a20' }}></i>
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
