export default function SaleConfirmationDialog({
  isSubmittingSale,
  setShowConfirmSaleModal,
  cart,
  isCash,
  numericReceived,
  changeAmount,
  selectedClient,
  selectedVoucherType,
  totalProductsCount,
  paymentMethods,
  selectedPaymentMethod,
  totalAmount,
  handleConfirmSale,
}) {
  return (
    <div
      className="modal fade show d-block altoke-sale-confirmation"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: '16px' }}
        >
          <div className="modal-header custom-modal-header altoke-confirmation-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title m-0">
              <i className="bi bi-receipt" aria-hidden="true"></i>
              Confirmar venta
            </h5>
            <button
              type="button"
              className="btn-close altoke-modal-close"
              aria-label="Cerrar ventana"
              disabled={isSubmittingSale}
              onClick={() => setShowConfirmSaleModal(false)}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="modal-body p-4">
            <div className="table-responsive mb-3">
              <table className="table table-sm">
                <caption className="caption-top">Productos de la venta</caption>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th className="text-end">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id_producto}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td className="text-end">S/ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isCash && (
              <div className="d-flex justify-content-between small mb-3">
                <span>Recibido: S/ {numericReceived.toFixed(2)}</span>
                <span>Vuelto: S/ {changeAmount.toFixed(2)}</span>
              </div>
            )}
            <p className="text-muted small mb-3">
              ¿Deseas finalizar la venta y generar el comprobante correspondiente?
            </p>

            <div className="p-3 bg-light rounded border mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Cliente:</span>
                <span className="fw-bold">{selectedClient?.nombre_razon_social}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Comprobante:</span>
                <span className="badge bg-secondary">
                  {selectedVoucherType === '2' ? 'Factura' : 'Boleta'}
                </span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Total Ítems:</span>
                <span className="fw-bold">{totalProductsCount} unidades</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Método de Pago:</span>
                <span className="fw-bold">
                  {
                    paymentMethods.find(
                      (m) => String(m.id_metodo_pago) === selectedPaymentMethod,
                    )?.nombre
                  }
                </span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Total a Cobrar:</span>
                <span className="fw-bold fs-5 text-success">
                  S/ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn altoke-modal-secondary"
              onClick={() => setShowConfirmSaleModal(false)}
              disabled={isSubmittingSale}
            >
              Regresar
            </button>
            <button
              type="button"
              className="btn altoke-modal-primary"
              onClick={handleConfirmSale}
              disabled={isSubmittingSale}
            >
              {isSubmittingSale ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Procesando...
                </>
              ) : (
                'Confirmar venta'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
