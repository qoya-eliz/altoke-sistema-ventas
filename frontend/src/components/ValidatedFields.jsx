import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import {
  fieldRule,
  normalizeName,
  entryError,
  valueError,
  passwordRequirements,
  serverField,
} from '../utils/fieldValidation.js';
const FormContext = createContext({ serverError: '', busy: false });
export function ValidatedForm({
  children,
  onSubmit,
  serverError = '',
  busy = false,
  ...props
}) {
  function submit(event) {
    if (busy) {
      event.preventDefault();
      return;
    }
    const controls = [...event.currentTarget.elements].filter(
      (control) => control.willValidate,
    );
    const invalid = controls.filter((control) => !control.checkValidity());
    if (invalid.length) {
      event.preventDefault();
      controls.forEach((control) => control.dispatchEvent(new Event('altoke:validate')));
      invalid[0].focus();
      return;
    }
    onSubmit?.(event);
  }
  return (
    <FormContext.Provider value={{ serverError, busy }}>
      <form {...props} aria-busy={busy} noValidate onSubmit={submit}>
        {busy && (
          <div className="form-saving-status" role="status">
            Procesando solicitud…
          </div>
        )}
        {children}
      </form>
    </FormContext.Provider>
  );
}

function Field({
  as: Tag = 'input',
  documentType,
  name,
  value,
  onChange,
  onBlur,
  onPaste,
  className = '',
  children,
  ...props
}) {
  const id = useId();
  const control = useRef(null);
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState('');
  const { serverError, busy } = useContext(FormContext);
  const rule = fieldRule(name, { ...props, documentType });
  const skip =
    busy ||
    props.disabled ||
    props.readOnly ||
    ['checkbox', 'radio'].includes(props.type);
  const error = skip ? '' : valueError(value, rule, props.required);
  const backendError = serverField(serverError) === name ? serverError : '';
  const message =
    notice || backendError || (touched || String(value ?? '').length > 0 ? error : '');
  useEffect(() => {
    const input = control.current;
    input?.setCustomValidity(error);
    if (input) {
      const group = input.closest('.input-group');
      const container = group ? group.parentElement : input.parentElement;
      const label = container?.querySelector('label');
      if (label && !label.htmlFor) {
        label.htmlFor = input.id;
      }
    }
    const validate = () => setTouched(true);
    input?.addEventListener('altoke:validate', validate);
    return () => input?.removeEventListener('altoke:validate', validate);
  }, [error]);

  function change(event) {
    const rejected = skip ? '' : entryError(event.target.value, rule);
    setNotice(rejected);
    setTouched(true);
    if (!rejected) {
      onChange?.(event);
    }
  }

  function paste(event) {
    if (Tag !== 'input' && Tag !== 'textarea') {
      return;
    }
    if (skip) {
      return;
    }
    const input = event.currentTarget;
    const incoming = event.clipboardData.getData('text');
    const proposed =
      String(value ?? '').slice(0, input.selectionStart ?? 0) +
      incoming +
      String(value ?? '').slice(input.selectionEnd ?? String(value ?? '').length);
    const rejected = entryError(proposed, rule);
    if (rejected) {
      event.preventDefault();
      setNotice(`No se pegó el contenido. ${rejected}`);
      return;
    }
    onPaste?.(event);
  }

  function beforeInput(event) {
    if (skip || Tag !== 'input') {
      return;
    }
    const data = event.nativeEvent.data;
    if (!data) {
      return;
    }
    const input = event.currentTarget;
    const proposed =
      String(value ?? '').slice(0, input.selectionStart ?? 0) +
      data +
      String(value ?? '').slice(input.selectionEnd ?? String(value ?? '').length);
    const rejected = entryError(proposed, rule);
    if (rejected) {
      event.preventDefault();
      setNotice(rejected);
    }
  }
  const numeric = ['integer', 'money'].includes(rule.kind);
  const maxLength =
    rule.kind === 'document'
      ? rule.max
      : ['text', 'personName'].includes(rule.kind)
        ? rule.max
        : props.maxLength;
  return (
    <>
      <Tag
        {...props}
        disabled={props.disabled || busy}
        ref={control}
        id={props.id || id}
        name={name}
        value={value}
        type={Tag === 'input' && numeric ? 'text' : props.type}
        inputMode={
          (rule.kind === 'document' && rule.name !== 'CE') || rule.kind === 'integer'
            ? 'numeric'
            : rule.kind === 'money'
              ? 'decimal'
              : props.inputMode
        }
        maxLength={maxLength}
        min={rule.kind === 'date' ? rule.min : props.min}
        max={rule.kind === 'date' ? rule.max : props.max}
        className={`${className} ${message ? 'is-invalid' : ''}`}
        aria-invalid={!!message}
        aria-describedby={message ? `${id}-error` : undefined}
        onBeforeInput={beforeInput}
        onChange={change}
        onPaste={paste}
        onBlur={(event) => {
          setTouched(true);
          if (!skip && ['nombres', 'apellidos', 'nombre_razon_social'].includes(name)) {
            const normalized = normalizeName(event.target.value);
            if (normalized !== event.target.value) {
              event.target.value = normalized;
              onChange?.(event);
            }
          }
          onBlur?.(event);
        }}
      >
        {children}
      </Tag>
      {message && (
        <div
          id={`${id}-error`}
          className="field-error invalid-feedback d-block"
          role="status"
        >
          {message}
        </div>
      )}
      {rule.kind === 'password' && !skip && (
        <ul className="password-checklist" aria-label="Requisitos de contraseña">
          {passwordRequirements.map(([label, test]) => (
            <li
              key={label}
              className={test(String(value ?? '')) ? 'text-success' : 'text-muted'}
            >
              <span aria-hidden="true">{test(String(value ?? '')) ? '✓' : '○'}</span>{' '}
              {label}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
export function ValidatedInput(props) {
  return <Field {...props} />;
}
export function ValidatedSelect(props) {
  return <Field {...props} as="select" />;
}
export function ValidatedTextarea(props) {
  return <Field {...props} as="textarea" />;
}
