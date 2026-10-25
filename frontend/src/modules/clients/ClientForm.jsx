import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../components/ValidatedFields.jsx';
export default function ClientForm({
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
  docTypes,
  setShowEditModal,
  editForm,
  editBaseline,
  handleEditSubmit,
  editingClient,
  setEditForm,
}) {
  const protectedClient = editingClient?.numero_documento === '00000000';
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
              <i className="bi bi-person-plus-fill me-2"></i>
              REGISTRAR NUEVO CLIENTE
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
                Ingresa los datos para registrar un cliente en la base de datos.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Tipo de Documento *</label>
                  <ValidatedSelect
                    name="id_tipo_documento"
                    className="form-select form-select-sm"
                    value={createForm.id_tipo_documento}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        id_tipo_documento: e.target.value,
                      })
                    }
                    required
                  >
                    {docTypes.map((t) => (
                      <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                        {t.abreviatura}
                      </option>
                    ))}
                  </ValidatedSelect>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">N° de Documento *</label>
                  <ValidatedInput
                    name="numero_documento"
                    documentType={
                      docTypes.find(
                        (t) =>
                          String(t.id_tipo_documento) ===
                          String(createForm.id_tipo_documento),
                      )?.abreviatura || createForm.id_tipo_documento
                    }
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. 71234567"
                    value={createForm.numero_documento}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        numero_documento: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombres y Apellidos / Razón Social *
                </label>
                <ValidatedInput
                  name="nombre_razon_social"
                  documentType={createForm.id_tipo_documento}
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej. Elsa Chuquiruna Aguilar"
                  value={createForm.nombre_razon_social}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      nombre_razon_social: e.target.value,
                    })
                  }
                  required
                />
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
                Guardar Cliente
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
              EDITAR DATOS DEL CLIENTE
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
                Modifica la información general o cambia el estado operativo del cliente.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    Tipo de Documento *
                  </label>
                  <ValidatedInput
                    name="tipo_documento"
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={editingClient.tipo_documento}
                    disabled
                    title="Campo bloqueado según especificación"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    N° de Documento *
                  </label>
                  <ValidatedInput
                    name="numero_documento"
                    documentType={
                      docTypes.find(
                        (t) =>
                          String(t.id_tipo_documento) ===
                          String(editingClient.id_tipo_documento),
                      )?.abreviatura || editingClient.id_tipo_documento
                    }
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={editingClient.numero_documento}
                    disabled
                    title="Campo bloqueado según especificación"
                  />
                </div>
              </div>

              {protectedClient && (
                <div className="alert alert-info small" role="status">
                  PÚBLICO GENERAL es un registro protegido. Su nombre, documento y estado se conservan para las ventas del POS.
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombre y Apellidos / Razón Social *
                </label>
                <ValidatedInput
                  name="nombre_razon_social"
                  documentType={editingClient.id_tipo_documento}
                  type="text"
                  className="form-control form-control-sm"
                  value={editForm.nombre_razon_social}
                  disabled={protectedClient}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre_razon_social: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3 p-3 bg-light rounded border">
                <label className="form-label small fw-bold mb-2">
                  Estado del Cliente *
                </label>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <ValidatedInput
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="clienteEstadoSwitch"
                    checked={editForm.estado}
                    disabled={protectedClient}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estado: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="clienteEstadoSwitch"
                    style={{ color: editForm.estado ? '#248A44' : '#D9383A' }}
                  >
                    {editForm.estado ? 'ACTIVO' : 'INACTIVO'}
                  </label>
                </div>
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  Si el cliente se inhabilita, no podrá realizar nuevas compras en el
                  sistema.
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
                disabled={saving || protectedClient}
                className="btn btn-burgundy btn-sm px-3"
              >
                Actualizar Cliente
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  );
}
