const ExcelJS = require('exceljs');

async function generateSalesExcel(sales, metrics = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ALTOKE MINIMARKET S.A.C.';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Reporte de Ventas', {
    pageSetup: { orientation: 'landscape', paperSize: 9 },
  });

  // Título Principal
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ALTOKE MINIMARKET S.A.C. - REPORTE DE TRANSACCIONES Y VENTAS';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A121A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 32;

  // Fecha de exportación
  worksheet.mergeCells('A2:K2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Generado el: ${new Date().toLocaleString('es-PE')} | Caja: CAJA 01 - PRINCIPAL`;
  dateCell.font = { name: 'Arial', size: 10, italic: true };
  dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Métricas de Resumen
  worksheet.addRow([]);
  const metricsRow = worksheet.addRow([
    'INGRESOS TOTALES',
    `S/ ${Number(metrics.ingresos_totales || 0).toFixed(2)}`,
    '',
    'VENTAS REALIZADAS',
    `${metrics.ventas_realizadas || 0}`,
    '',
    'TICKET PROMEDIO',
    `S/ ${Number(metrics.ticket_promedio || 0).toFixed(2)}`,
    'T. ATENCIÓN PROM.',
    `${Math.round(metrics.tiempo_atencion_promedio || 0)} seg`,
  ]);
  metricsRow.font = { name: 'Arial', size: 10, bold: true };
  worksheet.addRow([]);

  worksheet.addRow(['Los indicadores incluyen únicamente ventas completadas. Las anuladas se conservan para consulta.']);

  // Encabezados de Tabla
  const headers = [
    'FECHA / HORA',
    'N° COMPROBANTE',
    'TIPO',
    'CLIENTE',
    'MÉTODO DE PAGO',
    'CAJERO',
    'SUBTOTAL (S/)',
    'IGV (S/)',
    'TOTAL (S/)',
    'TIEMPO (SEG)',
    'ESTADO',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCA349' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Datos
  sales.forEach((s) => {
    const row = worksheet.addRow([
      new Date(s.fecha_hora_fin).toLocaleString('es-PE'),
      `${s.serie_comprobante}-${s.numero_comprobante}`,
      s.tipo_comprobante,
      s.cliente_nombre,
      s.metodo_pago,
      s.cajero_nombre,
      Number(s.subtotal),
      Number(s.monto_igv),
      Number(s.total),
      s.tiempo_atencion_seg,
      s.estado,
    ]);

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9, ...(s.estado === 'ANULADA' ? { color: { argb: 'FFB42318' } } : {}) };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
      if ([7, 8, 9].includes(colNumber)) {
        cell.alignment = { horizontal: 'right' };
        cell.numFmt = '0.00';
      } else if ([1, 2, 3, 5, 10].includes(colNumber)) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  // Ancho de columnas automático
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const colLength = cell.value ? cell.value.toString().length : 10;
      if (colLength > maxLength) {
        maxLength = colLength;
      }
    });
    column.width = Math.max(maxLength + 3, 14);
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generateSalesExcel };
