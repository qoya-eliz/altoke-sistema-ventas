import { getCatalogs } from '../../api/catalogs.api.js';
import usersApi from './users.api.js';
import { useNavigationGuard, useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';
import { useState, useEffect, useRef } from 'react';

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    total_usuarios: 0,
    personal_activo: 0,
    roles_configurados: 0,
  });
  const [roles, setRoles] = useState([]);
  const [docTypes, setDocTypes] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [idRol, setIdRol] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Formulario Crear
  const [createForm, setCreateForm] = useState({
    id_rol: '2', // Cajero por defecto
    id_tipo_documento: '1', // DNI
    numero_documento: '',
    nombres: '',
    apellidos: '',
    password: '',
  });
  const [showCreatePass, setShowCreatePass] = useState(false);

  // Formulario Editar
  const [editForm, setEditForm] = useState({
    id_rol: '',
    nombres: '',
    apellidos: '',
    password: '',
    estado: true,
  });
  const [showEditPass, setShowEditPass] = useState(false);

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

  async function loadCatalogs() {
    try {
      const res = await getCatalogs();
      setRoles(res.data?.data?.roles || []);
      setDocTypes(res.data?.data?.tipos_documento || []);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
    }
  }

  async function fetchData(
    custom = { search: search, id_rol: idRol, estado: estadoFilter },
  ) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (custom.search) {
        params.append('search', custom.search);
      }
      if (custom.id_rol) {
        params.append('id_rol', custom.id_rol);
      }
      if (custom.estado !== '') {
        params.append('estado', custom.estado);
      }

      const [listRes, metricsRes] = await Promise.all([
        usersApi.list(`/users?${params.toString()}`.slice(6)),
        usersApi.metrics(),
      ]);

      setUsers(listRes.data?.data || []);
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

  // Previsualización reactiva de nombre de usuario: primera letra del nombre + apellido paterno
  const getUsernamePreview = (nombres, apellidos) => {
    if (!nombres && !apellidos) {
      return 'automático';
    }
    const cleanStr = (s) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const firstLetter = cleanStr(nombres).charAt(0) || '';
    const firstSurname = cleanStr((apellidos || '').split(' ')[0]) || '';
    return firstLetter && firstSurname ? `${firstLetter}${firstSurname}` : 'automático';
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
      const registered = await usersApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        id_rol: '2',
        id_tipo_documento: '1',
        numero_documento: '',
        nombres: '',
        apellidos: '',
        password: '',
      });
      showSuccess(
        `Usuario registrado correctamente. Nombre de usuario: ${registered.data.data.nom_usuario}`,
      );
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al registrar usuario.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      id_rol: user.id_rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
      password: '',
      estado: Boolean(user.estado),
    });
    setEditBaseline({
      id_rol: user.id_rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
      password: '',
      estado: Boolean(user.estado),
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e, confirmed = false) => {
    e.preventDefault();
    if (
      !confirmed &&
      ((editingUser?.estado && !editForm.estado) ||
        String(editForm.id_rol) !== String(editingUser?.id_rol))
    ) {
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
      await usersApi.update(`/users/${editingUser.id_usuario}`.slice(7), editForm);
      setShowEditModal(false);
      showSuccess('¡Datos y estado de usuario actualizados exitosamente!');
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar usuario.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;

  useEffect(() => {
    // Cancela el inicio pendiente si React desmonta la vista (incluido StrictMode).
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      loadCatalogs();
      fetchData();
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    users,
    metrics,
    roles,
    docTypes,
    search,
    setSearch,
    idRol,
    setIdRol,
    estadoFilter,
    setEstadoFilter,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    createForm,
    setCreateForm,
    showCreatePass,
    setShowCreatePass,
    editForm,
    setEditForm,
    showEditPass,
    setShowEditPass,
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
    getUsernamePreview,
    handleCreateSubmit,
    openEdit,
    handleEditSubmit,
    currentUsers,
    totalPages,
  };
}
