import categoriesApi from './categories.api.js';
import { useNavigationGuard, useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';
import { useState, useEffect, useRef } from 'react';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState({
    total_familias: 0,
    categorias_activas: 0,
    categoria_mas_vendida: '—',
  });

  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Formulario Crear
  const [createForm, setCreateForm] = useState({
    nombre: '',
    descripcion: '',
  });

  // Formulario Editar
  const [editForm, setEditForm] = useState({
    nombre: '',
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

  async function fetchData(custom = { search: search, estado: estadoFilter }) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (custom.search) {
        params.append('search', custom.search);
      }
      if (custom.estado !== '') {
        params.append('estado', custom.estado);
      }

      const [listRes, metricsRes] = await Promise.all([
        categoriesApi.list(`/categories?${params.toString()}`.slice(11)),
        categoriesApi.metrics(),
      ]);

      setCategories(listRes.data?.data || []);
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
    setModalError('');
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await categoriesApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ nombre: '', descripcion: '' });
      showSuccess('¡Familia / Categoría registrada exitosamente!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al registrar categoría.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      estado: Boolean(cat.estado),
    });
    setEditBaseline({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      estado: Boolean(cat.estado),
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e, confirmed = false) => {
    e.preventDefault();
    if (!confirmed && editingCategory?.estado && !editForm.estado) {
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
      await categoriesApi.update(
        `/categories/${editingCategory.id_categoria}`.slice(12),
        editForm,
      );
      setShowEditModal(false);
      showSuccess('¡Categoría actualizada exitosamente!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar categoría.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;

  useEffect(() => {
    // Cancela el inicio pendiente si React desmonta la vista (incluido StrictMode).
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      fetchData();
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    categories,
    metrics,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingCategory,
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
    currentCategories,
    totalPages,
  };
}
