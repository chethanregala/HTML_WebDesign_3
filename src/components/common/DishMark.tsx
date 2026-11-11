import type { CSSProperties } from 'react';

interface DishMarkProps {
  /** Any stable string (dish id) — drives a deterministic composition. */
  seed: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result << 5) - result + value.charCodeAt(i);
    result |= 0;
  }
  return Math.abs(result);
}

/**
 * Image-free dish identifier: a deterministic CSS composition derived from
 * the dish id. Every item gets its own geometry, so cards read as a set of
 * designed marks rather than repeated placeholders.
 */
export function DishMark({ seed, size = 'md', className = '' }: DishMarkProps) {
  const h = hash(seed);
  const angle = (h % 8) * 45;
  const offset = 8 + (h % 5) * 4;
  const scale = 0.55 + ((h >> 3) % 5) / 10;
  const variant = (h >> 6) % 3;

  return (
    <span
      className={`dish-mark dish-mark--${size} dish-mark--v${variant} ${className}`.trim()}
      aria-hidden="true"
      style={
        {
          '--mark-angle': `${angle}deg`,
          '--mark-offset': `${offset}px`,
          '--mark-scale': scale,
        } as CSSProperties
      }
    >
      <span className="dish-mark__plate" />
      <span className="dish-mark__shape" />
      <span className="dish-mark__dot" />
      <span className="dish-mark__bar" />
    </span>
  );
}
