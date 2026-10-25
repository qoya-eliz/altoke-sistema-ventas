import { useEffect } from 'react';
export default function SuccessModal({
  isOpen,
  title = 'Operación completada',
  message,
  itemName,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);
  if (!isOpen) {
    return null;
  }
  return (
    <div className="success-notice shadow" role="status">
      <i className="bi bi-check-circle-fill text-success" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <div>
          {itemName} {message}
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        aria-label="Cerrar aviso"
        onClick={onClose}
      />
    </div>
  );
}
