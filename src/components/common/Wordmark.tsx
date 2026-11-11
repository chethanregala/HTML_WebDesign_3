import { restaurant } from '../../data/restaurant';

/** Typographic wordmark with a small geometric accent. */
export function Wordmark({
  className = '',
  showDescriptor = false,
}: {
  className?: string;
  showDescriptor?: boolean;
}) {
  return (
    <span className={`wordmark ${className}`.trim()}>
      <span className="wordmark__text">
        T<span className="wordmark__accent">Ā</span>VA
      </span>
      {showDescriptor ? (
        <span className="wordmark__descriptor">{restaurant.descriptor}</span>
      ) : null}
    </span>
  );
}
