import type { CSSProperties } from 'react';

interface WizardProgressProps {
  steps: string[];
  current: number;
  tone?: 'light' | 'dark';
}

/** Shared step rail used by the order and reservation workflows. */
export function WizardProgress({ steps, current, tone = 'light' }: WizardProgressProps) {
  return (
    <nav
      className={`wizard-progress wizard-progress--${tone}`}
      aria-label="Form progress"
      aria-current="step"
    >
      <ol className="wizard-progress__list">
        {steps.map((label, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';
          return (
            <li
              key={label}
              className={`wizard-progress__item is-${state}`}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="wizard-progress__index" aria-hidden="true">
                {state === 'done' ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span className="wizard-progress__label">{label}</span>
            </li>
          );
        })}
      </ol>
      <div
        className="wizard-progress__bar"
        aria-hidden="true"
        style={{ '--progress': `${(current / (steps.length - 1)) * 100}%` } as CSSProperties}
      />
    </nav>
  );
}
