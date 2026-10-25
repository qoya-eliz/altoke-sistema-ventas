import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../components/ValidatedFields.jsx';
export default function UserForm({
  mode,
  metrics,
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
  roles,
  getUsernamePreview,
  showCreatePass,
  setShowCreatePass,
  setShowEditModal,
  editForm,
  editBaseline,
  handleEditSubmit,
  setEditForm,
  editingUser,
  showEditPass,
  setShowEditPass,
}) {
  const lastAdmin = editingUser?.rol === 'Administrador' && Boolean(editingUser?.estado) && Number(metrics?.administradores_activos) === 1;
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
              REGISTRAR NUEVO USUARIO
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
                Ingresa los datos para agregar un nuevo usuario al sistema.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-bold">Tipo de documento *</label>
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
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Rol de Usuario *</label>
                  <ValidatedSelect
                    name="id_rol"
                    className="form-select form-select-sm"
                    value={createForm.id_rol}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, id_rol: e.target.value })
                    }
                    required
                  >
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>
                        {r.nombre}
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
                    placeholder="Ej. 61033518"
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

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Nombres *</label>
                  <ValidatedInput
                    name="nombres"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. Angeles"
                    value={createForm.nombres}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nombres: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Apellidos *</label>
                  <ValidatedInput
                    name="apellidos"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. Aguilar Vila"
                    value={createForm.apellidos}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, apellidos: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Nombre de Usuario *</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light text-muted">@</span>
                    <ValidatedInput
                      type="text"
                      className="form-control bg-light"
                      value={getUsernamePreview(createForm.nombres, createForm.apellidos)}
                      disabled
                      title="Se generará automáticamente con la 1ra letra del nombre + apellido paterno"
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Generado automáticamente según el nombre y apellido.
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Contraseña *</label>
                  <div className="input-group input-group-sm">
                    <ValidatedInput
                      name="password"
                      type={showCreatePass ? 'text' : 'password'}
                      minLength={8}
                      autoComplete="new-password"
                      className="form-control"
                      placeholder="••••••••"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light text-muted"
                      aria-label={
                        showCreatePass ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                      onClick={() => setShowCreatePass(!showCreatePass)}
                    >
                      <i
                        className={`bi ${showCreatePass ? 'bi-eye-slash' : 'bi-eye'}`}
                      ></i>
                    </button>
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.
                  </small>
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
                Guardar Usuario
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
              EDITAR DATOS DEL USUARIO
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
                Gestiona los accesos, credenciales y roles para el personal del
                minimarket.
              </p>

              {modalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{modalError}</div>
                </div>
              )}

              {lastAdmin && (
                <div className="alert alert-warning small" role="status">
                  Es el último administrador activo. Para cambiar su rol o inactivarlo, primero habilite a otro administrador.
                </div>
              )}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    Rol de Usuario *
                  </label>
                  <ValidatedSelect
                    name="id_rol"
                    className="form-select form-select-sm"
                    value={editForm.id_rol}
                    disabled={lastAdmin}
                    onChange={(e) => setEditForm({ ...editForm, id_rol: e.target.value })}
                    required
                  >
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>
                        {r.nombre}
                      </option>
                    ))}
                  </ValidatedSelect>
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
                          String(editingUser.id_tipo_documento),
                      )?.abreviatura || editingUser.id_tipo_documento
                    }
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={editingUser.numero_documento}
                    disabled
                    title="Campo bloqueado"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Nombres *</label>
                  <ValidatedInput
                    name="nombres"
                    type="text"
                    className="form-control form-control-sm"
                    value={editForm.nombres}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombres: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Apellidos *</label>
                  <ValidatedInput
                    name="apellidos"
                    type="text"
                    className="form-control form-control-sm"
                    value={editForm.apellidos}
                    onChange={(e) =>
                      setEditForm({ ...editForm, apellidos: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    Nombre de Usuario *
                  </label>
                  <ValidatedInput
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={`@${editingUser.nom_usuario}`}
                    disabled
                    title="Campo bloqueado"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Nueva Contraseña (Opcional)
                  </label>
                  <div className="input-group input-group-sm">
                    <ValidatedInput
                      name="password"
                      type={showEditPass ? 'text' : 'password'}
                      minLength={8}
                      autoComplete="new-password"
                      className="form-control"
                      placeholder="Dejar en blanco para conservar"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm({ ...editForm, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light text-muted"
                      aria-label={
                        showEditPass ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                      onClick={() => setShowEditPass(!showEditPass)}
                    >
                      <i className={`bi ${showEditPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-2 p-3 bg-light rounded border">
                <label className="form-label small fw-bold mb-2">
                  Estado del Usuario *
                </label>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <ValidatedInput
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="userEstadoSwitch"
                    checked={editForm.estado}
                    disabled={lastAdmin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estado: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="userEstadoSwitch"
                    style={{ color: editForm.estado ? '#248A44' : '#D9383A' }}
                  >
                    {editForm.estado ? 'ACTIVO' : 'INACTIVO'}
                  </label>
                </div>
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  Los usuarios inactivos no podrán iniciar sesión en la caja.
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
                Guardar Usuario
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  );
}
