// Validaciones del servidor. Reglas y textos provienen de shared/validation-catalog.js.
const catalog = require('../../../shared/validation-catalog.js');

const { LIMITS, MESSAGES, rucCheckDigit, rucError, documentFormatError } = catalog;

function fail(message, status = 400, field) {
  return Object.assign(new Error(message), { status, ...(field ? { field } : {}) });
}

function text(value, label, max = 150, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(MESSAGES.required(label), 400, field);
  }
  const clean = value.trim();
  if (clean.length > max) {
    throw fail(MESSAGES.maxLength(label, max), 400, field);
  }
  return clean;
}

function personName(value, label, max = 100, field) {
  const clean = text(value, label, max, field).normalize('NFC').replace(/ {2,}/g, ' ');
  if (!/^[\p{L}\p{M} '’-]+$/u.test(clean) || !/\p{L}/u.test(clean)) {
    throw fail(MESSAGES.personName(label), 400, field);
  }
  return clean;
}

// Regla del tipo de documento; un tipo desconocido se rechaza (no hay valor por defecto).
function documentRule(type) {
  const rule = catalog.documentRuleFor(type);
  if (!rule) throw fail(MESSAGES.documentType, 400, 'id_tipo_documento');
  return rule;
}

function clientName(value, documentType) {
  const rule = documentRule(documentType);
  const clean = text(value, rule.nameFieldLabel, rule.nameMax, 'nombre_razon_social')
    .normalize('NFC')
    .replace(/ {2,}/g, ' ');
  const error = catalog.clientNameError(rule, clean);
  if (error) throw fail(error, 400, 'nombre_razon_social');
  return clean;
}

// Descripción opcional: se recorta antes de medir (igual en productos y categorías).
function description(value) {
  if (value == null) return '';
  if (typeof value !== 'string') throw fail(MESSAGES.maxLength('La descripción', LIMITS.descripcion), 400, 'descripcion');
  const clean = value.trim();
  if (clean.length > LIMITS.descripcion) {
    throw fail(MESSAGES.maxLength('La descripción', LIMITS.descripcion), 400, 'descripcion');
  }
  return clean;
}

function integer(value, label, min = 0, field) {
  if (
    !['string', 'number'].includes(typeof value) ||
    !/^\d+$/.test(String(value).trim())
  ) {
    throw fail(MESSAGES.integer(label, min), 400, field);
  }
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > LIMITS.int_max) {
    throw fail(MESSAGES.outOfRange(label), 400, field);
  }
  return n;
}

function money(value, label = 'El importe', allowZero = true, field) {
  if (
    !['string', 'number'].includes(typeof value) ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(value).trim())
  ) {
    throw fail(MESSAGES.moneyDigits(label), 400, field);
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n > LIMITS.money_max || n < 0) {
    throw fail(MESSAGES.outOfRange(label), 400, field);
  }
  if (!allowZero && n === 0) {
    throw fail(MESSAGES.moneyPositive(label), 400, field);
  }
  return Math.round(n * 100);
}

function active(value, fallback = true) {
  if (value === undefined) {
    return Boolean(fallback);
  }
  if ([true, 1, '1', 'true'].includes(value)) {
    return true;
  }
  if ([false, 0, '0', 'false'].includes(value)) {
    return false;
  }
  throw fail('El estado debe ser activo o inactivo.', 400, 'estado');
}

function password(value) {
  const message = catalog.passwordError(value);
  if (message) throw fail(message, 400, 'password');
  return value;
}

function documentNumber(type, value) {
  documentRule(type);
  const n = text(value, 'El número de documento', LIMITS.numero_documento, 'numero_documento');
  const error = documentFormatError(type, n);
  if (error) throw fail(error, 400, 'numero_documento');
  return n;
}

function barcode(value) {
  const n = text(value, 'El código de barras', LIMITS.codigo_barras, 'codigo_barras');
  const error = catalog.ean13Error(n);
  if (error) throw fail(error, 400, 'codigo_barras');
  return n;
}

function validateDates(filters = {}) {
  const today = catalog.todayInLima();
  for (const key of ['desde', 'hasta']) {
    if (!filters[key]) continue;
    const error = catalog.dateError(filters[key], today);
    if (error) throw fail(error, 400, key);
  }
  if (filters.desde && filters.hasta && filters.desde > filters.hasta) {
    throw fail(MESSAGES.dateRange, 400, 'desde');
  }
  return filters;
}

module.exports = {
  rucCheckDigit, rucError, fail, documentRule, text, personName, clientName, description,
  integer, money, active, password, barcode, documentNumber, validateDates,
};
