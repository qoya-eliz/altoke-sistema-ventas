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
import CategoryForm from './CategoryForm.jsx';
import CategoriesTable from './CategoriesTable.jsx';
import useCategories from './useCategories.js';
export default function CategoriesAdmin() {
  const {
    categories,
    metrics,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingCategory,
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
    currentCategories,
    totalPages,
  } = useCategories();
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
        entity="categoría"
        isOpen={confirmInactive}
        itemName={editingCategory?.nombre}
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
            <div className="col-md-7">
              <label className="form-label small fw-semibold text-muted mb-1">
                Buscar categoría
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <ValidatedInput
                  name="search"
                  type="text"
                  className="form-control"
                  placeholder="Buscar Categoría..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                Estado
              </label>
              <ValidatedSelect
                name="estadoFilter"
                className="form-select form-select-sm"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todas (Activas / Inactivas)</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
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
              {/* DE AQUI ESTOY SACANDO */}
              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={() => {
                  setSearch('');
                  setEstadoFilter('');
                  fetchData({ search: '', estado: '' });
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
            label="TOTAL CATEGORÍAS"
            value={`${metrics.total_familias || 0} Familias`}
            subtext="Líneas registradas en el minimarket"
            icon="bi-collection"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            label="CATEGORÍAS ACTIVAS"
            value={`${metrics.categorias_activas || 0} Visibles`}
            subtext="Disponibles en punto de venta y catálogo"
            icon="bi-eye"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            label="CATEGORÍA MÁS VENDIDA"
            value={metrics.categoria_mas_vendida || '—'}
            subtext="Línea líder en preferencia de clientes"
            icon="bi-star-fill"
          />
        </div>
      </div>

      {/* Tabla Familia de Productos */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-collection-fill me-2"></i>
            Familia de productos
          </h6>
          <button
            className="btn btn-burgundy btn-sm d-flex align-items-center gap-1"
            onClick={() => {
              setModalError('');
              setCreateBaseline(createForm);
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Registrar nueva categoría</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <div className="small text-muted mt-2">Cargando categorías...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">No se encontraron categorías registradas.</p>
          </div>
        ) : (
          <>
            <CategoriesTable currentCategories={currentCategories} openEdit={openEdit} />

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

      {/* Modal Registrar Categoría (Visual Reference 11) */}
      {showCreateModal && (
        <CategoryForm
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
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          setEditForm={setEditForm}
        />
      )}

      {/* Modal Modificar Categoría (Visual Reference 12) */}
      {showEditModal && editingCategory && (
        <CategoryForm
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
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          setEditForm={setEditForm}
        />
      )}
    </div>
  );
}
