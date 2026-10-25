import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../../components/ValidatedFields.jsx';
export default function PosClientDialog({
  savingClient,
  requestAction,
  setShowClientModal,
  clientModalForm,
  clientModalError,
  setClientModalError,
  handleCreateClientModal,
  setClientModalForm,
  docTypes,
}) {
  return (
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
              disabled={savingClient}
              onClick={() =>
                requestAction(
                  () => setShowClientModal(false),
                  String(clientModalForm.id_tipo_documento) !== '1' ||
                    Object.entries(clientModalForm).some(
                      ([key, value]) =>
                        key !== 'id_tipo_documento' && String(value).trim(),
                    ),
                )
              }
            ></button>
          </div>

          <ValidatedForm
            busy={savingClient}
            serverError={clientModalError}
            onChangeCapture={() => setClientModalError('')}
            onSubmit={handleCreateClientModal}
          >
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Ingresa los datos para registrar y asociar al cliente a la venta actual.
              </p>

              {clientModalError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
                  <div>{clientModalError}</div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Tipo de Documento *</label>
                  <ValidatedSelect
                    name="id_tipo_documento"
                    className="form-select form-select-sm"
                    value={clientModalForm.id_tipo_documento}
                    onChange={(e) =>
                      setClientModalForm({
                        ...clientModalForm,
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
                          String(clientModalForm.id_tipo_documento),
                      )?.abreviatura || clientModalForm.id_tipo_documento
                    }
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. 61033518"
                    value={clientModalForm.numero_documento}
                    onChange={(e) =>
                      setClientModalForm({
                        ...clientModalForm,
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
                  documentType={clientModalForm.id_tipo_documento}
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej. Elsa Chuquiruna Aguilar"
                  value={clientModalForm.nombre_razon_social}
                  onChange={(e) =>
                    setClientModalForm({
                      ...clientModalForm,
                      nombre_razon_social: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="alert alert-light border small text-muted mb-0">
                <i className="bi bi-info-circle me-1 text-primary"></i>
                El cliente registrado se asociará automáticamente a la venta en curso.
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={savingClient}
                onClick={() =>
                  requestAction(
                    () => setShowClientModal(false),
                    String(clientModalForm.id_tipo_documento) !== '1' ||
                      Object.entries(clientModalForm).some(
                        ([key, value]) =>
                          key !== 'id_tipo_documento' && String(value).trim(),
                      ),
                  )
                }
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingClient}
                className="btn btn-burgundy btn-sm px-3"
              >
                Guardar y Asociar
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  );
}
