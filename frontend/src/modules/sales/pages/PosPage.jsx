import ConfirmDialog from '../../../components/ConfirmDialog.jsx';
import TicketModal from '../components/TicketModal.jsx';
import ClientSelector from '../components/ClientSelector.jsx';
import ProductSearch from '../components/ProductSearch.jsx';
import CartTable from '../components/CartTable.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import PosClientDialog from '../components/PosClientDialog.jsx';
import SaleConfirmationDialog from '../components/SaleConfirmationDialog.jsx';
import useSale from '../hooks/useSale.js';
export default function POS() {
  const {
    docTypes,
    paymentMethods,
    voucherTypes,
    selectedDocType,
    setSelectedDocType,
    docNumber,
    setDocNumber,
    selectedClient,
    setSelectedClient,
    clientSearchStatus,
    setClientSearchStatus,
    showClientModal,
    setShowClientModal,
    clientModalForm,
    setClientModalForm,
    clientModalError,
    setClientModalError,
    productQuery,
    suggestions,
    isSearchingProducts,
    cart,
    selectedVoucherType,
    setSelectedVoucherType,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    montoRecibido,
    setMontoRecibido,
    showConfirmSaleModal,
    setShowConfirmSaleModal,
    showClearCartModal,
    setShowClearCartModal,
    completedSale,
    setCompletedSale,
    errorAlert,
    setErrorAlert,
    requestAction,
    savingClient,
    isSubmittingSale,
    handleSearchClient,
    handleCreateClientModal,
    handleProductSearchChange,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    confirmClearCart,
    totalAmount,
    subtotalAmount,
    igvAmount,
    totalProductsCount,
    isCash,
    numericReceived,
    changeAmount,
    handlePreCheckout,
    handleConfirmSale,
  } = useSale();
  return (
    <div className="page-content">
      {errorAlert && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm mb-3"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorAlert}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorAlert('')}
          ></button>
        </div>
      )}

      <div className="row g-3">
        {/* PANEL IZQUIERDO: CLIENTE Y PRODUCTOS */}
        <div className="col-lg-8">
          {/* SECCIÓN 1: CLIENTE (Visual Reference 16) */}
          <ClientSelector
            setClientModalError={setClientModalError}
            setShowClientModal={setShowClientModal}
            selectedDocType={selectedDocType}
            setSelectedDocType={setSelectedDocType}
            setSelectedClient={setSelectedClient}
            setClientSearchStatus={setClientSearchStatus}
            docTypes={docTypes}
            docNumber={docNumber}
            setDocNumber={setDocNumber}
            handleSearchClient={handleSearchClient}
            selectedClient={selectedClient}
            clientSearchStatus={clientSearchStatus}
          />

          {/* SECCIÓN 2: PRODUCTOS Y CARRITO */}
          <div className="content-card">
            {/* Buscador de productos con autocomplete */}
            <ProductSearch
              productQuery={productQuery}
              handleProductSearchChange={handleProductSearchChange}
              isSearchingProducts={isSearchingProducts}
              suggestions={suggestions}
              addToCart={addToCart}
            />

            {/* Tabla del Carrito */}
            <CartTable
              cart={cart}
              decreaseQuantity={decreaseQuantity}
              increaseQuantity={increaseQuantity}
              removeFromCart={removeFromCart}
            />

            {/* Barra Inferior del Carrito */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowClearCartModal(true)}
                disabled={cart.length === 0}
              >
                <i className="bi bi-trash me-1"></i>
                Limpiar carrito
              </button>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Total de productos:</span>
                <span className="badge bg-light text-dark border fs-6 px-3 py-1 fw-bold">
                  {totalProductsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: RESUMEN DE VENTA Y COBRO */}
        <PaymentForm
          subtotalAmount={subtotalAmount}
          igvAmount={igvAmount}
          totalAmount={totalAmount}
          voucherTypes={voucherTypes}
          selectedVoucherType={selectedVoucherType}
          setSelectedVoucherType={setSelectedVoucherType}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          isCash={isCash}
          cart={cart}
          montoRecibido={montoRecibido}
          setMontoRecibido={setMontoRecibido}
          changeAmount={changeAmount}
          handlePreCheckout={handlePreCheckout}
        />
      </div>

      {/* MODAL 1: REGISTRAR NUEVO CLIENTE DESDE POS (Visual Reference 17) */}
      {showClientModal && (
        <PosClientDialog
          savingClient={savingClient}
          requestAction={requestAction}
          setShowClientModal={setShowClientModal}
          clientModalForm={clientModalForm}
          clientModalError={clientModalError}
          setClientModalError={setClientModalError}
          handleCreateClientModal={handleCreateClientModal}
          setClientModalForm={setClientModalForm}
          docTypes={docTypes}
        />
      )}

      {/* MODAL 2: CONFIRMAR VENTA */}
      {showConfirmSaleModal && (
        <SaleConfirmationDialog
          isSubmittingSale={isSubmittingSale}
          setShowConfirmSaleModal={setShowConfirmSaleModal}
          cart={cart}
          isCash={isCash}
          numericReceived={numericReceived}
          changeAmount={changeAmount}
          selectedClient={selectedClient}
          selectedVoucherType={selectedVoucherType}
          totalProductsCount={totalProductsCount}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          totalAmount={totalAmount}
          handleConfirmSale={handleConfirmSale}
        />
      )}

      {/* MODAL 3: LIMPIAR CARRITO CONFIRMACIÓN */}
      <ConfirmDialog
        isOpen={showClearCartModal}
        title="Vaciar orden"
        icon="bi-cart3"
        confirmLabel="Vaciar orden"
        onCancel={() => setShowClearCartModal(false)}
        onConfirm={confirmClearCart}
      >
        ¿Vaciar la orden de venta?
      </ConfirmDialog>

      {/* MODAL 4: TICKET TÉRMICO 80MM (Visual Reference 18) */}
      {completedSale && (
        <TicketModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
