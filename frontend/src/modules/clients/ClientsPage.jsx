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
import ClientForm from './ClientForm.jsx';
import ClientsTable from './ClientsTable.jsx';
import useClients from './useClients.js';
export default function Clients() {
  const {
    isAdmin,
    clients,
    metrics,
    docTypes,
    search,
    setSearch,
    idTipoDoc,
    setIdTipoDoc,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingClient,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
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
    handleCreateSubmit,
    openEdit,
    handleEditSubmit,
    currentClients,
    totalPages,
  } = useClients();
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
        entity="cliente"
        isOpen={confirmInactive}
        itemName={editingClient?.nombre_razon_social}
        onCancel={() => setConfirmInactive(false)}
        onConfirm={() => {
          setConfirmInactive(false);
          handleEditSubmit({ preventDefault() {} }, true);
        }}
      />

      {/* Alerta de Éxito Flotante */}

      {/* Barra de Búsqueda y Filtros */}
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
                Buscar cliente
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <ValidatedInput
                  name="search"
                  type="text"
                  className="form-control"
                  placeholder="Buscar por documento (DNI/RUC/CE) o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                Tipo de Documento
              </label>
              <ValidatedSelect
                name="idTipoDoc"
                className="form-select form-select-sm"
                value={idTipoDoc}
                onChange={(e) => setIdTipoDoc(e.target.value)}
              >
                <option value="">Todos</option>
                {docTypes.map((t) => (
                  <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                    {t.abreviatura} - {t.descripcion}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            {isAdmin && (
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
            )}

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
                  setIdTipoDoc('');
                  setEstadoFilter('');
                  fetchData({ search: '', id_tipo_documento: '', estado: '' });
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
      {isAdmin && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <StatCard
              label="TOTAL CLIENTES"
              value={metrics.total_clientes || 0}
              subtext="Clientes registrados en el sistema"
              icon="bi-people"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="CLIENTES ACTIVOS"
              value={metrics.clientes_activos || 0}
              subtext="Habilitados para compras"
              icon="bi-person-check"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="CLIENTES GENÉRICOS"
              value={metrics.clientes_genericos || 0}
              subtext="Público General para ventas rápidas"
              icon="bi-person-badge"
            />
          </div>
        </div>
      )}

      {/* Tabla Registro General de Clientes */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-person-lines-fill me-2"></i>
            {isAdmin ? 'Registro general de clientes' : 'Clientes activos'}
          </h6>
          {isAdmin && (
            <button
              className="btn btn-burgundy btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                setModalError('');
                setCreateBaseline(createForm);
                setShowCreateModal(true);
              }}
            >
              <i className="bi bi-person-plus-fill"></i>
              <span>Nuevo Cliente</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <div className="small text-muted mt-2">Cargando clientes...</div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">No se encontraron clientes.</p>
          </div>
        ) : (
          <>
            <ClientsTable
              isAdmin={isAdmin}
              currentClients={currentClients}
              openEdit={openEdit}
            />

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

      {/* Modal Registrar Nuevo Cliente (Visual Reference 5) */}
      {showCreateModal && (
        <ClientForm
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
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          editingClient={editingClient}
          setEditForm={setEditForm}
        />
      )}

      {/* Modal Editar Datos del Cliente (Visual Reference 6) */}
      {showEditModal && editingClient && (
        <ClientForm
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
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          editingClient={editingClient}
          setEditForm={setEditForm}
        />
      )}
    </div>
  );
}
