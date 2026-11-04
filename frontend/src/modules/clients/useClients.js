import { getCatalogs } from '../../api/catalogs.api.js';
import clientsApi from './clients.api.js';
import { useNavigationGuard, useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';
import { useState, useEffect, useRef, useEffectEvent } from 'react';

import { useAuth } from '../../hooks/useAuth.js';
export default function useClients() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Administrador';
  const [clients, setClients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_clientes: 0,
    clientes_activos: 0,
    clientes_genericos: 0,
  });
  const [docTypes, setDocTypes] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [idTipoDoc, setIdTipoDoc] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Formulario Nuevo Cliente
  const [createForm, setCreateForm] = useState({
    id_tipo_documento: '1',
    numero_documento: '',
    nombre_razon_social: '',
  });

  // Formulario Editar Cliente
  const [editForm, setEditForm] = useState({
    nombre_razon_social: '',
    estado: true,
  });

  // Notificaciones y errores
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

  async function loadDocTypes() {
    try {
      const res = await getCatalogs();
      setDocTypes(res.data?.data?.tipos_documento || []);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
    }
  }

  async function fetchData(
    custom = { search: search, id_tipo_documento: idTipoDoc, estado: estadoFilter },
  ) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (custom.search) {
        params.append('search', custom.search);
      }
      if (custom.id_tipo_documento) {
        params.append('id_tipo_documento', custom.id_tipo_documento);
      }
      if (custom.estado !== '') {
        params.append('estado', custom.estado);
      }

      const [listRes, metricsRes] = await Promise.all([
        clientsApi.list(`/clients?${params.toString()}`.slice(8)),
        isAdmin ? clientsApi.metrics() : Promise.resolve({ data: { data: {} } }),
      ]);

      setClients(listRes.data?.data || []);
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

  // Crear Cliente
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
      await clientsApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        id_tipo_documento: '1',
        numero_documento: '',
        nombre_razon_social: '',
      });
      showSuccess('¡Cliente registrado exitosamente en la base de datos!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al registrar cliente.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // Abrir Modal Editar
  const openEdit = (client) => {
    setEditingClient(client);
    setEditForm({
      nombre_razon_social: client.nombre_razon_social,
      estado: Boolean(client.estado),
    });
    setEditBaseline({
      nombre_razon_social: client.nombre_razon_social,
      estado: Boolean(client.estado),
    });
    setModalError('');
    setShowEditModal(true);
  };

  // Guardar Edición
  const handleEditSubmit = async (e, confirmed = false) => {
    e.preventDefault();
    if (!confirmed && editingClient?.estado && !editForm.estado) {
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
      await clientsApi.update(`/clients/${editingClient.id_cliente}`.slice(9), editForm);
      setShowEditModal(false);
      showSuccess('¡Datos del cliente actualizados exitosamente!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar cliente.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentClients = clients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(clients.length / itemsPerPage) || 1;

  const loadInitial = useEffectEvent(() => {
    loadDocTypes();
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
    isAdmin,
    clients,
    metrics,
    docTypes,
    search,
    setSearch,
    idTipoDoc,
    setIdTipoDoc,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingClient,
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
    currentClients,
    totalPages,
  };
}
