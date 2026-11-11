import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Milliseconds of stagger applied via CSS custom property. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Once revealed, stay revealed (default) or replay on re-entry. */
  once?: boolean;
}

/**
 * Entrance animation wrapper. Adds `.is-inview` when the element enters the
 * viewport; users who prefer reduced motion get the content immediately.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const Component = Tag as 'div';
  return (
    <Component
      ref={ref}
      className={`reveal ${visible ? 'is-inview' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}
