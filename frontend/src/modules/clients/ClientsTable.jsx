export default function ClientsTable({ isAdmin, currentClients, openEdit }) {
  return (
    <div className="table-responsive">
      <table
        className="table table-hover align-middle mb-0"
        style={{ fontSize: '0.86rem' }}
      >
        <thead style={{ backgroundColor: '#FAF5EE' }}>
          <tr style={{ color: '#45131a' }}>
            <th>TIPO DE DOCUMENTO</th>
            <th>N° DE DOCUMENTO</th>
            <th>CLIENTE</th>
            <th>ESTADO</th>
            <th>FECHA REGISTRO</th>
            {isAdmin && <th className="text-center">ACCIONES</th>}
          </tr>
        </thead>
        <tbody>
          {currentClients.map((c) => (
            <tr key={c.id_cliente}>
              <td>
                <span className="badge bg-light text-dark border">
                  {c.tipo_documento}
                </span>
              </td>
              <td className="fw-semibold">{c.numero_documento}</td>
              <td className="fw-bold text-dark">{c.nombre_razon_social}</td>
              <td>
                <span className={`status-pill ${c.estado ? 'active' : 'inactive'}`}>
                  {c.estado ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </td>
              <td className="text-muted">
                {c.created_at ? new Date(c.created_at).toLocaleDateString('es-PE') : '—'}
              </td>
              {isAdmin && (
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-warning py-0 px-2"
                    onClick={() => openEdit(c)}
                    title="Editar datos del cliente"
                  >
                    <i className="bi bi-pencil-square" style={{ color: '#b27a20' }}></i>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
