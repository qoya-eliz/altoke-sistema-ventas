import { ValidatedInput, ValidatedSelect } from '../../../components/ValidatedFields.jsx';
export default function ClientSelector({
  setClientModalError,
  setShowClientModal,
  selectedDocType,
  setSelectedDocType,
  setSelectedClient,
  setClientSearchStatus,
  docTypes,
  docNumber,
  setDocNumber,
  handleSearchClient,
  selectedClient,
  clientSearchStatus,
}) {
  return (
    <div className="filter-card mb-3 py-3 px-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small fw-bold text-dark d-flex align-items-center gap-1">
          <i className="bi bi-person text-danger"></i>
          Cliente
        </span>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm py-0 px-2 d-flex align-items-center gap-1"
          style={{ fontSize: '0.78rem' }}
          onClick={() => {
            setClientModalError('');
            setShowClientModal(true);
          }}
        >
          <i className="bi bi-person-plus"></i>
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="row g-2 align-items-center">
        <div className="col-md-3">
          <ValidatedSelect
            name="selectedDocType"
            className="form-select form-select-sm"
            value={selectedDocType}
            onChange={(e) => {
              setSelectedDocType(e.target.value);
              setSelectedClient(null);
              setClientSearchStatus('Verifique el documento antes de cobrar');
            }}
          >
            {docTypes.map((t) => (
              <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                {t.abreviatura}
              </option>
            ))}
          </ValidatedSelect>
        </div>

        <div className="col-md-4">
          <div className="input-group input-group-sm">
            <ValidatedInput
              name="docNumber"
              documentType={
                docTypes.find(
                  (t) => String(t.id_tipo_documento) === String(selectedDocType),
                )?.abreviatura || selectedDocType
              }
              type="text"
              className="form-control"
              placeholder="Nro de Documento"
              value={docNumber}
              onChange={(e) => {
                setDocNumber(e.target.value);
                setSelectedClient(null);
                setClientSearchStatus('Verifique el documento antes de cobrar');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchClient();
                }
              }}
            />
            <button
              className="btn btn-gold btn-sm"
              type="button"
              onClick={handleSearchClient}
              title="Buscar cliente"
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        <div className="col-md-5">
          <ValidatedInput
            type="text"
            className="form-control form-control-sm bg-light fw-bold"
            readOnly
            value={
              selectedClient
                ? selectedClient.nombre_razon_social
                : clientSearchStatus || 'Cliente no registrado'
            }
            style={{ color: selectedClient ? '#2A2523' : '#D9383A' }}
          />
        </div>
      </div>
      {clientSearchStatus && (
        <small
          className={`d-block mt-1 ${selectedClient ? 'text-success' : 'text-danger'}`}
          style={{ fontSize: '0.72rem' }}
        >
          {clientSearchStatus}
        </small>
      )}
    </div>
  );
}
