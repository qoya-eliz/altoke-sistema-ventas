import ConfirmDialog from '../ConfirmDialog.jsx';
export default function InactivationConfirmModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  message,
  title,
  confirmLabel,
  entity = 'registro',
}) {
  const roleChange = confirmLabel === 'Cambiar rol';
  const questions = {
    cliente: `¿Inactivar a ${itemName || 'este cliente'}?`,
    producto: `¿Inactivar ${itemName || 'este producto'}?`,
    categoría: `¿Inactivar la categoría ${itemName || 'seleccionada'}?`,
    usuario: `¿Inactivar al usuario ${itemName || 'seleccionado'}?`,
  };
  const consequences = {
    cliente: 'No estará disponible para nuevas ventas.',
    producto: 'No podrá agregarse a nuevas ventas.',
    categoría: 'Debe estar libre de productos activos.',
    usuario: 'No podrá acceder al sistema.',
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={roleChange ? 'Cambiar rol' : title || `Inactivar ${entity}`}
      variant={roleChange ? 'default' : 'warning'}
      icon="bi-person-fill-gear"
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLabel={roleChange ? 'Cambiar rol' : 'Sí, inactivar'}
    >
      <p className="altoke-confirmation-question">
        {roleChange
          ? `¿Cambiar el rol de ${itemName || 'este usuario'}?`
          : questions[entity] || `¿Inactivar ${itemName || 'este registro'}?`}
      </p>
      <p className="altoke-confirmation-description">
        {roleChange
          ? message
          : consequences[entity] ||
            message ||
            'Dejará de estar disponible para nuevas operaciones.'}
      </p>
    </ConfirmDialog>
  );
}
