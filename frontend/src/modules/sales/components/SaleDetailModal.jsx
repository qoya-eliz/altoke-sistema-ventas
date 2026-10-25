export default function DetailModal({ sale, onClose, onPrint }) {
  if (!sale) {
    return null;
  }

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
          {/* Header */}
          <div className="modal-header custom-modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title m-0">
              <i className="bi bi-receipt"></i>
              Detalle del Comprobante {sale.serie_comprobante}-{sale.numero_comprobante}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-2"><span className={`badge ${sale.estado === 'ANULADA' ? 'bg-danger' : 'bg-success'}`}>{sale.estado || 'COMPLETADA'}</span></div>
            <div className="text-muted small mb-3">
              <i className="bi bi-clock me-1"></i>
              Emitido el: {new Date(sale.fecha_hora_fin).toLocaleString('es-PE')}
            </div>

            {/* Cuadro Cliente */}
            <div
              className="p-3 mb-3"
              style={{
                background: '#F8F5F2',
                borderRadius: '8px',
                border: '1px solid #E8DED8',
              }}
            >
              <div className="fw-bold" style={{ color: '#45131a', fontSize: '0.85rem' }}>
                CLIENTE:
              </div>
              <div className="fw-semibold text-dark">{sale.cliente_nombre}</div>
              <div className="small text-muted">
                {sale.cliente_tipo_documento || 'DOC'}: {sale.cliente_documento}
              </div>
            </div>

            {/* Tabla Ítems */}
            <div className="table-responsive mb-3">
              <table
                className="table table-sm align-middle mb-0"
                style={{ fontSize: '0.82rem' }}
              >
                <thead style={{ background: '#f5f0eb' }}>
                  <tr>
                    <th className="text-center" style={{ width: '45px' }}>
                      CANT
                    </th>
                    <th>PRODUCTO</th>
                    <th className="text-end" style={{ width: '75px' }}>
                      P.U.
                    </th>
                    <th className="text-end" style={{ width: '80px' }}>
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-center fw-bold">{item.cantidad}</td>
                      <td>{item.producto_nombre}</td>
                      <td className="text-end">
                        S/ {Number(item.precio_unitario).toFixed(2)}
                      </td>
                      <td className="text-end fw-semibold">
                        S/ {Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales y Pago */}
            <div className="p-3" style={{ background: '#FAF7F4', borderRadius: '8px' }}>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Método de Pago:</span>
                <span className="fw-bold text-dark">{sale.metodo_pago}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Base Imponible / Subtotal:</span>
                <span>S/ {Number(sale.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Monto IGV (18%):</span>
                <span>S/ {Number(sale.monto_igv).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Monto Recibido:</span>
                <span>S/ {Number(sale.monto_recibido).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Vuelto Entregado:</span>
                <span>S/ {Number(sale.vuelto).toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-6" style={{ color: '#45131a' }}>
                  {sale.estado === 'ANULADA' ? 'Importe del comprobante:' : 'Total Cobrado:'}
                </span>
                <span className="fw-bold fs-5" style={{ color: '#248A44' }}>
                  S/ {Number(sale.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-between">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
              Cerrar
            </button>
            <button
              className="btn btn-gold btn-sm px-3 d-flex align-items-center gap-2"
              onClick={() => onPrint(sale)}
            >
              <i className="bi bi-printer"></i>
              <span>Imprimir Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
