const QRCode = require('qrcode');
const business = require('../config/business');

async function presentReceipt(sale) {
  const negocio = { ...business, ...sale.negocio, ruc: sale.negocio?.ruc || business.ruc };
  const receipt = { ...sale, negocio };
  // QR local: contiene un resumen legible; no expone endpoints ni datos del cliente.
  receipt.qr_text = [
    negocio.nombre,
    `RUC: ${negocio.ruc}`,
    `${sale.tipo_comprobante}: ${sale.serie_comprobante}-${sale.numero_comprobante}`,
    `Fecha: ${new Date(sale.fecha_hora_fin).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}`,
    `Total: S/ ${Number(sale.total).toFixed(2)}`,
    `Estado: ${sale.estado || 'COMPLETADA'}`,
    'Sin validez tributaria.',
  ].join('\n');
  receipt.qr_data_url = await QRCode.toDataURL(receipt.qr_text, { width: 240, margin: 2, errorCorrectionLevel: 'M' });
  return receipt;
}

module.exports = { presentReceipt };
