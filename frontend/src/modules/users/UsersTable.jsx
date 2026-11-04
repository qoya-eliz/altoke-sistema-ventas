export default function UsersTable({ currentUsers, openEdit }) {
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
            <th>NOMBRES</th>
            <th>APELLIDOS</th>
            <th>USUARIO</th>
            <th>ROL</th>
            <th>ESTADO</th>
            <th className="text-center">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((u) => (
            <tr key={u.id_usuario}>
              <td>
                <span className="badge bg-light text-dark border">
                  {u.tipo_documento}
                </span>
              </td>
              <td className="fw-semibold">{u.numero_documento}</td>
              <td>{u.nombres}</td>
              <td>{u.apellidos}</td>
              <td className="fw-bold" style={{ color: '#45131a' }}>
                @{u.nom_usuario}
              </td>
              <td>
                <span
                  className={`badge ${u.rol === 'Administrador' ? 'bg-primary' : 'bg-secondary'}`}
                >
                  {u.rol}
                </span>
              </td>
              <td>
                <span className={`status-pill ${u.estado ? 'active' : 'inactive'}`}>
                  {u.estado ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-warning py-0 px-2"
                  onClick={() => openEdit(u)}
                  title="Editar usuario"
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
