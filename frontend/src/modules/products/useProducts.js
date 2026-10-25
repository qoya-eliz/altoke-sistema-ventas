import categoriesApi from '../categories/categories.api.js';
import productsApi from './products.api.js';
import { useNavigationGuard, useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';
import { useState, useEffect, useRef, useEffectEvent } from 'react';

import { useAuth } from '../../hooks/useAuth.js';
export default function useProducts() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Administrador';
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    total_productos: 0,
    stock_bajo: 0,
    categorias_activas: 0,
  });
  const [categories, setCategories] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [stockAlert, setStockAlert] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulario Crear
  const [createForm, setCreateForm] = useState({
    cod_producto: '',
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    stock: '',
    stock_minimo: 3,
    descripcion: '',
  });

  // Formulario Editar
  const [editForm, setEditForm] = useState({
    cod_producto: '',
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    stock: '',
    stock_minimo: 3,
    descripcion: '',
    estado: true,
  });

  const { requestAction } = useNavigationGuard();
  const [createBaseline, setCreateBaseline] = useState(createForm);
  const [editBaseline, setEditBaseline] = useState(editForm);
  useUnsavedChanges(
    showCreateModal && JSON.stringify(createForm) !== JSON.stringify(createBaseline),
    'Formulario de registro',
  );
  useUnsavedChanges(
    showEditModal && JSON.stringify(editForm) !== JSON.stringify(editBaseline),
    'Formulario de edición',
  );

  const [modalError, setModalError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [confirmInactive, setConfirmInactive] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  async function loadCategories() {
    try {
      const res = await categoriesApi.list('/categories'.slice(11));
      const cats = res.data?.data || [];
      setCategories(cats);
      if (cats.length > 0) {
        setCreateForm((prev) =>
          prev.id_categoria ? prev : { ...prev, id_categoria: cats[0].id_categoria },
        );
      }
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
    }
  }

  async function fetchData(
    custom = {
      search: search,
      id_categoria: idCategoria,
      stock_alert: stockAlert,
      estado: estadoFilter,
    },
  ) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (custom.search) {
        params.append('search', custom.search);
      }
      if (custom.id_categoria) {
        params.append('id_categoria', custom.id_categoria);
      }
      if (custom.stock_alert) {
        params.append('stock_alert', custom.stock_alert);
      }
      if (custom.estado !== '') {
        params.append('estado', custom.estado);
      }

      const [listRes, metricsRes] = await Promise.all([
        productsApi.list(`/products?${params.toString()}`.slice(9)),
        isAdmin ? productsApi.metrics() : Promise.resolve({ data: { data: {} } }),
      ]);

      setProducts(listRes.data?.data || []);
      setMetrics(metricsRes.data?.data || {});
      setCurrentPage(1);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los registros.');
    } finally {
      setLoading(false);
    }
  }

  const showSuccess = (msg) => {
    setSuccessToast(msg);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      return;
    }
    setModalError('');
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await productsApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        cod_producto: '',
        nombre: '',
        id_categoria: categories[0]?.id_categoria || '',
        precio_venta: '',
        stock: '',
        stock_minimo: 3,
        descripcion: '',
      });
      showSuccess('¡Producto registrado exitosamente en el catálogo!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al registrar producto.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const openEdit = (prod) => {
    setEditingProduct(prod);
    setEditForm({
      cod_producto: prod.cod_producto,
      nombre: prod.nombre,
      id_categoria: prod.id_categoria,
      precio_venta: prod.precio_venta,
      stock: prod.stock,
      stock_original: prod.stock,
      stock_minimo: prod.stock_minimo,
      descripcion: prod.descripcion || '',
      estado: Boolean(prod.estado),
    });
    setEditBaseline({
      cod_producto: prod.cod_producto,
      nombre: prod.nombre,
      id_categoria: prod.id_categoria,
      precio_venta: prod.precio_venta,
      stock: prod.stock,
      stock_original: prod.stock,
      stock_minimo: prod.stock_minimo,
      descripcion: prod.descripcion || '',
      estado: Boolean(prod.estado),
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e, confirmed = false) => {
    e.preventDefault();
    if (!confirmed && editingProduct?.estado && !editForm.estado) {
      setConfirmInactive(true);
      return;
    }
    setModalError('');
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await productsApi.update(
        `/products/${editingProduct.id_producto}`.slice(10),
        editForm,
      );
      setShowEditModal(false);
      showSuccess('¡Producto actualizado exitosamente!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar producto.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  const loadInitial = useEffectEvent(() => {
    loadCategories();
    fetchData();
  });

  useEffect(() => {
    // Cancela el inicio pendiente si React desmonta la vista (incluido StrictMode).
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      loadInitial();
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    estadoFilter,
    setEstadoFilter,
    isAdmin,
    products,
    metrics,
    categories,
    search,
    setSearch,
    idCategoria,
    setIdCategoria,
    stockAlert,
    setStockAlert,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingProduct,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    requestAction,
    createBaseline,
    setCreateBaseline,
    editBaseline,
    modalError,
    setModalError,
    successToast,
    setSuccessToast,
    loadError,
    saving,
    confirmInactive,
    setConfirmInactive,
    currentPage,
    setCurrentPage,
    fetchData,
    handleCreateSubmit,
    openEdit,
    handleEditSubmit,
    currentProducts,
    totalPages,
  };
}
