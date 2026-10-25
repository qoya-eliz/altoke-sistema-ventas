import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../components/ValidatedFields.jsx';
import StatCard from '../../components/StatCard.jsx';
import {
  SuccessModal,
  InactivationConfirmModal,
} from '../../components/ActionModals.jsx';
import UserForm from './UserForm.jsx';
import UsersTable from './UsersTable.jsx';
import useUsers from './useUsers.js';
export default function UsersAdmin() {
  const {
    users,
    metrics,
    roles,
    docTypes,
    search,
    setSearch,
    idRol,
    setIdRol,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    createForm,
    setCreateForm,
    showCreatePass,
    setShowCreatePass,
    editForm,
    setEditForm,
    showEditPass,
    setShowEditPass,
    requestAction,
    createBaseline,
    setCreateBaseline,
    editBaseline,
    modalError,
    setModalError,
    successToast,
    setSuccessToast,
    loadError,
    saving,
    confirmInactive,
    setConfirmInactive,
    currentPage,
    setCurrentPage,
    fetchData,
    getUsernamePreview,
    handleCreateSubmit,
    openEdit,
    handleEditSubmit,
    currentUsers,
    totalPages,
  } = useUsers();
  return (
    <div className="page-content" aria-busy={saving}>
      {loadError && (
        <div className="alert alert-danger" role="alert">
          {loadError}{' '}
          <button className="btn btn-sm btn-outline-danger" onClick={() => fetchData()}>
            Reintentar
          </button>
        </div>
      )}
      <SuccessModal
        isOpen={!!successToast}
        title="Operación completada"
        message={successToast}
        onClose={() => setSuccessToast('')}
      />
      <InactivationConfirmModal
        entity="usuario"
        title={
          String(editForm.id_rol) !== String(editingUser?.id_rol)
            ? 'Cambiar rol de usuario'
            : 'Inactivar usuario'
        }
        confirmLabel={
          String(editForm.id_rol) !== String(editingUser?.id_rol)
            ? 'Cambiar rol'
            : 'Inactivar'
        }
        message={
          String(editForm.id_rol) !== String(editingUser?.id_rol)
            ? `${roles.find((r) => String(r.id_rol) === String(editingUser?.id_rol))?.nombre || 'Rol actual'} → ${roles.find((r) => String(r.id_rol) === String(editForm.id_rol))?.nombre || 'Nuevo rol'}. Cambiarán sus permisos.${!editForm.estado ? ' Además, no podrá acceder al sistema.' : ''}`
            : 'No podrá acceder al sistema.'
        }
        isOpen={confirmInactive}
        itemName={editingUser?.nom_usuario}
        onCancel={() => setConfirmInactive(false)}
        onConfirm={() => {
          setConfirmInactive(false);
          handleEditSubmit({ preventDefault() {} }, true);
        }}
      />

      {/* Tarjeta de Filtros */}
      <div className="filter-card">
        <ValidatedForm
          busy={saving}
          serverError={modalError}
          onChangeCapture={() => setModalError('')}
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
        >
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-muted mb-1">
                Buscar personal
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <ValidatedInput
                  name="search"
                  type="text"
                  className="form-control"
                  placeholder="Buscar por documento (DNI/RUC/CE), nombre o usuario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">Rol</label>
              <ValidatedSelect
                name="idRol"
                className="form-select form-select-sm"
                value={idRol}
                onChange={(e) => setIdRol(e.target.value)}
              >
                <option value="">Todos</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">
                Estado
              </label>
              <ValidatedSelect
                name="estadoFilter"
                className="form-select form-select-sm"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </ValidatedSelect>
            </div>

            <div className="col-md-2 d-flex gap-1">
              <button
                type="submit"
                className="btn btn-gold btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
              >
                <i className="bi bi-funnel"></i>
                <span>Aplicar filtros</span>
              </button>
              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={() => {
                  setSearch('');
                  setIdRol('');
                  setEstadoFilter('');
                  fetchData({ search: '', id_rol: '', estado: '' });
                }}
                title="Limpiar"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </ValidatedForm>
      </div>

      {/* 3 Tarjetas de Métricas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard
            label="TOTAL USUARIOS"
            value={metrics.total_usuarios || 0}
            subtext="Colaboradores registrados en el sistema"
            icon="bi-people"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            label="PERSONAL ACTIVO"
            value={metrics.personal_activo || 0}
            subtext="Usuarios autorizados con acceso activo"
            icon="bi-person-check"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            label="ROLES CONFIGURADOS"
            value={metrics.roles_configurados || 0}
            subtext="Perfiles de acceso del sistema"
            icon="bi-shield-lock"
          />
        </div>
      </div>

      {/* Tabla Control de Accesos y Usuario */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-person-badge-fill me-2"></i>
            Control de accesos y usuario
          </h6>
          <button
            className="btn btn-burgundy btn-sm d-flex align-items-center gap-1"
            onClick={() => {
              setModalError('');
              setCreateBaseline(createForm);
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-person-plus-fill"></i>
            <span>Registrar nuevo usuario</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <div className="small text-muted mt-2">Cargando personal...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">No se encontraron usuarios.</p>
          </div>
        ) : (
          <>
            <UsersTable currentUsers={currentUsers} openEdit={openEdit} />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-end align-items-center gap-2 mt-3 pt-2 border-top">
                <button
                  className="btn btn-sm btn-light border"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className={`btn btn-sm ${currentPage === pg ? 'btn-gold' : 'btn-light border'}`}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-light border"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Registrar Nuevo Usuario (Visual Reference 14) */}
      {showCreateModal && (
        <UserForm
          metrics={metrics}
          mode="create"
          saving={saving}
          requestAction={requestAction}
          setShowCreateModal={setShowCreateModal}
          createForm={createForm}
          createBaseline={createBaseline}
          modalError={modalError}
          setModalError={setModalError}
          handleCreateSubmit={handleCreateSubmit}
          setCreateForm={setCreateForm}
          docTypes={docTypes}
          roles={roles}
          getUsernamePreview={getUsernamePreview}
          showCreatePass={showCreatePass}
          setShowCreatePass={setShowCreatePass}
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          setEditForm={setEditForm}
          editingUser={editingUser}
          showEditPass={showEditPass}
          setShowEditPass={setShowEditPass}
        />
      )}

      {/* Modal Modificar Usuario (Visual Reference 15) */}
      {showEditModal && editingUser && (
        <UserForm
          metrics={metrics}
          mode="edit"
          saving={saving}
          requestAction={requestAction}
          setShowCreateModal={setShowCreateModal}
          createForm={createForm}
          createBaseline={createBaseline}
          modalError={modalError}
          setModalError={setModalError}
          handleCreateSubmit={handleCreateSubmit}
          setCreateForm={setCreateForm}
          docTypes={docTypes}
          roles={roles}
          getUsernamePreview={getUsernamePreview}
          showCreatePass={showCreatePass}
          setShowCreatePass={setShowCreatePass}
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          setEditForm={setEditForm}
          editingUser={editingUser}
          showEditPass={showEditPass}
          setShowEditPass={setShowEditPass}
        />
      )}
    </div>
  );
}
