export default function CategoriesTable({ currentCategories, openEdit }) {
  return (
    <div className="table-responsive">
      <table
        className="table table-hover align-middle mb-0"
        style={{ fontSize: '0.86rem' }}
      >
        <thead style={{ backgroundColor: '#FAF5EE' }}>
          <tr style={{ color: '#45131a' }}>
            <th>NOMBRE DE LA CATEGORÍA</th>
            <th>DESCRIPCIÓN</th>
            <th className="text-center">PRODUCTOS ASOCIADOS</th>
            <th>ESTADO</th>
            <th className="text-center">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {currentCategories.map((c) => (
            <tr key={c.id_categoria}>
              <td className="fw-bold text-dark">{c.nombre}</td>
              <td className="text-muted small" style={{ maxWidth: '350px' }}>
                {c.descripcion || 'Sin descripción'}
              </td>
              <td className="text-center">
                <span className="badge bg-secondary">
                  {c.productos_asociados || 0} productos
                </span>
              </td>
              <td>
                <span className={`status-pill ${c.estado ? 'active' : 'inactive'}`}>
                  {c.estado ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-warning py-0 px-2"
                  onClick={() => openEdit(c)}
                  title="Editar categoría"
                >
                  <i className="bi bi-pencil-square" style={{ color: '#b27a20' }}></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
