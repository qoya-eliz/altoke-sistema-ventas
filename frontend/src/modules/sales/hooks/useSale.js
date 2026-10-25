import { getCatalogs } from '../../../api/catalogs.api.js';
import clientsApi from '../../clients/clients.api.js';
import productsApi from '../../products/products.api.js';
import salesApi from '../sales.api.js';
import useCart from './useCart.js';
import {
  useNavigationGuard,
  useUnsavedChanges,
} from '../../../hooks/useUnsavedChanges.js';
import { documentRule, valueError, fieldRule } from '../../../utils/fieldValidation.js';
import { useState, useEffect, useRef } from 'react';

export default function useSale() {
  const {
    cart,
    setCart,
    decreaseQuantity,
    removeFromCart,
    totalAmount,
    subtotalAmount,
    igvAmount,
    totalProductsCount,
  } = useCart();
  // Catálogos
  const [docTypes, setDocTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState([]);

  // Estado del Cliente en Venta
  const [selectedDocType, setSelectedDocType] = useState('1'); // DNI
  const [docNumber, setDocNumber] = useState('00000000');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchStatus, setClientSearchStatus] = useState('');

  // Modal Nuevo Cliente desde POS (Visual Reference 17)
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientModalForm, setClientModalForm] = useState({
    id_tipo_documento: '1',
    numero_documento: '',
    nombre_razon_social: '',
  });
  const [clientModalError, setClientModalError] = useState('');

  // Autocomplete y Búsqueda de Productos
  const [productQuery, setProductQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  // Carrito de Compras

  // Resumen y Pago
  const [selectedVoucherType, setSelectedVoucherType] = useState('1'); // Boleta
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('1'); // Efectivo
  const [montoRecibido, setMontoRecibido] = useState('');

  // Temporizador de atención de venta (en segundos)
  const [saleStartTime, setSaleStartTime] = useState(null);

  // Modales de Confirmación
  const [showConfirmSaleModal, setShowConfirmSaleModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Alertas
  const [errorAlert, setErrorAlert] = useState('');
  const saleLock = useRef(false);
  const operation = useRef(null);
  const searchSequence = useRef(0);
  const clientLock = useRef(false);
  const { requestAction } = useNavigationGuard();
  useUnsavedChanges(
    showClientModal &&
      Object.entries(clientModalForm).some(
        ([key, value]) => key !== 'id_tipo_documento' && String(value).trim(),
      ),
    'Registro de cliente',
  );
  const [savingClient, setSavingClient] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  useUnsavedChanges(
    cart.length > 0 || isSubmittingSale,
    confirmationPending ? 'Cobro pendiente de confirmación' : 'Orden de venta',
  );

  async function loadCatalogs() {
    try {
      const res = await getCatalogs();
      const cats = res.data?.data || {};
      setDocTypes(cats.tipos_documento || []);
      setPaymentMethods(cats.metodos_pago || []);
      setVoucherTypes(cats.tipos_comprobante || []);
      const generic = await clientsApi.search(
        '/clients/search?numero=00000000&id_tipo=1'.slice(15),
      );
      setSelectedClient(generic.data.data || null);
    } catch (err) {
      setErrorAlert(err.message || 'No se pudieron cargar los datos del POS.');
    }
  }

  // Buscar Cliente por Tipo y Número
  const handleSearchClient = async () => {
    setClientSearchStatus('');
    setErrorAlert('');
    const documentError = valueError(
      docNumber,
      {
        kind: 'document',
        ...documentRule(
          docTypes.find((t) => String(t.id_tipo_documento) === String(selectedDocType))
            ?.abreviatura || selectedDocType,
        ),
      },
      true,
    );
    if (documentError) {
      setClientSearchStatus(documentError);
      return;
    }
    if (!saleStartTime) {
      setSaleStartTime(new Date());
    }

    try {
      const res = await clientsApi.search(
        `/clients/search?numero=${encodeURIComponent(docNumber.trim())}&id_tipo=${selectedDocType}`.slice(
          15,
        ),
      );
      if (res.data?.found && res.data?.data) {
        setSelectedClient(res.data.data);
        setClientSearchStatus('✓ Cliente verificado');
      } else {
        setSelectedClient(null);
        setClientSearchStatus('Cliente no registrado');
      }
    } catch (err) {
      setSelectedClient(null);
      setClientSearchStatus(err.message || 'Error en búsqueda');
    }
  };

  // Guardar nuevo cliente desde modal POS y asociarlo de inmediato
  const handleCreateClientModal = async (e) => {
    e.preventDefault();
    setClientModalError('');
    if (clientLock.current) {
      return;
    }
    clientLock.current = true;
    setSavingClient(true);
    try {
      const res = await clientsApi.create(clientModalForm);
      const newClient = res.data?.data;
      setSelectedClient(newClient);
      setDocNumber(newClient.numero_documento);
      setSelectedDocType(String(newClient.id_tipo_documento));
      setShowClientModal(false);
      setClientSearchStatus('✓ Cliente registrado y asociado');
      setClientModalForm({
        id_tipo_documento: '1',
        numero_documento: '',
        nombre_razon_social: '',
      });
    } catch (err) {
      setClientModalError(err.message || 'Error al registrar cliente.');
    } finally {
      clientLock.current = false;
      setSavingClient(false);
    }
  };

  // Autocomplete reactivo de productos al escribir
  const handleProductSearchChange = async (val) => {
    const sequence = ++searchSequence.current;
    setProductQuery(val);
    if (!val || val.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setIsSearchingProducts(true);
    try {
      const res = await productsApi.searchPos(
        `/products/search-pos?term=${encodeURIComponent(val.trim())}`.slice(20),
      );
      if (sequence === searchSequence.current) {
        setSuggestions(res.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (sequence === searchSequence.current) {
        setIsSearchingProducts(false);
      }
    }
  };

  // Agregar producto al carrito
  const addToCart = (product, startedAt) => {
    if (product.stock <= 0) {
      setErrorAlert(`El producto '${product.nombre}' no tiene stock disponible.`);
      return;
    }

    setErrorAlert('');
    if (!saleStartTime) {
      setSaleStartTime(startedAt);
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id_producto === product.id_producto);
      if (existing) {
        if (existing.cantidad + 1 > product.stock) {
          setErrorAlert(
            `No puedes agregar más unidades de '${product.nombre}'. Stock máximo alcanzado (${product.stock}).`,
          );
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id_producto === product.id_producto
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: parseFloat(
                  ((item.cantidad + 1) * item.precio_venta).toFixed(2),
                ),
              }
            : item,
        );
      } else {
        return [
          ...prevCart,
          {
            id_producto: product.id_producto,
            cod_producto: product.cod_producto,
            nombre: product.nombre,
            precio_venta: parseFloat(product.precio_venta),
            stock: product.stock,
            cantidad: 1,
            subtotal: parseFloat(Number(product.precio_venta).toFixed(2)),
          },
        ];
      }
    });

    setProductQuery('');
    ++searchSequence.current;
    setSuggestions([]);
  };

  // Incrementar cantidad
  const increaseQuantity = (id_producto) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id_producto === id_producto) {
          if (item.cantidad + 1 > item.stock) {
            setErrorAlert(
              `Stock insuficiente para '${item.nombre}'. Disponible: ${item.stock}`,
            );
            return item;
          }
          const newQty = item.cantidad + 1;
          return {
            ...item,
            cantidad: newQty,
            subtotal: parseFloat((newQty * item.precio_venta).toFixed(2)),
          };
        }
        return item;
      }),
    );
  };

  // Decrementar cantidad

  // Eliminar ítem del carrito

  // Vaciar carrito
  const confirmClearCart = () => {
    if (operation.current?.uncertain) {
      setErrorAlert(
        'Existe un cobro pendiente de confirmación. Reinténtelo antes de iniciar otra venta.',
      );
      return;
    }
    operation.current = null;
    setMontoRecibido('');
    setSaleStartTime(null);
    setCart([]);
    setShowClearCartModal(false);
    setErrorAlert('');
  };

  // Cálculos contables en tiempo real

  // Vuelto
  const isCash = selectedPaymentMethod === '1'; // Efectivo
  const numericReceived = parseFloat(montoRecibido) || 0;
  const changeAmount = isCash
    ? Math.max(0, parseFloat((numericReceived - totalAmount).toFixed(2)))
    : 0.0;

  // Validación previa a cobrar
  const handlePreCheckout = () => {
    setErrorAlert('');
    if (cart.length === 0) {
      setErrorAlert('No hay productos en el carrito para realizar una venta.');
      return;
    }

    if (!selectedClient) {
      setErrorAlert('Debe seleccionar o registrar un cliente antes de cobrar.');
      return;
    }

    // Si es Factura (id = 2), validar que el cliente tenga RUC de 11 dígitos
    if (selectedVoucherType === '2') {
      const doc = (selectedClient.numero_documento || '').trim();
      if (
        doc.length !== 11 ||
        !/^\d{11}$/.test(doc) ||
        String(selectedClient.id_tipo_documento) !== '2'
      ) {
        setErrorAlert(
          'Para emitir Factura es obligatorio asociar un cliente con RUC válido de 11 dígitos.',
        );
        return;
      }
    }

    if (isCash && numericReceived < totalAmount) {
      setErrorAlert(
        `El monto recibido en efectivo (S/ ${numericReceived.toFixed(2)}) es menor al total a pagar (S/ ${totalAmount.toFixed(2)}).`,
      );
      return;
    }

    const paymentError = isCash
      ? valueError(montoRecibido, fieldRule('montoRecibido'), true)
      : '';
    if (paymentError) {
      setErrorAlert(paymentError);
      return;
    }
    // Abrir modal de confirmación
    setShowConfirmSaleModal(true);
  };

  // Confirmar y procesar venta en backend con transacción atómica
  const handleConfirmSale = async () => {
    if (saleLock.current) {
      return;
    }
    saleLock.current = true;
    setIsSubmittingSale(true);
    setErrorAlert('');

    try {
      const attentionSeconds = Math.max(
        0,
        Math.round((new Date() - (saleStartTime || new Date())) / 1000),
      );

      const payload = {
        id_cliente: selectedClient.id_cliente,
        id_tipo_comprobante: parseInt(selectedVoucherType, 10),
        id_metodo_pago: parseInt(selectedPaymentMethod, 10),
        items: cart.map((i) => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad,
          precio_unitario: i.precio_venta,
        })),
        monto_recibido: isCash ? numericReceived : totalAmount,
        tiempo_atencion_seg: attentionSeconds,
        fecha_hora_inicio: (saleStartTime || new Date()).toISOString(),
      };

      const fingerprint = JSON.stringify({
        ...payload,
        tiempo_atencion_seg: undefined,
        fecha_hora_inicio: undefined,
      });
      if (operation.current?.uncertain && operation.current.fingerprint !== fingerprint) {
        throw new Error(
          'El cobro anterior tiene confirmación pendiente. Restablezca sus datos y reintente antes de hacer otra venta.',
        );
      }
      if (!operation.current || operation.current.fingerprint !== fingerprint) {
        operation.current = {
          key:
            globalThis.crypto?.randomUUID?.() ||
            `venta_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          fingerprint,
          payload,
        };
      }
      operation.current.uncertain = true;
      setConfirmationPending(true);
      const res = await salesApi.create({
        ...operation.current.payload,
        clave_operacion: operation.current.key,
      });
      operation.current = null;
      setConfirmationPending(false);

      const createdSale = res.data?.data;

      // Cerrar modal de confirmación y abrir modal de Ticket Térmico
      setShowConfirmSaleModal(false);
      setCompletedSale(createdSale);

      // Limpiar POS para siguiente venta
      setCart([]);
      setMontoRecibido('');
      setSaleStartTime(null);
      // Reestablecer a público general
      setSelectedDocType('1');
      setDocNumber('00000000');
      const generic = await clientsApi
        .search('/clients/search?numero=00000000&id_tipo=1'.slice(15))
        .catch(() => null);
      setSelectedClient(generic?.data?.data || null);
      setClientSearchStatus('');
    } catch (err) {
      setShowConfirmSaleModal(false);
      if (
        err.response?.status >= 400 &&
        err.response?.status < 500 &&
        err.response?.data?.code !== 'IDEMPOTENCY_PENDING'
      ) {
        operation.current = null;
        setConfirmationPending(false);
      }
      setErrorAlert(
        err.message || 'Error al procesar la venta. Reintente para confirmar su estado.',
      );
    } finally {
      saleLock.current = false;
      setIsSubmittingSale(false);
    }
  };

  useEffect(() => {
    // Cancela el inicio pendiente si React desmonta la vista (incluido StrictMode).
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      loadCatalogs();
    });
    return () => {
      active = false;
    };
  }, []);

  return {
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
  };
}
