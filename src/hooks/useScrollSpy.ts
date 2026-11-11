import { useEffect, useState } from 'react';

/**
 * Scroll-aware active section tracking.
 * Observes `[data-nav-section]` elements and returns the id of the section
 * currently occupying the middle of the viewport. Falls back to the route
 * when no sections exist on the page.
 */
export function useActiveSection(ids: string[], fallback: string): string {
  const [active, setActive] = useState(fallback);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      setActive(fallback);
      return;
    }

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let bestId = fallback;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestRatio > 0) setActive(bestId);
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: '-72px 0px -45% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids, fallback]);

  return active;
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}
