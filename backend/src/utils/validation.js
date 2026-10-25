function rucCheckDigit(firstTen) {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, index) => total + Number(firstTen[index]) * weight, 0);
  return String((11 - (sum % 11)) % 10);
}

function rucError(value) {
  if (!/^\d{11}$/.test(value)) return 'El RUC debe contener exactamente 11 dígitos numéricos.';
  if (!/^(10|15|17|20)/.test(value)) return 'El RUC debe comenzar con 10, 15, 17 o 20.';
  if (value[10] !== rucCheckDigit(value.slice(0, 10))) return 'El dígito verificador del RUC no es correcto. Revise el número ingresado.';
  return '';
}

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function text(value, label, max = 150) {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(`${label} es obligatorio y no puede contener solo espacios.`);
  }
  const clean = value.trim();
  if (clean.length > max) {
    throw fail(`${label} admite hasta ${max} caracteres.`);
  }
  return clean;
}

function personName(value, label, max = 100) {
  const clean = text(value, label, max).normalize('NFC').replace(/ {2,}/g, ' ');
  if (!/^[\p{L}\p{M} '\u2019-]+$/u.test(clean) || !/\p{L}/u.test(clean)) {
    throw fail(`${label} solo admite letras, espacios, apóstrofos y guiones; no admite números.`);
  }
  return clean;
}

function clientName(value, documentType) {
  return documentType === 'RUC'
    ? text(value, 'La razón social', 150).replace(/ {2,}/g, ' ')
    : personName(value, 'El nombre del cliente', 150);
}

function integer(value, label, min = 0) {
  if (
    !['string', 'number'].includes(typeof value) ||
    !/^\d+$/.test(String(value).trim())
  ) {
    throw fail(`${label} debe ser un número entero mayor o igual a ${min}.`);
  }
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > 2147483647) {
    throw fail(`${label} está fuera del rango permitido.`);
  }
  return n;
}

function money(value, label = 'El importe', allowZero = true) {
  if (
    !['string', 'number'].includes(typeof value) ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(value).trim())
  ) {
    throw fail(`${label} debe ser un número con hasta dos decimales.`);
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n > 99999999.99 || n < 0 || (!allowZero && n === 0)) {
    throw fail(`${label} está fuera del rango permitido.`);
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
  throw fail('El estado debe ser activo o inactivo.');
}

function documentNumber(type, value) {
  const n = text(value, 'El número de documento', 20);
  if (type === 'DNI' && !/^\d{8}$/.test(n)) {
    throw fail('El DNI debe contener exactamente 8 dígitos numéricos.');
  }
  if (type === 'RUC') {
    const error = rucError(n);
    if (error) throw fail(error);
  }
  if (type === 'CE' && !/^[A-Za-z0-9]{9,12}$/.test(n)) {
    throw fail(
      'El Carné de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos.',
    );
  }
  if (!['DNI', 'RUC', 'CE'].includes(type)) {
    throw fail('Tipo de documento inválido.');
  }
  return n;
}

function validateDates(filters = {}) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (name) => parts.find((value) => value.type === name).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const valid = (value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && value >= '0001-01-01' &&
    new Date(value).toISOString().slice(0, 10) === value;
  for (const key of ['desde', 'hasta']) {
    if (!filters[key]) continue;
    if (!valid(filters[key])) throw fail('Ingrese una fecha válida con un año de cuatro dígitos.');
    if (filters[key] > today) throw fail('No se permiten fechas futuras en el historial de ventas.');
  }
  if (filters.desde && filters.hasta && filters.desde > filters.hasta) {
    throw fail('La fecha inicial no puede ser posterior a la final.');
  }
  return filters;
}

module.exports = { rucCheckDigit, rucError, fail, text, personName, clientName, integer, money, active, documentNumber, validateDates };
