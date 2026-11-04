// Catálogo único de reglas y mensajes de validación.
// Fuente de texto: backend. Lo cargan el backend (require, Node >= 20.19) y el
// frontend (import mediante el alias @shared de Vite). Sin dependencias.

export const LIMITS = Object.freeze({
  nombres: 100,
  apellidos: 100,
  nombre_razon_social: 150,
  nombre_producto: 150,
  nombre_categoria: 100,
  descripcion: 255,
  cod_producto: 20,
  codigo_barras: 13,
  nom_usuario: 50,
  numero_documento: 20,
  search: 150,
  password_min: 8,
  password_bytes: 72,
  money_max: 99999999.99,
  int_max: 2147483647,
  // Coincide con DEFAULT de productos.stock_minimo en init.sql.
  stock_minimo_default: 5,
});

// Etiquetas por campo (frontend); el backend pasa su propia etiqueta.
export const FIELD_LABELS = Object.freeze({
  nombres: 'Los nombres',
  apellidos: 'Los apellidos',
  docNumber: 'El número de documento',
  nombre: 'El nombre',
  descripcion: 'La descripción',
  cod_producto: 'El código de producto',
  codigo_barras: 'El código de barras',
  nom_usuario: 'El usuario',
  password: 'La contraseña',
  numero_documento: 'El número de documento',
  precio_venta: 'El precio de venta',
  stock: 'El stock',
  stock_minimo: 'El stock mínimo',
  cantidad: 'La cantidad',
  montoRecibido: 'El monto recibido',
  monto_recibido: 'El monto recibido',
});

function agree(label) {
  const plural = /^(Los|Las) /.test(label);
  const feminine = /^(La|Las) /.test(label);
  return {
    ser: plural ? 'son' : 'es',
    pue: plural ? 'pueden' : 'puede',
    adm: plural ? 'admiten' : 'admite',
    obl: `obligatori${feminine ? 'a' : 'o'}${plural ? 's' : ''}`,
  };
}

export const MESSAGES = Object.freeze({
  login: 'Por favor ingrese su usuario y contraseña.',
  invalidCredentials: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
  dni: 'El DNI debe contener exactamente 8 dígitos numéricos.',
  ce: 'El Carné de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos.',
  rucDigits: 'El RUC debe contener exactamente 11 dígitos numéricos.',
  rucPrefix: 'El RUC debe comenzar con 10, 15, 17 o 20.',
  rucCheck: 'El dígito verificador del RUC no es correcto. Revise el número ingresado.',
  documentType: 'Tipo de documento inválido.',
  passwordMin: `La contraseña debe tener un mínimo de ${LIMITS.password_min} caracteres.`,
  passwordBytes: `La contraseña no puede superar ${LIMITS.password_bytes} bytes.`,
  passwordComplexity:
    'La contraseña debe contener al menos una mayúscula, una minúscula, un dígito y un carácter especial.',
  dateInvalid: 'Ingrese una fecha válida con un año de cuatro dígitos.',
  dateFuture: 'No se permiten fechas futuras en el historial de ventas.',
  dateRange: 'La fecha inicial no puede ser posterior a la final.',
  barcodeDigits: 'El código de barras debe contener exactamente 13 dígitos numéricos.',
  barcodeCheck: 'El dígito verificador EAN-13 no es correcto. Revise el número ingresado.',
  barcodeDuplicate: 'Ya existe un producto registrado con este código de barras.',
  internalCodeAuto: 'El código interno se genera automáticamente y no puede enviarse.',
  productInactive: 'Producto inactivo.',
  stockBelowMin: 'El stock inicial debe ser mayor o igual al stock mínimo.',
  moneyDigits: (label) => `${label} debe ser un número con hasta dos decimales.`,
  moneyPositive: (label) => `${label} debe ser mayor que 0.`,
  outOfRange: (label) => `${label} está fuera del rango permitido.`,
  integer: (label, min) => `${label} debe ser un número entero mayor o igual a ${min}.`,
  required: (label) => {
    const a = agree(label);
    return `${label} ${a.ser} ${a.obl} y no ${a.pue} contener solo espacios.`;
  },
  maxLength: (label, max) => `${label} ${agree(label).adm} hasta ${max} caracteres.`,
  personName: (label) => {
    const a = agree(label);
    return `${label} solo ${a.adm} letras, espacios, apóstrofos y guiones; no ${a.adm} números.`;
  },
  personNameLetters: (label) => `${label} debe contener letras.`,
  businessName: (label) =>
    `${label} solo ${agree(label).adm} letras, números, espacios y los signos & . , - ' ( ) /.`,
  needsLetter: (label) => `${label} debe contener al menos una letra.`,
});

export const PASSWORD_RULES = Object.freeze([
  { label: 'Al menos 8 caracteres', test: (v) => v.length >= LIMITS.password_min },
  { label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { label: 'Un número', test: (v) => /[0-9]/.test(v) },
  { label: 'Un símbolo distinto de un espacio', test: (v) => /[^A-Za-z0-9\s]/.test(v) },
  { label: 'Máximo 72 bytes', test: (v) => byteLength(v) <= LIMITS.password_bytes },
]);

export function byteLength(value) {
  return new TextEncoder().encode(String(value)).length;
}

// Devuelve el primer mensaje que incumple la contraseña, o '' si es válida.
export function passwordError(value) {
  if (typeof value !== 'string' || value.length < LIMITS.password_min) return MESSAGES.passwordMin;
  if (byteLength(value) > LIMITS.password_bytes) return MESSAGES.passwordBytes;
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9\s]/.test(value)) {
    return MESSAGES.passwordComplexity;
  }
  return '';
}

export function rucCheckDigit(firstTen) {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, index) => total + Number(firstTen[index]) * weight, 0);
  return String((11 - (sum % 11)) % 10);
}

export function rucError(value) {
  if (!/^\d{11}$/.test(value)) return MESSAGES.rucDigits;
  if (!/^(10|15|17|20)/.test(value)) return MESSAGES.rucPrefix;
  if (value[10] !== rucCheckDigit(value.slice(0, 10))) return MESSAGES.rucCheck;
  return '';
}

// Una regla completa por tipo de documento (documento + nombre del cliente).
// No existe valor por defecto: un tipo que no esté aquí es inválido.
const PERSON_NAME = /^[\p{L}\p{M} '\u2019-]+$/u;
export const DOCUMENT_RULES = Object.freeze({
  DNI: Object.freeze({
    type: 'DNI', min: 8, max: 8, pattern: /^\d*$/, message: MESSAGES.dni,
    documentExample: '71234567',
    nameLabel: 'Nombres y apellidos', nameFieldLabel: 'Los nombres y apellidos',
    nameKind: 'person', nameMax: 150, namePattern: PERSON_NAME,
    namePlaceholder: 'Ej. Elsa Chuquiruna Aguilar',
  }),
  CE: Object.freeze({
    type: 'CE', min: 9, max: 12, pattern: /^[A-Za-z0-9]*$/, message: MESSAGES.ce,
    documentExample: '001234567',
    nameLabel: 'Nombres y apellidos', nameFieldLabel: 'Los nombres y apellidos',
    nameKind: 'person', nameMax: 150, namePattern: PERSON_NAME,
    namePlaceholder: 'Ej. Elsa Chuquiruna Aguilar',
  }),
  RUC: Object.freeze({
    type: 'RUC', min: 11, max: 11, pattern: /^\d*$/, message: MESSAGES.rucDigits,
    documentExample: '20123456786',
    nameLabel: 'Razón social', nameFieldLabel: 'La razón social',
    nameKind: 'business', nameMax: 150, namePattern: /^[\p{L}\p{N} &.,\-'\u2019()/]+$/u,
    namePlaceholder: 'Ej. Comercial Andina S.A.C.',
  }),
});

export function documentRuleFor(type) {
  return Object.hasOwn(DOCUMENT_RULES, type) ? DOCUMENT_RULES[type] : null;
}

// Mensaje del formato de documento completo, o '' si es válido.
export function documentFormatError(type, value) {
  const rule = documentRuleFor(type);
  if (!rule) return MESSAGES.documentType;
  if (type === 'RUC') return rucError(value);
  const valid = rule.pattern.test(value) && value.length >= rule.min && value.length <= rule.max;
  return valid ? '' : rule.message;
}

// Mensaje del nombre del cliente según su regla, o ''.
export function clientNameError(rule, value) {
  if (!rule.namePattern.test(value)) {
    return rule.nameKind === 'business'
      ? MESSAGES.businessName(rule.nameFieldLabel)
      : MESSAGES.personName(rule.nameFieldLabel);
  }
  if (!/\p{L}/u.test(value)) {
    return rule.nameKind === 'business'
      ? MESSAGES.needsLetter(rule.nameFieldLabel)
      : MESSAGES.personName(rule.nameFieldLabel);
  }
  return '';
}

// EAN-13: dígito verificador a partir de los 12 primeros dígitos.
export function ean13CheckDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 ? 3 : 1);
  return String((10 - (sum % 10)) % 10);
}

export function ean13Error(value) {
  if (!/^\d{13}$/.test(value)) return MESSAGES.barcodeDigits;
  if (value[12] !== ean13CheckDigit(value.slice(0, 12))) return MESSAGES.barcodeCheck;
  return '';
}

export function formatInternalCode(n) {
  return `ALT-${String(n).padStart(4, '0')}`;
}

export function todayInLima() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (name) => parts.find((value) => value.type === name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function isValidDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    value >= '0001-01-01' &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

// Mensaje de una fecha suelta (formato y futuro), o ''.
export function dateError(value, today = todayInLima()) {
  if (!isValidDate(value)) return MESSAGES.dateInvalid;
  if (value > today) return MESSAGES.dateFuture;
  return '';
}
