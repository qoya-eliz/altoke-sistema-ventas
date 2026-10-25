export function todayInLima() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (name) => parts.find((value) => value.type === name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function normalizeName(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/ {2,}/g, ' ');
}

function dateError(value, rule) {
  if (!value) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value || value < '0001-01-01') {
    return 'Ingrese una fecha válida con un año de cuatro dígitos.';
  }
  if (value > todayInLima()) return 'No se permiten fechas futuras en el historial de ventas.';
  if (rule.min && value < rule.min) return 'La fecha final debe ser igual o posterior a la inicial.';
  if (rule.max && value > rule.max) return 'La fecha inicial debe ser igual o anterior a la final.';
  return '';
}

export function rucCheckDigit(firstTen) {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, index) => total + Number(firstTen[index]) * weight, 0);
  return String((11 - (sum % 11)) % 10);
}

export function rucError(value) {
  if (!/^\d{11}$/.test(value)) return 'El RUC debe contener exactamente 11 dígitos numéricos.';
  if (!/^(10|15|17|20)/.test(value)) return 'El RUC debe comenzar con 10, 15, 17 o 20.';
  if (value[10] !== rucCheckDigit(value.slice(0, 10))) return 'El dígito verificador del RUC no es correcto. Revise el número ingresado.';
  return '';
}

const DOCUMENTS = { 1: 'DNI', 2: 'RUC', 3: 'CE' };
export function documentRule(type) {
  const name = DOCUMENTS[String(type)] || type;
  return name === 'RUC'
    ? { name, min: 11, max: 11, pattern: /^\d*$/ }
    : name === 'CE'
      ? { name, min: 9, max: 12, pattern: /^[a-zA-Z0-9]*$/ }
      : { name: 'DNI', min: 8, max: 8, pattern: /^\d*$/ };
}
export const passwordRequirements = [
  ['Al menos 8 caracteres', (value) => value.length >= 8],
  ['Una letra mayúscula', (value) => /[A-Z]/.test(value)],
  ['Una letra minúscula', (value) => /[a-z]/.test(value)],
  ['Un número', (value) => /[0-9]/.test(value)],
  ['Un símbolo distinto de un espacio', (value) => /[^A-Za-z0-9\s]/.test(value)],
  ['Máximo 72 bytes', (value) => new TextEncoder().encode(value).length <= 72],
];
export function fieldRule(name = '', props = {}) {
  if (['desde', 'hasta'].includes(name)) {
    const today = todayInLima();
    return { kind: 'date', min: props.min || '0001-01-01', max: props.max && props.max < today ? props.max : today };
  }
  if (name === 'numero_documento' || name === 'docNumber') {
    return { kind: 'document', ...documentRule(props.documentType) };
  }
  if (['nombres', 'apellidos'].includes(name) ||
      (name === 'nombre_razon_social' && documentRule(props.documentType).name !== 'RUC')) {
    return { kind: 'personName', max: name === 'nombre_razon_social' ? 150 : 100 };
  }
  if (name === 'password' && props.autoComplete === 'new-password') {
    return { kind: 'password' };
  }
  if (['stock', 'stock_minimo', 'cantidad'].includes(name)) {
    return {
      kind: 'integer',
      min: Number(props.min ?? (name === 'cantidad' ? 1 : 0)),
      max: props.max ?? 2147483647,
    };
  }
  if (['precio_venta', 'montoRecibido', 'monto_recibido'].includes(name)) {
    return { kind: 'money', min: name === 'precio_venta' ? 0.01 : 0, max: 99999999.99 };
  }
  const limits = {
    nombre: 150,
    nombre_razon_social: 150,
    nombres: 100,
    apellidos: 100,
    descripcion: 255,
    cod_producto: 20,
    nom_usuario: 50,
    search: 150,
    productQuery: 150,
  };
  return { kind: 'text', max: props.maxLength ?? limits[name] };
}
export function entryError(value, rule) {
  if (rule.kind === 'date') return dateError(value, rule);
  if (rule.kind === 'personName' && !/^[\p{L}\p{M} '\u2019-]*$/u.test(value)) {
    return 'Solo letras, espacios, apóstrofos y guiones; no se permiten números.';
  }

  if (rule.kind === 'document') {
    if (!rule.pattern.test(value)) {
      return `${rule.name}: ${rule.name === 'CE' ? 'solo letras y números' : 'solo dígitos numéricos'}.`;
    }
    if (rule.name === 'RUC') {
      if ((value.length === 1 && !/^[12]$/.test(value)) ||
          (value.length >= 2 && !/^(10|15|17|20)/.test(value))) {
        return 'El RUC debe comenzar con 10, 15, 17 o 20.';
      }
      if (value.length === 11) return rucError(value);
    }
    if (value.length > rule.max) {
      return `${rule.name}: máximo ${rule.max} caracteres. El valor no se ha modificado.`;
    }
  }
  if (
    rule.kind === 'integer' &&
    value !== '' &&
    (!/^\d+$/.test(value) || Number(value) > Number(rule.max))
  ) {
    return `Ingrese un entero entre ${rule.min} y ${rule.max}.`;
  }
  if (
    rule.kind === 'money' &&
    value !== '' &&
    (!/^\d*(?:\.\d{0,2})?$/.test(value) || Number(value) > rule.max)
  ) {
    return 'Ingrese un importe de hasta 99 999 999.99 con máximo dos decimales.';
  }
  if (['text', 'personName'].includes(rule.kind) && rule.max && value.length > rule.max) {
    return `Máximo ${rule.max} caracteres. El valor no se ha modificado.`;
  }
  if (rule.kind === 'password' && new TextEncoder().encode(value).length > 72) {
    return 'La contraseña admite hasta 72 bytes.';
  }
  return '';
}
export function valueError(value, rule, required = false) {
  const text = String(value ?? '');
  if (required && !text.trim()) {
    return 'Este campo es obligatorio; no admite solo espacios.';
  }
  if (!text) {
    return '';
  }
  if (rule.kind === 'date') return dateError(text, rule);
  if (rule.kind === 'money' && !/^\d+(?:\.\d{1,2})?$/.test(text)) {
    return 'Complete el importe, por ejemplo 0.50 o 10.00.';
  }
  const invalid = entryError(text, rule);
  if (invalid) {
    return invalid;
  }
  if (rule.kind === 'personName' && !/\p{L}/u.test(text)) {
    return 'Ingrese un nombre que contenga letras.';
  }
  if (rule.kind === 'document' && text.length < rule.min) {
    return `${rule.name}: ${rule.min === rule.max ? 'debe tener exactamente' : 'debe tener entre'} ${rule.min}${rule.min !== rule.max ? ` y ${rule.max}` : ''} caracteres.`;
  }
  if (
    ['integer', 'money'].includes(rule.kind) &&
    (!Number.isFinite(Number(text)) || text === '.' || Number(text) < rule.min)
  ) {
    return `El valor mínimo permitido es ${rule.min}.`;
  }
  if (rule.kind === 'password' && passwordRequirements.some(([, test]) => !test(text))) {
    return 'Complete los requisitos de la contraseña.';
  }
  return '';
}
export function serverField(message = '') {
  if (/documento|DNI|RUC|CE registrado/i.test(message)) {
    return 'numero_documento';
  }
  if (/código.*(existe|registrado)|código de producto/i.test(message)) {
    return 'cod_producto';
  }
  if (/nombre del cliente|razón social/i.test(message)) return 'nombre_razon_social';
  if (/Los nombres/i.test(message)) return 'nombres';
  if (/Los apellidos/i.test(message)) return 'apellidos';
  if (/contraseña/i.test(message)) {
    return 'password';
  }
  if (
    /categoría.*nombre|categoría con este nombre|categoría con ese nombre/i.test(message)
  ) {
    return 'nombre';
  }
  return '';
}
