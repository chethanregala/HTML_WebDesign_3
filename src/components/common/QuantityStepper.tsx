import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  compact?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label = 'quantity',
  compact = false,
}: QuantityStepperProps) {
  return (
    <div className={`stepper ${compact ? 'stepper--compact' : ''}`}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(Math.max(min - 1, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <output className="stepper__value" aria-live="polite" aria-label={`${label}: ${value}`}>
        {value}
      </output>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
