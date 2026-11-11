import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  error?: string | null;
  helper?: string;
  required?: boolean;
  as?: 'input' | 'textarea' | 'select';
  /** Optional leading icon rendered inside the control. */
  icon?: ReactNode;
  children?: ReactNode;
}

type FieldProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>;

/**
 * Labelled form control with accessible error wiring
 * (aria-invalid + aria-describedby) and a reserved error slot so the layout
 * never jumps when validation messages appear.
 */
export function FormField({
  label,
  error,
  helper,
  required = false,
  as = 'input',
  icon,
  children,
  id,
  className = '',
  ...rest
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = [error ? errorId : null, helper ? helperId : null]
    .filter(Boolean)
    .join(' ');

  const shared = {
    id: fieldId,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    className: `field__control ${error ? 'field__control--invalid' : ''} ${className}`.trim(),
    ...rest,
  };

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
        {required ? (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div className={`field__wrap ${error ? 'field__wrap--invalid' : ''}`}>
        {icon ? (
          <span className="field__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {as === 'textarea' ? (
          <textarea {...(shared as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : as === 'select' ? (
          <select {...(shared as SelectHTMLAttributes<HTMLSelectElement>)}>{children}</select>
        ) : (
          <input {...(shared as InputHTMLAttributes<HTMLInputElement>)} />
        )}
      </div>

      {helper && !error ? (
        <p className="field__helper" id={helperId}>
          {helper}
        </p>
      ) : null}
      <p className="field__error" id={errorId} role="alert">
        {error ?? ''}
      </p>
    </div>
  );
}
