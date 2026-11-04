const PDFDocument = require('pdfkit');
function generateSalesReportPdf(sales, metrics = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 25 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Título
    doc.rect(25, 25, 792, 40).fill('#4A121A');
    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#FFFFFF')
      .text('ALTOKE MINIMARKET S.A.C. - REPORTE DE VENTAS', 35, 38);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#000000')
      .text(
        `Generado el: ${new Date().toLocaleString('es-PE')}  |  Caja: CAJA 01 - PRINCIPAL`,
        25,
        75,
      );

    // Métricas
    doc.rect(25, 95, 185, 45).fillAndStroke('#FEF3ED', '#DCA349');
    doc
      .fillColor('#4A121A')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('INGRESOS TOTALES', 35, 102);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(`S/ ${Number(metrics.ingresos_totales || 0).toFixed(2)}`, 35, 118);

    doc.rect(225, 95, 185, 45).fillAndStroke('#FEF3ED', '#DCA349');
    doc
      .fillColor('#4A121A')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('VENTAS REALIZADAS', 235, 102);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(`${metrics.ventas_realizadas || 0}`, 235, 118);

    doc.rect(425, 95, 185, 45).fillAndStroke('#FEF3ED', '#DCA349');
    doc
      .fillColor('#4A121A')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('TICKET PROMEDIO', 435, 102);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(`S/ ${Number(metrics.ticket_promedio || 0).toFixed(2)}`, 435, 118);

    doc.rect(625, 95, 185, 45).fillAndStroke('#FEF3ED', '#DCA349');
    doc
      .fillColor('#4A121A')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('TIEMPO DE ATENCIÓN PROM.', 635, 102);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(`${Math.round(metrics.tiempo_atencion_promedio || 0)} seg`, 635, 118);

    doc.font('Helvetica').fontSize(7).fillColor('#333333').text('Indicadores: solo ventas completadas. Las anuladas se identifican en rojo.', 25, 145);

    // Tabla de resultados
    let y = 155;
    doc.rect(25, y, 792, 22).fill('#DCA349');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
    doc.text('FECHA/HORA', 35, y + 6);
    doc.text('N° COMPROBANTE', 145, y + 6);
    doc.text('TIPO', 255, y + 6);
    doc.text('CLIENTE', 320, y + 6);
    doc.text('MÉTODO PAGO', 490, y + 6);
    doc.text('CAJERO', 590, y + 6);
    doc.text('TOTAL', 730, y + 6, { align: 'right', width: 75 });

    y += 24;
    doc.fillColor('#333333').font('Helvetica').fontSize(8);

    sales.forEach((s, idx) => {
      if (y > 540) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 25 });
        y = 35;
      }
      if (idx % 2 === 1) {
        doc.rect(25, y - 2, 792, 22).fill('#FBF6F3');
      }
      doc.fillColor('#333333');
      doc.text(new Date(s.fecha_hora_fin).toLocaleString('es-PE'), 35, y + 2);
      doc.text(`${s.serie_comprobante}-${s.numero_comprobante}`, 145, y + 2);
      doc.text(s.tipo_comprobante, 255, y + 2);
      if (s.estado === 'ANULADA') {
        doc.fillColor('#b42318').fontSize(6).text('ANULADA', 255, y + 12, { width: 60 });
        doc.fillColor('#333333').fontSize(8);
      }
      doc.text((s.cliente_nombre || '').substring(0, 28), 320, y + 2);
      doc.text(s.metodo_pago, 490, y + 2);
      doc.text(s.cajero_nombre || s.nom_usuario, 590, y + 2);
      doc.font('Helvetica-Bold').text(`S/ ${Number(s.total).toFixed(2)}`, 730, y + 2, {
        align: 'right',
        width: 75,
      });
      doc.font('Helvetica');
      y += 22;
    });

    doc.end();
  });
}

module.exports = { generateSalesReportPdf };
