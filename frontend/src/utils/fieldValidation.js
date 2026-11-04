// Reglas de campos del frontend. Límites y textos provienen de shared/validation-catalog.js
// (mismo catálogo que usa el backend).
import {
  LIMITS,
  documentRuleFor,
  clientNameError,
  FIELD_LABELS,
  MESSAGES,
  PASSWORD_RULES,
  byteLength,
  passwordError,
  rucError,
  ean13Error,
  rucCheckDigit,
  todayInLima,
  dateError as singleDateError,
} from '@shared/validation-catalog.js';

export { todayInLima, rucError, rucCheckDigit };

export function normalizeName(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/ {2,}/g, ' ');
}

function dateError(value, rule) {
  if (!value) return '';
  const invalid = singleDateError(value, todayInLima());
  if (invalid) return invalid;
  if ((rule.min && value < rule.min) || (rule.max && value > rule.max)) return MESSAGES.dateRange;
  return '';
}

// Regla del tipo de documento por abreviatura (DNI, CE o RUC); null si no existe (sin valor por defecto).
export function documentRule(type) {
  const rule = documentRuleFor(type);
  return rule
    ? { name: rule.type, min: rule.min, max: rule.max, pattern: rule.pattern, example: rule.documentExample }
    : null;
}

// Abreviatura del tipo elegido en un formulario, o '' si no está en el catálogo.
export function documentTypeName(docTypes, id) {
  return docTypes.find((t) => String(t.id_tipo_documento) === String(id))?.abreviatura || '';
}

function documentMessage(name) {
  return documentRuleFor(name)?.message || MESSAGES.documentType;
}

export const passwordRequirements = PASSWORD_RULES.map(({ label, test }) => [label, test]);

export function fieldRule(name = '', props = {}) {
  const label = FIELD_LABELS[name] || 'Este campo';
  const base = { label, field: name, requiredMessage: props.requiredMessage };
  if (['desde', 'hasta'].includes(name)) {
    const today = todayInLima();
    return {
      ...base,
      kind: 'date',
      min: props.min || '0001-01-01',
      max: props.max && props.max < today ? props.max : today,
    };
  }
  if (name === 'codigo_barras') {
    return { ...base, kind: 'barcode', max: LIMITS.codigo_barras };
  }
  if (name === 'numero_documento' || name === 'docNumber') {
    const rule = documentRule(props.documentType);
    return rule ? { ...base, kind: 'document', ...rule } : { ...base, kind: 'unknownType' };
  }
  if (name === 'nombre_razon_social') {
    const rule = documentRuleFor(props.documentType);
    return rule
      ? { ...base, kind: 'clientName', label: rule.nameFieldLabel, max: rule.nameMax, rule }
      : { ...base, kind: 'unknownType' };
  }
  if (['nombres', 'apellidos'].includes(name)) {
    return { ...base, kind: 'personName', max: LIMITS[name] };
  }
  if (name === 'password' && props.autoComplete === 'new-password') {
    return { ...base, kind: 'password' };
  }
  if (['stock', 'stock_minimo', 'cantidad'].includes(name)) {
    return {
      ...base,
      kind: 'integer',
      min: Number(props.min ?? (name === 'cantidad' ? 1 : 0)),
      max: props.max ?? LIMITS.int_max,
    };
  }
  if (['precio_venta', 'montoRecibido', 'monto_recibido'].includes(name)) {
    return { ...base, kind: 'money', min: name === 'precio_venta' ? 0.01 : 0, max: LIMITS.money_max };
  }
  const limits = {
    nombre: LIMITS.nombre_producto,
    descripcion: LIMITS.descripcion,
    cod_producto: LIMITS.cod_producto,
    nom_usuario: LIMITS.nom_usuario,
    search: LIMITS.search,
    productQuery: LIMITS.search,
  };
  return {
    ...base,
    kind: 'text',
    max: props.maxLength ?? limits[name],
    // Contraseña de inicio de sesión: solo se limita el tamaño que admite bcrypt.
    bytes: name === 'password' ? LIMITS.password_bytes : undefined,
  };
}

export function entryError(value, rule) {
  if (rule.kind === 'date') return dateError(value, rule);
  if (rule.kind === 'unknownType') return value === '' ? '' : MESSAGES.documentType;
  if (rule.kind === 'clientName') {
    if (value !== '' && !rule.rule.namePattern.test(value)) {
      return rule.rule.nameKind === 'business'
        ? MESSAGES.businessName(rule.label)
        : MESSAGES.personName(rule.label);
    }
    if (value.length > rule.max) return MESSAGES.maxLength(rule.label, rule.max);
  }
  if (rule.kind === 'personName' && !/^[\p{L}\p{M} '’-]*$/u.test(value)) {
    return MESSAGES.personName(rule.label);
  }

  if (rule.kind === 'barcode' && (!/^\d*$/.test(value) || value.length > rule.max)) {
    return MESSAGES.barcodeDigits;
  }

  if (rule.kind === 'document') {
    if (!rule.pattern.test(value)) return documentMessage(rule.name);
    if (rule.name === 'RUC') {
      if (
        (value.length === 1 && !/^[12]$/.test(value)) ||
        (value.length >= 2 && !/^(10|15|17|20)/.test(value))
      ) {
        return MESSAGES.rucPrefix;
      }
      if (value.length === 11) return rucError(value);
    }
    if (value.length > rule.max) return documentMessage(rule.name);
  }
  if (rule.kind === 'integer' && value !== '') {
    if (!/^\d+$/.test(value)) return MESSAGES.integer(rule.label, rule.min);
    if (Number(value) > Number(rule.max)) return MESSAGES.outOfRange(rule.label);
  }
  if (rule.kind === 'money' && value !== '') {
    if (!/^\d*(?:\.\d{0,2})?$/.test(value)) return MESSAGES.moneyDigits(rule.label);
    if (Number(value) > rule.max) return MESSAGES.outOfRange(rule.label);
  }
  if (['text', 'personName'].includes(rule.kind) && rule.max && value.length > rule.max) {
    return MESSAGES.maxLength(rule.label, rule.max);
  }
  if (
    (rule.kind === 'password' || rule.bytes) &&
    byteLength(value) > LIMITS.password_bytes
  ) {
    return MESSAGES.passwordBytes;
  }
  return '';
}

export function valueError(value, rule, required = false) {
  const text = String(value ?? '');
  if (rule.kind === 'unknownType') return MESSAGES.documentType;
  if (required && !text.trim()) {
    return rule.requiredMessage || MESSAGES.required(rule.label);
  }
  if (!text) {
    return '';
  }
  if (rule.kind === 'date') return dateError(text, rule);
  if (rule.kind === 'money' && !/^\d+(?:\.\d{1,2})?$/.test(text)) {
    return MESSAGES.moneyDigits(rule.label);
  }
  const invalid = entryError(text, rule);
  if (invalid) {
    return invalid;
  }
  if (rule.kind === 'personName' && !/\p{L}/u.test(text)) {
    return MESSAGES.personName(rule.label);
  }
  if (rule.kind === 'clientName') return clientNameError(rule.rule, text);
  if (rule.kind === 'barcode') return ean13Error(text);
  if (rule.kind === 'document' && text.length < rule.min) {
    return documentMessage(rule.name);
  }
  if (['integer', 'money'].includes(rule.kind)) {
    if (!Number.isFinite(Number(text)) || text === '.') {
      return rule.kind === 'money' ? MESSAGES.moneyDigits(rule.label) : MESSAGES.integer(rule.label, rule.min);
    }
    if (Number(text) < rule.min) {
      if (rule.field === 'stock' && rule.min > 0) return MESSAGES.stockBelowMin;
      return rule.kind === 'money' && rule.min > 0
        ? MESSAGES.moneyPositive(rule.label)
        : rule.kind === 'money'
          ? MESSAGES.outOfRange(rule.label)
          : MESSAGES.integer(rule.label, rule.min);
    }
  }
  if (rule.kind === 'password') return passwordError(text);
  return '';
}

// El servidor envía { message, field }; axiosClient registra la pareja aquí para que
// los formularios asocien el mensaje con el campo correcto.
const serverFields = new Map();
export function registerServerField(message, field) {
  if (!message || !field) return;
  if (serverFields.size >= 50) serverFields.delete(serverFields.keys().next().value);
  serverFields.set(message, field);
}

export function serverField(message = '') {
  if (serverFields.has(message)) return serverFields.get(message);
  // Respaldo para errores sin campo (por ejemplo, claves duplicadas de MySQL).
  if (/número de documento|\b(DNI|RUC)\b/.test(message)) return 'numero_documento';
  return '';
}
