import { ValidatedInput } from '../../components/ValidatedFields.jsx';
import { documentRuleFor } from '@shared/validation-catalog.js';

// Nombre del cliente: etiqueta, ejemplo y reglas dependen del tipo de documento (DNI, CE o RUC).
export default function ClientNameField({ docTypeName, value, onChange, disabled }) {
  const rule = documentRuleFor(docTypeName);
  return (
    <div className="mb-3">
      <label className="form-label small fw-bold">
        {rule ? rule.nameLabel : 'Nombre del cliente'} *
      </label>
      <ValidatedInput
        name="nombre_razon_social"
        documentType={docTypeName}
        type="text"
        className="form-control form-control-sm"
        placeholder={rule?.namePlaceholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      />
    </div>
  );
}
