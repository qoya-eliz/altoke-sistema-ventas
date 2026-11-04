const PDFDocument = require('pdfkit');
const { presentReceipt } = require('../utils/receipt');

const money = (value) => `S/ ${Number(value).toFixed(2)}`;
const cartPath = 'M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2';

function drawReceipt(doc, sale) {
  const left = 12, width = 202.77;
  let y = 12;
  const text = (value, size = 8, bold = false, align = 'left') => {
    doc.font(bold ? 'Courier-Bold' : 'Courier').fontSize(size);
    doc.text(String(value), left, y, { width, align });
    y = doc.y + 3;
  };
  const line = () => {
    y += 4;
    doc.moveTo(left, y).lineTo(left + width, y).lineWidth(0.5).stroke();
    y += 7;
  };
  const pair = (label, value, size = 8, bold = false) => {
    doc.font(bold ? 'Courier-Bold' : 'Courier').fontSize(size);
    const valueWidth = Math.max(65, doc.widthOfString(value) + 2);
    doc.text(label, left, y, { width: width - valueWidth - 4 });
    const bottom = doc.y;
    doc.text(value, left + width - valueWidth, y, { width: valueWidth, align: 'right' });
    y = Math.max(bottom, doc.y) + 3;
  };
  const invoice = sale.tipo_comprobante === 'Factura';
  const cash = sale.metodo_pago === 'Efectivo';
  const company = sale.negocio;
  doc.save().translate((226.77 - 28) / 2, y).scale(28 / 16).path(cartPath).fill('black').restore();
  y += 34;
  text(company.nombre, 11, true, 'center');
  text(`RUC: ${company.ruc}`, 8, true, 'center');
  text(company.direccion, 8, false, 'center');
  if (company.telefono) text(`Tel.: ${company.telefono}`, 8, false, 'center');
  line();
  text(invoice ? 'FACTURA' : 'BOLETA DE VENTA', 14, true, 'center');
  text(`${sale.serie_comprobante}-${sale.numero_comprobante}`, 12, true, 'center');
  if (sale.estado === 'ANULADA') {
    doc.fillColor('#b42318');
    text('ANULADA - SIN EFECTO', 10, true, 'center');
    doc.fillColor('black');
  }
  line();
  text(`Fecha: ${new Date(sale.fecha_hora_fin).toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
  text(`Cajero: ${sale.cajero_nombre || sale.nom_usuario}`);
  text('Caja: CAJA 01 - Principal');
  line();
  text(`${invoice ? 'Razón social' : 'Cliente'}: ${sale.cliente_nombre}`);
  if (sale.cliente_documento && sale.cliente_documento !== '00000000') text(`${sale.cliente_tipo_documento}: ${sale.cliente_documento}`);
  line();
  pair('CANT. / DESCRIPCIÓN', 'IMPORTE', 7, true);
  for (const item of sale.items || []) {
    y += 5;
    doc.font('Courier').fontSize(8);
    doc.text(String(item.cantidad), left, y, { width: 15 });
    doc.text(item.producto_nombre || item.nombre || 'Producto', left + 19, y, { width: 132 });
    const bottom = doc.y;
    doc.text(Number(item.subtotal).toFixed(2), left + 153, y, { width: width - 153, align: 'right' });
    y = Math.max(bottom, doc.y) + 2;
    doc.fontSize(7).text(`P. unitario: ${money(item.precio_unitario)}`, left + 19, y, { width: width - 19 });
    y = doc.y + 3;
  }
  line();
  pair('Op. gravada', money(sale.subtotal));
  pair('IGV (18 %)', money(sale.monto_igv));
  line();
  pair(sale.estado === 'ANULADA' ? 'IMPORTE TOTAL' : 'TOTAL A PAGAR', money(sale.total), 11, true);
  line();
  text(`Método de pago: ${sale.metodo_pago}`);
  text(`${cash ? 'Monto recibido' : 'Monto pagado'}: ${money(sale.monto_recibido)}`);
  if (cash) text(`Vuelto: ${money(sale.vuelto)}`);
  text(`Productos: ${sale.items.length}    Unidades: ${sale.items.reduce((sum, item) => sum + Number(item.cantidad), 0)}`);
  line();
  doc.image(Buffer.from(sale.qr_data_url.split(',')[1], 'base64'), (226.77 - 85) / 2, y, { width: 85 });
  y += 89;
  text('Resumen del comprobante en ALTOKE', 7, false, 'center');
  line();
  text('¡GRACIAS POR SU COMPRA!', 9, true, 'center');
  text('Sin validez tributaria', 7, false, 'center');
  return y;
}

async function generateTicketPdf(input) {
  const sale = await presentReceipt(input);
  // Medir antes de generar: permite nombres largos y cualquier cantidad de productos.
  const measure = new PDFDocument({ size: [226.77, 50000], margin: 12 });
  measure.on('data', () => {});
  const height = Math.ceil(drawReceipt(measure, sale) + 16);
  measure.end();
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [226.77, height], margin: 12 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    drawReceipt(doc, sale);
    doc.end();
  });
}

module.exports = { generateTicketPdf };
