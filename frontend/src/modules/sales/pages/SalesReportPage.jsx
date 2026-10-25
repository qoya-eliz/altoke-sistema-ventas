import Pagination from '../../../components/Pagination.jsx';
import { getCatalogs } from '../../../api/catalogs.api.js';
import categoriesApi from '../../categories/categories.api.js';
import usersApi from '../../users/users.api.js';
import salesApi from '../sales.api.js';
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedForm,
} from '../../../components/ValidatedFields.jsx';
import { useState, useEffect } from 'react';
import { downloadFile, saveBlob } from '../../../api/axiosClient.js';
import StatCard from '../../../components/StatCard.jsx';
import DetailModal from '../components/SaleDetailModal.jsx';
import TicketModal from '../components/TicketModal.jsx';

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [metrics, setMetrics] = useState({
    ingresos_totales: 0,
    ventas_realizadas: 0,
    ticket_promedio: 0,
    tiempo_atencion_promedio: 0,
  });

  // Catálogos para filtros
  const [catalogs, setCatalogs] = useState({
    tipos_comprobante: [],
    metodos_pago: [],
  });
  const [categories, setCategories] = useState([]);
  const [cashiers, setCashiers] = useState([]);

  // Estados de filtros
  const [filters, setFilters] = useState({
    desde: '',
    hasta: '',
    id_tipo_comprobante: '',
    id_metodo_pago: '',
    id_categoria: '',
    id_usuario: '',
    search: '',
    estado: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [exporting, setExporting] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [ticketSale, setTicketSale] = useState(null);

  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  async function loadCatalogs() {
    try {
      const [catRes, catsListRes, usersRes] = await Promise.all([
        getCatalogs(),
        categoriesApi.list('/categories'.slice(11)),
        usersApi.list('/users?id_rol=2'.slice(6)), // Cajeros
      ]);
      setCatalogs(catRes.data?.data || {});
      setCategories(catsListRes.data?.data || []);
      setCashiers(usersRes.data?.data || []);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron cargar los datos.');
    }
  }

  async function fetchData(customFilters = filters) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      Object.entries(customFilters).forEach(([k, v]) => {
        if (v) {
          params.append(k, v);
        }
      });

      const [salesRes, metricsRes] = await Promise.all([
        salesApi.list(`/sales?${params.toString()}`.slice(6)),
        salesApi.get(`/sales/metrics?${params.toString()}`.slice(7)),
      ]);

      setSales(salesRes.data?.data || []);
      setAppliedFilters({ ...customFilters });
      setMetrics(metricsRes.data?.data || {});
      setCurrentPage(1);
    } catch (err) {
      setLoadError(err.message || 'No se pudieron consultar las ventas.');
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      desde: '',
      hasta: '',
      id_tipo_comprobante: '',
      id_metodo_pago: '',
      id_categoria: '',
      id_usuario: '',
      search: '',
    estado: '',
    };
    setFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  const exportReport = async (format) => {
    if (exporting) {
      return;
    }
    setExporting(true);
    setLoadError('');
    try {
      const params = new URLSearchParams(
        Object.entries(appliedFilters).filter(([, v]) => v !== '' && v != null),
      );
      const { blob } = await downloadFile(`/sales/export/${format}?${params}`);
      saveBlob(blob, `reporte_ventas.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setExporting(false);
    }
  };
  const handleExportExcel = () => exportReport('excel');
  const handleExportPdf = () => exportReport('pdf');

  const openDetail = async (id_venta) => {
    try {
      const res = await salesApi.get(`/sales/${id_venta}`.slice(7));
      setSelectedSale(res.data?.data);
    } catch (err) {
      setLoadError(err.message || 'Error al consultar detalle de venta.');
    }
  };

  // Paginación
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
      fetchData();
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
      {/* Botones de Exportación Superiores */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#45131a' }}>
            REPORTE DE VENTAS
          </h4>
          <small className="text-muted">
            Análisis detallado de transacciones, métricas y exportación de datos del
            minimarket.
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 shadow-sm"
            onClick={handleExportExcel}
            disabled={loading || exporting}
          >
            <i className="bi bi-file-earmark-excel"></i>
            <span>Exportar Excel</span>
          </button>
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 shadow-sm"
            onClick={handleExportPdf}
            disabled={loading || exporting}
          >
            <i className="bi bi-file-earmark-pdf"></i>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Filtros Combinados */}
      <div className="filter-card">
        <ValidatedForm onSubmit={handleApplyFilters}>
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
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

            <div className="col-md-2">
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
                {(catalogs.tipos_comprobante || []).map((t) => (
                  <option key={t.id_tipo_comprobante} value={t.id_tipo_comprobante}>
                    {t.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
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
                {(catalogs.metodos_pago || []).map((m) => (
                  <option key={m.id_metodo_pago} value={m.id_metodo_pago}>
                    {m.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">
                Categoría
              </label>
              <ValidatedSelect
                className="form-select form-select-sm"
                name="id_categoria"
                value={filters.id_categoria}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {categories.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">
                Personal de caja
              </label>
              <ValidatedSelect
                className="form-select form-select-sm"
                name="id_usuario"
                value={filters.id_usuario}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {cashiers.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombres} {u.apellidos}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1" htmlFor="sales-state-filter">Estado</label>
              <ValidatedSelect id="sales-state-filter" name="estado" className="form-select form-select-sm" value={filters.estado} onChange={handleFilterChange}>
                <option value="">Todos</option>
                <option value="COMPLETADA">Completada</option>
                <option value="ANULADA">Anulada</option>
              </ValidatedSelect>
            </div>

            <div className="col-md-1 d-flex gap-1">
              <button
                type="submit"
                className="btn btn-gold btn-sm w-100"
                title="Aplicar filtros"
              >
                <i className="bi bi-funnel"></i>
              </button>
              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={handleResetFilters}
                title="Limpiar filtros"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </ValidatedForm>
      </div>

      {/* 4 Tarjetas de Métricas KPI */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard
            label="INGRESOS TOTALES"
            value={`S/ ${Number(metrics.ingresos_totales || 0).toFixed(2)}`}
            subtext="Recaudación total acumulada"
            icon="bi-cash-coin"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            label="VENTAS REALIZADAS"
            value={`${metrics.ventas_realizadas || 0}`}
            subtext="Ventas completadas en el periodo"
            icon="bi-receipt"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            label="TICKET PROMEDIO"
            value={`S/ ${Number(metrics.ticket_promedio || 0).toFixed(2)}`}
            subtext="Gasto promedio por cliente"
            icon="bi-graph-up-arrow"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            label="TIEMPO DE ATENCIÓN"
            value={`${Math.round(metrics.tiempo_atencion_promedio || 0)}s`}
            subtext="Velocidad promedio de cobro"
            icon="bi-stopwatch"
          />
        </div>
      </div>

      {/* Tabla Resultados de Ventas */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold m-0" style={{ color: '#45131a' }}>
            <i className="bi bi-card-checklist me-2"></i>
            Resultados de ventas
          </h6>
          <span className="small text-muted">
            {sales.length} transacciones encontradas
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <div className="small text-muted mt-2">Cargando transacciones...</div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2"></i>
            <p className="mt-2 mb-0">
              No se encontraron ventas para los filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <p className="small text-muted mb-2">Los indicadores incluyen únicamente ventas completadas. Las anuladas se conservan para consulta.</p>
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
                    <th>ESTADO</th>
                    <th className="text-end">TOTAL</th>
                    <th className="text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((s) => (
                    <tr key={s.id_venta}>
                      <td className="text-muted">
                        {new Date(s.fecha_hora_fin).toLocaleString('es-PE')}
                      </td>
                      <td className="fw-bold">
                        {s.serie_comprobante}-{s.numero_comprobante}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {s.tipo_comprobante}
                        </span>
                      </td>
                      <td>{s.cliente_nombre}</td>
                      <td>{s.metodo_pago}</td>
                      <td><span className={`badge ${s.estado === 'ANULADA' ? 'bg-danger' : 'bg-success'}`}>{s.estado}</span></td>
                      <td className="text-end fw-bold" style={{ color: '#248A44' }}>
                        S/ {Number(s.total).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-danger py-0 px-2 d-inline-flex align-items-center gap-1"
                          onClick={() => openDetail(s.id_venta)}
                          title="Ver detalle de transacción"
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

      {/* Modal Detalle de Venta */}
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

      {/* Modal Ticket Térmico 80mm */}
      {ticketSale && (
        <TicketModal sale={ticketSale} onClose={() => setTicketSale(null)} />
      )}
    </div>
  );
}
