import ConfirmDialog from '../../components/ConfirmDialog.jsx';
export default function BlockedCategoryModal({
  isOpen,
  categoryName,
  associatedCount,
  onClose,
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="No se puede inactivar"
      onCancel={onClose}
      onConfirm={onClose}
      confirmLabel="Entendido"
    >
      <p>
        {categoryName} tiene {associatedCount} productos activos. Reasígnalos o
        inactívalos antes de continuar.
      </p>
    </ConfirmDialog>
  );
}
