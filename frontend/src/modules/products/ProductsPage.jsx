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
import ProductForm from './ProductForm.jsx';
import ProductsTable from './ProductsTable.jsx';
import useProducts from './useProducts.js';
export default function Products() {
  const {
    isAdmin,
    products,
    metrics,
    categories,
    search,
    setSearch,
    idCategoria,
    setIdCategoria,
    estadoFilter,
    setEstadoFilter,
    stockAlert,
    setStockAlert,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingProduct,
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
    currentProducts,
    totalPages,
  } = useProducts();
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
        entity="producto"
        isOpen={confirmInactive}
        itemName={editingProduct?.nombre}
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
            <div className={isAdmin ? "col-md-3" : "col-md-5"}>
              <label className="form-label small fw-semibold text-muted mb-1">
                Buscar producto
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <ValidatedInput
                  name="search"
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                Categoría
              </label>
              <ValidatedSelect
                name="idCategoria"
                className="form-select form-select-sm"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">
                Alerta stock
              </label>
              <ValidatedSelect
                name="stockAlert"
                className="form-select form-select-sm"
                value={stockAlert}
                onChange={(e) => setStockAlert(e.target.value)}
              >
                <option value="">Todos (Normales y bajo)</option>
                <option value="bajo">Stock Bajo</option>
              </ValidatedSelect>
            </div>

            {isAdmin && (
              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="products-state-filter">Estado</label>
                <ValidatedSelect id="products-state-filter" name="estadoFilter" className="form-select form-select-sm" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
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
                  setIdCategoria('');
                  setStockAlert('');
                  setEstadoFilter('');
                  fetchData({
                    search: '',
                    id_categoria: '',
                    stock_alert: '',
                    estado: '',
                  });
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
              label="TOTAL PRODUCTOS"
              value={metrics.total_productos || 0}
              subtext="Artículos registrados en catálogo"
              icon="bi-box-seam"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="STOCK BAJO"
              value={metrics.stock_bajo || 0}
              subtext="Productos con stock igual o inferior al mínimo"
              icon="bi-exclamation-triangle"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="CATEGORÍAS ACTIVAS"
              value={`${metrics.categorias_activas || 0} Familias`}
              subtext="Líneas de productos vigentes"
              icon="bi-tags"
            />
          </div>
        </div>
      )}

      {/* Tabla Catálogo de Productos */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-boxes me-2"></i>
            Catálogos de Productos
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
              <i className="bi bi-plus-circle-fill"></i>
              <span>Registrar nuevo producto</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <div className="small text-muted mt-2">Cargando inventario...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">No se encontraron productos en el inventario.</p>
          </div>
        ) : (
          <>
            <ProductsTable
              isAdmin={isAdmin}
              currentProducts={currentProducts}
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

      {/* Modal Registrar Nuevo Producto (Visual Reference 8) */}
      {showCreateModal && (
        <ProductForm
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
          categories={categories}
          setShowEditModal={setShowEditModal}
          editForm={editForm}
          editBaseline={editBaseline}
          handleEditSubmit={handleEditSubmit}
          setEditForm={setEditForm}
        />
      )}

      {/* Modal Modificar Producto (Visual Reference 9) */}
      {showEditModal && editingProduct && (
        <ProductForm
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
          categories={categories}
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
