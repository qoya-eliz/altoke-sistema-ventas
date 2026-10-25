import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { downloadFile, saveBlob } from '../../../api/axiosClient.js';

const money = (value) => `S/ ${Number(value).toFixed(2)}`;
// 80 mm a 96 ppp: ancho real del rollo térmico definido para el comprobante.
const PAPER_WIDTH = 302;

export default function TicketModal({ sale, onClose }) {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const number = `${sale.serie_comprobante}-${sale.numero_comprobante}`;
  const filename = `${number}.pdf`;
  const invoice = sale.tipo_comprobante === 'Factura';
  const cash = sale.metodo_pago === 'Efectivo';
  const cancelled = sale.estado === 'ANULADA';
  const identified = sale.cliente_documento && sale.cliente_documento !== '00000000';
  const company = sale.negocio || {};
  const items = sale.items || [];
  const contentRef = useRef(null);
  const bodyRef = useRef(null);
  const paperRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: 'auto' });
  const summary = `${company.nombre || 'ALTOKE MINIMARKET S.A.C.'}\n${invoice ? 'Factura' : 'Boleta'}: ${number}\nTotal: ${money(sale.total)}`;

  useEffect(() => {
    let active = true;
    downloadFile(`/sales/${sale.id_venta}/ticket-pdf`)
      .then(({ blob }) => { if (active) setPdf(blob); })
      .catch((err) => { if (active) setError(err.message || 'No se pudo preparar el PDF.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sale.id_venta]);

  // Ajusta el comprobante a una sola vista (sin barra de desplazamiento) reduciendo la escala si no cabe.
  useLayoutEffect(() => {
    const adjust = () => {
      const content = contentRef.current;
      const body = bodyRef.current;
      const paper = paperRef.current;
      if (!content || !body || !paper) return;
      // Alto ocupado por cabecera, avisos y botones (todo lo que no es el comprobante).
      const chrome = [...content.children]
        .filter((child) => child !== body)
        .reduce((sum, child) => sum + child.offsetHeight, 0);
      const style = getComputedStyle(body);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      // Espacio real de la ventana: 94 % de la pantalla sin superar los márgenes del modal.
      const viewport = Math.min(window.innerHeight * 0.94, window.innerHeight - 56);
      const available = viewport - chrome - padding;
      const natural = paper.offsetHeight;
      const scale = Math.min(1, available / natural);
      setFit({ scale, height: Math.ceil(natural * scale) });
    };
    adjust();
    window.addEventListener('resize', adjust);
    return () => window.removeEventListener('resize', adjust);
  }, [sale, error, notice]);

  const sharePdf = async () => {
    if (!pdf || sharing) return;
    setError('');
    setNotice('');
    const file = new File([pdf], filename, { type: 'application/pdf' });
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      saveBlob(pdf, filename);
      setNotice('PDF descargado. Abre WhatsApp y adjúntalo como documento en el chat elegido.');
      return;
    }
    setSharing(true);
    try {
      await navigator.share({ files: [file], title: number, text: summary });
    } catch (err) {
      if (err.name !== 'AbortError') setError('No se pudo compartir. Descarga el PDF y adjúntalo en WhatsApp.');
    } finally { setSharing(false); }
  };

  const printPdf = () => {
    if (!pdf) return;
    const url = URL.createObjectURL(pdf);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    // Algunos navegadores devuelven null al abrir con noopener aunque la pestaña sí se abra.
    void win;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-label="Comprobante de venta" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.7)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 470 }}>
        <div ref={contentRef} className="modal-content border-0 shadow-lg" style={{ borderRadius: 14, maxHeight: '94vh', overflow: 'hidden' }}>
          <div className="modal-header py-2 px-3">
            <span className="small fw-bold">Comprobante {number}</span>
            <button type="button" className="btn-close" aria-label="Cerrar comprobante" onClick={onClose} />
          </div>
          {error && <div className="alert alert-danger m-2 small" role="alert">{error}</div>}
          {notice && <div className="alert alert-info m-2 small" role="status">{notice}</div>}
          <div ref={bodyRef} className="modal-body bg-light p-3" style={{ overflow: 'hidden', flex: '0 0 auto' }}>
            <div style={{ height: fit.height, display: 'flex', justifyContent: 'center' }}>
            <article ref={paperRef} className="bg-white text-dark shadow-sm px-2 py-3" style={{ width: PAPER_WIDTH, flex: '0 0 auto', height: 'max-content', transform: `scale(${fit.scale})`, transformOrigin: 'top center', fontFamily: "'Courier New', Courier, monospace", fontSize: 11, lineHeight: 1.3 }}>
              <header className="text-center pb-2 border-bottom border-dark">
                <i className="bi bi-cart3" aria-label="Carrito ALTOKE" style={{ fontSize: 30 }} />
                <div className="fw-bold" style={{ fontSize: 14 }}>{company.nombre || 'ALTOKE MINIMARKET S.A.C.'}</div>
                <div className="fw-bold">RUC: {company.ruc || '20999999990'}</div>
                <div>{company.direccion || 'Av. Elmer Faucett 1240, Bellavista, Callao'}</div>
                {company.telefono && <div>Tel.: {company.telefono}</div>}
              </header>
              <div className="text-center fw-bold py-2 border-bottom border-dark">
                <div style={{ fontSize: 16 }}>{invoice ? 'FACTURA' : 'BOLETA DE VENTA'}</div>
                <div style={{ fontSize: 15 }}>{number}</div>
              </div>
              {cancelled && <div className="text-center fw-bold text-danger border-bottom py-2">ANULADA — SIN EFECTO</div>}
              <div className="py-2 border-bottom">
                <div>Fecha: {new Date(sale.fecha_hora_fin).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</div>
                <div>Cajero: {sale.cajero_nombre || sale.nom_usuario}</div>
                <div>Caja: CAJA 01 - Principal</div>
              </div>
              <div className="py-2 border-bottom border-dark" style={{ overflowWrap: 'anywhere' }}>
                <div>{invoice ? 'Razón social' : 'Cliente'}: {sale.cliente_nombre}</div>
                {identified && <div>{sale.cliente_tipo_documento}: {sale.cliente_documento}</div>}
              </div>
              <div className="d-flex justify-content-between fw-bold py-2 border-bottom"><span>CANT. / DESCRIPCIÓN</span><span>IMPORTE</span></div>
              {items.map((item, index) => (
                <div key={item.id_detalle || index} className="d-flex gap-2 py-1">
                  <span style={{ width: 18, flexShrink: 0 }}>{item.cantidad}</span>
                  <div style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                    <div>{item.producto_nombre || item.nombre || 'Producto'}</div>
                    <div style={{ fontSize: 11 }}>P. unitario: {money(item.precio_unitario)}</div>
                  </div>
                  <span className="text-end" style={{ minWidth: 49 }}>{Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-top pt-2">
                <div className="d-flex justify-content-between"><span>Op. gravada</span><span>{money(sale.subtotal)}</span></div>
                <div className="d-flex justify-content-between"><span>IGV (18 %)</span><span>{money(sale.monto_igv)}</span></div>
                <div className="d-flex justify-content-between fw-bold border-top border-bottom border-dark py-2 my-2" style={{ fontSize: 14 }}><span>{cancelled ? 'IMPORTE TOTAL' : 'TOTAL A PAGAR'}</span><span>{money(sale.total)}</span></div>
                <div>Método de pago: {sale.metodo_pago}</div>
                <div>{cash ? 'Monto recibido' : 'Monto pagado'}: {money(sale.monto_recibido)}</div>
                {cash && <div>Vuelto: {money(sale.vuelto)}</div>}
                <div className="mt-1">Productos: {items.length}　Unidades: {items.reduce((sum, item) => sum + Number(item.cantidad), 0)}</div>
              </div>
              <div className="text-center border-top mt-2 pt-2">
                {sale.qr_data_url && <img src={sale.qr_data_url} alt="QR con resumen del comprobante ALTOKE" width="96" height="96" />}
                <div style={{ fontSize: 10 }}>Resumen del comprobante en ALTOKE</div>
              </div>
              <footer className="text-center border-top mt-2 pt-2">
                <div className="fw-bold">¡GRACIAS POR SU COMPRA!</div>
                <div style={{ fontSize: 10 }}>Sin validez tributaria</div>
              </footer>
            </article>
            </div>
          </div>
          <div className="modal-footer gap-1 py-2">
            <button type="button" className="btn btn-sm btn-outline-success" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(summary + '\nPuedes adjuntar el PDF del comprobante como documento.')}`, '_blank', 'noopener,noreferrer')}>WhatsApp</button>
            <button type="button" className="btn btn-sm btn-light border" disabled={!pdf} onClick={() => saveBlob(pdf, filename)}>Descargar PDF</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!pdf || sharing} onClick={sharePdf}>{sharing ? 'Compartiendo…' : 'Compartir PDF'}</button>
            <button type="button" className="btn btn-sm btn-gold" disabled={!pdf} onClick={printPdf}>{loading ? 'Preparando…' : 'Imprimir'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
