import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
  ValidatedForm,
} from '../../components/ValidatedFields.jsx';
export default function ProductForm({
  mode,
  saving,
  requestAction,
  setShowCreateModal,
  createForm,
  createBaseline,
  modalError,
  setModalError,
  handleCreateSubmit,
  setCreateForm,
  categories,
  setShowEditModal,
  editForm,
  editBaseline,
  handleEditSubmit,
  setEditForm,
}) {
  return mode === 'create' ? (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: '12px' }}
        >
          <div className="modal-header custom-modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title m-0">
              <i className="bi bi-box-seam me-2"></i>
              REGISTRAR NUEVO PRODUCTO
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              disabled={saving}
              onClick={() =>
                requestAction(
                  () => setShowCreateModal(false),
                  JSON.stringify(createForm) !== JSON.stringify(createBaseline),
                )
              }
            ></button>
          </div>

          <ValidatedForm
            busy={saving}
            serverError={modalError}
            onChangeCapture={() => setModalError('')}
            onSubmit={handleCreateSubmit}
          >
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Ingresa los datos para registrar un nuevo producto en el catálogo.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Código de Barras *</label>
                  <ValidatedInput
                    name="cod_producto"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. 7750182006088"
                    value={createForm.cod_producto}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cod_producto: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Nombre del Producto *
                  </label>
                  <ValidatedInput
                    name="nombre"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. Coca-Cola Original 600ml"
                    value={createForm.nombre}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nombre: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Categoría *</label>
                  <ValidatedSelect
                    name="id_categoria"
                    className="form-select form-select-sm"
                    value={createForm.id_categoria}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, id_categoria: e.target.value })
                    }
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </ValidatedSelect>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Precio de Venta (S/) *
                  </label>
                  <ValidatedInput
                    name="precio_venta"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control form-control-sm"
                    placeholder="Ej. 3.80"
                    value={createForm.precio_venta}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, precio_venta: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Stock Inicial *</label>
                  <ValidatedInput
                    name="stock"
                    type="number"
                    min={Number(createForm.stock_minimo || 0)}
                    className="form-control form-control-sm"
                    placeholder="Ej: 50"
                    value={createForm.stock}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, stock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Stock Mínimo *</label>
                  <ValidatedInput
                    name="stock_minimo"
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    placeholder="Ej:5"
                    value={createForm.stock_minimo}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, stock_minimo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">Descripción (Opcional)</label>
                <ValidatedTextarea
                  name="descripcion"
                  className="form-control form-control-sm"
                  rows="2"
                  placeholder="Presentación, características..."
                  value={createForm.descripcion}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, descripcion: e.target.value })
                  }
                ></ValidatedTextarea>
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={saving}
                onClick={() =>
                  requestAction(
                    () => setShowCreateModal(false),
                    JSON.stringify(createForm) !== JSON.stringify(createBaseline),
                  )
                }
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-burgundy btn-sm px-3"
              >
                Guardar Producto
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: '12px' }}
        >
          <div className="modal-header custom-modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title m-0">
              <i className="bi bi-pencil-square me-2"></i>
              EDITAR DATOS DEL PRODUCTO
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              disabled={saving}
              onClick={() =>
                requestAction(
                  () => setShowEditModal(false),
                  JSON.stringify(editForm) !== JSON.stringify(editBaseline),
                )
              }
            ></button>
          </div>

          <ValidatedForm
            busy={saving}
            serverError={modalError}
            onChangeCapture={() => setModalError('')}
            onSubmit={handleEditSubmit}
          >
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Modifica los detalles del producto para actualizar el catálogo e
                inventario.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Código de Barras *</label>
                  <ValidatedInput
                    name="cod_producto"
                    type="text"
                    className="form-control form-control-sm"
                    value={editForm.cod_producto}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cod_producto: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Nombre del Producto *
                  </label>
                  <ValidatedInput
                    name="nombre"
                    type="text"
                    className="form-control form-control-sm"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Categoría *</label>
                  <ValidatedSelect
                    name="id_categoria"
                    className="form-select form-select-sm"
                    value={editForm.id_categoria}
                    onChange={(e) =>
                      setEditForm({ ...editForm, id_categoria: e.target.value })
                    }
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </ValidatedSelect>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Precio de Venta (S/) *
                  </label>
                  <ValidatedInput
                    name="precio_venta"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control form-control-sm"
                    value={editForm.precio_venta}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precio_venta: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Stock Actual *</label>
                  <ValidatedInput
                    name="stock"
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Stock Mínimo *</label>
                  <ValidatedInput
                    name="stock_minimo"
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    value={editForm.stock_minimo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock_minimo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Descripción (Opcional)</label>
                <ValidatedTextarea
                  name="descripcion"
                  className="form-control form-control-sm"
                  rows="2"
                  value={editForm.descripcion}
                  onChange={(e) =>
                    setEditForm({ ...editForm, descripcion: e.target.value })
                  }
                ></ValidatedTextarea>
              </div>

              <div className="mb-2 p-3 bg-light rounded border">
                <label className="form-label small fw-bold mb-2">
                  Estado del Producto *
                </label>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <ValidatedInput
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="prodEstadoSwitch"
                    checked={editForm.estado}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estado: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="prodEstadoSwitch"
                    style={{ color: editForm.estado ? '#248A44' : '#D9383A' }}
                  >
                    {editForm.estado ? 'ACTIVO' : 'INACTIVO'}
                  </label>
                </div>
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  Si el producto está inactivo, no aparecerá en la lista de ventas ni en
                  el catálogo de caja.
                </small>
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={saving}
                onClick={() =>
                  requestAction(
                    () => setShowEditModal(false),
                    JSON.stringify(editForm) !== JSON.stringify(editBaseline),
                  )
                }
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-burgundy btn-sm px-3"
              >
                Actualizar Producto
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  );
}
