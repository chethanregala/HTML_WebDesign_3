import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  /** Small editorial metadata label, e.g. "SECTION B — THE EXPERIENCE". */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Large numeral shown beside the heading, e.g. "02". */
  index?: string;
  tone?: 'light' | 'dark';
  align?: 'start' | 'split';
  id?: string;
  /** Id placed on the h2 so sections can reference it with aria-labelledby. */
  titleId?: string;
  className?: string;
}

export function SectionHeading({
  label,
  title,
  intro,
  index,
  tone = 'light',
  align = 'split',
  id,
  titleId,
  className = '',
}: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align} ${className}`.trim()} id={id}>
      <Reveal className="section-heading__meta">
        <span className="rule" aria-hidden="true" />
        <span className="label">{label}</span>
        {index ? <span className="section-heading__index" aria-hidden="true">{index}</span> : null}
      </Reveal>
      <Reveal className="section-heading__body" delay={80}>
        <h2 className={`section-heading__title ${tone === 'dark' ? 'is-dark' : ''}`} id={titleId}>
          {title}
        </h2>
        {intro ? (
          <p className={`section-heading__intro ${tone === 'dark' ? 'is-dark' : ''}`}>{intro}</p>
        ) : null}
      </Reveal>
    </header>
  );
}
