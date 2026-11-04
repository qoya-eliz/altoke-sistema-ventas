import Pagination from '../../../components/Pagination.jsx';
import { getCatalogs } from '../../../api/catalogs.api.js';
import salesApi from '../sales.api.js';
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../../components/ValidatedFields.jsx';
import { useState, useEffect } from 'react';
import api from '../../../api/axiosClient.js';
import DetailModal from '../components/SaleDetailModal.jsx';
import TicketModal from '../components/TicketModal.jsx';

const initialFilters = {
  search: '',
  desde: '',
  hasta: '',
  id_tipo_comprobante: '',
  id_metodo_pago: '',
};

export default function SalesHistoryCashier() {
  const [sales, setSales] = useState([]);

  const [catalogs, setCatalogs] = useState({
    tipos_comprobante: [],
    metodos_pago: [],
  });

  // Filtros

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [ticketSale, setTicketSale] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Cargar catálogos

  async function loadCatalogs() {
    try {
      const res = await getCatalogs();

      setCatalogs({
        tipos_comprobante: res.data?.data?.tipos_comprobante || [],
        metodos_pago: res.data?.data?.metodos_pago || [],
      });
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
    }
  }

  // Consultar historial de ventas

  async function fetchSales(customFilters = filters) {
    setLoading(true);
    setLoadError('');

    try {
      const params = new URLSearchParams();

      Object.entries(customFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const query = params.toString();
      const url = query ? `/sales?${query}` : '/sales';

      const res = await api.get(url);

      setSales(res.data?.data || []);
      setCurrentPage(1);
    } catch (err) {
      setLoadError(err.message || 'No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  }

  // Actualizar filtros al escribir o seleccionar opciones
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Buscar con los filtros seleccionados
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSales(filters);
  };

  // LIMPIAR FILTROS Y RECARGAR EL HISTORIAL
  const handleResetFilters = () => {
    const clearedFilters = {
      search: '',
      desde: '',
      hasta: '',
      id_tipo_comprobante: '',
      id_metodo_pago: '',
    };

    setFilters(clearedFilters);
    setCurrentPage(1);
    fetchSales(clearedFilters);
  };

  // Consultar detalle de una venta
  const openDetail = async (id_venta) => {
    try {
      const res = await salesApi.get(`/sales/${id_venta}`.slice(7));
      setSelectedSale(res.data?.data || null);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
      alert('Error al consultar detalle de venta.');
    }
  };

  // Datos de paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSales = sales.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sales.length / itemsPerPage) || 1;

  useEffect(() => {
    // Cancela el inicio pendiente si React desmonta la vista (incluido StrictMode).
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      loadCatalogs();
      fetchSales(initialFilters);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-content">
      {loadError && (
        <div className="alert alert-danger" role="alert">
          {loadError}
        </div>
      )}
      {/* Tarjeta de filtros */}
      <div className="filter-card mb-3">
        <ValidatedForm onSubmit={handleSearchSubmit}>
          {/* Búsqueda por comprobante */}
          <div className="mb-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>

              <ValidatedInput
                type="text"
                className="form-control"
                name="search"
                placeholder="Buscar por N° de comprobante..."
                value={filters.search}
                onChange={handleFilterChange}
              />

              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={handleResetFilters}
                title="Limpiar filtros"
                aria-label="Limpiar todos los filtros"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-muted mb-1">
                Rango de fecha
              </label>

              <div className="input-group input-group-sm">
                <ValidatedInput
                  type="date"
                  className="form-control"
                  name="desde"
                  max={filters.hasta || undefined}
                  value={filters.desde}
                  onChange={handleFilterChange}
                  title="Desde"
                />

                <ValidatedInput
                  type="date"
                  className="form-control"
                  name="hasta"
                  min={filters.desde || undefined}
                  value={filters.hasta}
                  onChange={handleFilterChange}
                  title="Hasta"
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                Tipo de comprobante
              </label>

              <ValidatedSelect
                className="form-select form-select-sm"
                name="id_tipo_comprobante"
                value={filters.id_tipo_comprobante}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>

                {catalogs.tipos_comprobante.map((tipo) => (
                  <option key={tipo.id_tipo_comprobante} value={tipo.id_tipo_comprobante}>
                    {tipo.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                Método de pago
              </label>

              <ValidatedSelect
                className="form-select form-select-sm"
                name="id_metodo_pago"
                value={filters.id_metodo_pago}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>

                {catalogs.metodos_pago.map((metodo) => (
                  <option key={metodo.id_metodo_pago} value={metodo.id_metodo_pago}>
                    {metodo.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-1 d-flex gap-1">
              <button
                type="submit"
                className="btn btn-gold btn-sm w-100"
                title="Filtrar"
                aria-label="Aplicar filtros"
              >
                <i className="bi bi-funnel"></i>
              </button>
            </div>
          </div>
        </ValidatedForm>
      </div>

      {/* Tabla de historial de ventas */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-clock-history me-2"></i>
            Historial de comprobantes emitidos
          </h6>

          <span className="small text-muted">{sales.length} comprobantes</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>

            <div className="small text-muted mt-2">Cargando historial de ventas...</div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">
              No se encontraron ventas para los criterios ingresados.
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: '0.86rem' }}
              >
                <thead style={{ backgroundColor: '#FAF5EE' }}>
                  <tr style={{ color: '#45131a' }}>
                    <th>FECHA/HORA</th>
                    <th>N° COMPROBANTE</th>
                    <th>TIPO</th>
                    <th>CLIENTE</th>
                    <th>MÉTODO DE PAGO</th>
                    <th className="text-end">TOTAL</th>
                    <th className="text-center">ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {currentSales.map((sale) => (
                    <tr key={sale.id_venta}>
                      <td className="text-muted">
                        {sale.fecha_hora_fin
                          ? new Date(sale.fecha_hora_fin).toLocaleString('es-PE')
                          : '—'}
                      </td>

                      <td className="fw-bold">
                        {sale.serie_comprobante}-{sale.numero_comprobante}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {sale.tipo_comprobante}
                        </span>
                      </td>

                      <td className="fw-semibold text-dark">{sale.cliente_nombre}</td>

                      <td>{sale.metodo_pago}</td>

                      <td className="text-end fw-bold" style={{ color: '#248A44' }}>
                        S/ {Number(sale.total).toFixed(2)}
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-0 px-2 d-inline-flex align-items-center gap-1"
                          onClick={() => openDetail(sale.id_venta)}
                          title="Ver detalle del comprobante"
                        >
                          <i className="bi bi-eye"></i>
                          <span>Ver Detalle</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      {/* Modal de detalle de venta */}
      {selectedSale && (
        <DetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onPrint={(saleToPrint) => {
            setSelectedSale(null);
            setTicketSale(saleToPrint);
          }}
        />
      )}

      {/* Modal de ticket térmico */}
      {ticketSale && (
        <TicketModal sale={ticketSale} onClose={() => setTicketSale(null)} />
      )}
    </div>
  );
}
