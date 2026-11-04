import {
  ValidatedInput,
  ValidatedTextarea,
  ValidatedForm,
} from '../../components/ValidatedFields.jsx';
export default function CategoryForm({
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
              <i className="bi bi-collection me-2"></i>
              REGISTRAR CATEGORÍA
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
                Ingresa los datos para clasificar los productos del inventario.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombre de la categoría *
                </label>
                <ValidatedInput
                  name="nombre"
                  maxLength={100}
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej. Bebidas y Licores"
                  value={createForm.nombre}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">Descripción</label>
                <ValidatedTextarea
                  name="descripcion"
                  className="form-control form-control-sm"
                  rows="3"
                  placeholder="Ingresa una breve descripción de la categoría..."
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
                Guardar y Asociar
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
              EDITAR DATOS DE CATEGORÍA
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
                Editar los datos para clasificar los productos del inventario.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombre de la categoría *
                </label>
                <ValidatedInput
                  name="nombre"
                  maxLength={100}
                  type="text"
                  className="form-control form-control-sm"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Descripción</label>
                <ValidatedTextarea
                  name="descripcion"
                  className="form-control form-control-sm"
                  rows="3"
                  value={editForm.descripcion}
                  onChange={(e) =>
                    setEditForm({ ...editForm, descripcion: e.target.value })
                  }
                ></ValidatedTextarea>
              </div>

              <div className="mb-2 p-3 bg-light rounded border">
                <label className="form-label small fw-bold mb-2">
                  Estado de la Categoría *
                </label>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <ValidatedInput
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="catEstadoSwitch"
                    checked={editForm.estado}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estado: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="catEstadoSwitch"
                    style={{ color: editForm.estado ? '#248A44' : '#D9383A' }}
                  >
                    {editForm.estado ? 'ACTIVO' : 'INACTIVO'}
                  </label>
                </div>
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
                Actualizar datos
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  );
}
