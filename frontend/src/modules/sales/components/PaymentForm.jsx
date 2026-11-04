import { ValidatedInput } from '../../../components/ValidatedFields.jsx';
export default function PaymentForm({
  subtotalAmount,
  igvAmount,
  totalAmount,
  voucherTypes,
  selectedVoucherType,
  setSelectedVoucherType,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  isCash,
  cart,
  montoRecibido,
  setMontoRecibido,
  changeAmount,
  handlePreCheckout,
}) {
  return (
    <div className="col-lg-4">
      <div className="content-card h-100 d-flex flex-column justify-content-between p-4">
        <div>
          <h6 className="fw-bold mb-3" style={{ color: '#45131a' }}>
            <i className="bi bi-receipt me-2"></i>
            Resumen de venta
          </h6>

          {/* Importes */}
          <div
            className="p-3 mb-3"
            style={{ backgroundColor: '#FAF5EE', borderRadius: '8px' }}
          >
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Subtotal:</span>
              <span className="fw-semibold">S/ {subtotalAmount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>IGV (18%):</span>
              <span className="fw-semibold">S/ {igvAmount.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold fs-6" style={{ color: '#45131a' }}>
                TOTAL:
              </span>
              <span className="fw-bold fs-4" style={{ color: '#248A44' }}>
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Selector de Comprobante */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted mb-1">
              <i className="bi bi-file-text me-1"></i>
              Comprobante
            </label>
            <div className="d-flex gap-2">
              {voucherTypes.map((v) => (
                <button
                  key={v.id_tipo_comprobante}
                  type="button"
                  className={`btn btn-sm flex-fill border ${selectedVoucherType === String(v.id_tipo_comprobante) ? 'btn-gold fw-bold' : 'btn-light'}`}
                  onClick={() => setSelectedVoucherType(String(v.id_tipo_comprobante))}
                >
                  {v.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted mb-1">
              <i className="bi bi-credit-card me-1"></i>
              Método de pago
            </label>
            <div className="row g-2">
              {paymentMethods.map((m) => (
                <div key={m.id_metodo_pago} className="col-6">
                  <button
                    type="button"
                    className={`btn btn-sm w-100 border text-truncate ${selectedPaymentMethod === String(m.id_metodo_pago) ? 'btn-gold fw-bold' : 'btn-light'}`}
                    onClick={() => setSelectedPaymentMethod(String(m.id_metodo_pago))}
                  >
                    {m.nombre}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Monto Recibido y Vuelto */}
          <div className="p-3 mb-3 bg-light rounded border">
            <label className="form-label small fw-bold text-muted mb-1">
              Monto recibido
            </label>
            <div className="input-group input-group-sm mb-2">
              <span className="input-group-text bg-white">S/</span>
              <ValidatedInput
                name="montoRecibido"
                required={isCash && cart.length > 0}
                type="number"
                step="0.01"
                min="0"
                className="form-control fw-bold"
                placeholder="0.00"
                disabled={!isCash}
                value={isCash ? montoRecibido : totalAmount.toFixed(2)}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
              <span className="small fw-semibold text-muted">Vuelto:</span>
              <span className="fw-bold fs-6" style={{ color: '#45131a' }}>
                S/ {changeAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón Cobrar */}
        <button
          type="button"
          className="btn btn-burgundy w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow"
          style={{ backgroundColor: '#601824' }}
          onClick={handlePreCheckout}
          disabled={cart.length === 0}
        >
          <i className="bi bi-cash-stack fs-5"></i>
          <span>COBRAR (S/ {totalAmount.toFixed(2)})</span>
        </button>
      </div>
    </div>
  );
}
