import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  children,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Continuar',
  busy = false,
  variant = 'default',
  icon = 'bi-question-circle',
}) {
  const titleId = useId();
  const cancel = useRef(null);

  useEffect(() => {
    if (isOpen) cancel.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const plain = variant === 'plain';
  const warning = variant === 'warning';

  return (
    <div
      className={`modal show d-block confirmation-dialog altoke-confirmation ${plain ? 'altoke-confirmation-plain' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header altoke-confirmation-header">
            <h5 id={titleId} className="modal-title">
              {!plain && (
                <i
                  className={`bi ${warning ? 'bi-exclamation-triangle-fill' : icon}`}
                  aria-hidden="true"
                />
              )}
              {title}
            </h5>
            <button
              type="button"
              className="btn-close altoke-modal-close"
              aria-label="Cerrar ventana"
              disabled={busy}
              onClick={onCancel}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button
              ref={cancel}
              data-initial-focus
              type="button"
              className="btn altoke-modal-secondary btn-cancel"
              disabled={busy}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${warning ? 'altoke-modal-danger' : 'altoke-modal-primary'}`}
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? 'Procesando…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
