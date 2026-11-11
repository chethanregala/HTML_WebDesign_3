import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ShoppingBag, X } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import { navItems } from '../../data/navigation';
import { useCart } from '../../hooks/useCart';
import { useEscapeKey, useLockBodyScroll } from '../../hooks/useLocalStorage';
import { Wordmark } from '../common/Wordmark';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen mobile navigation with scroll lock, Escape support and focus trap. */
export function NavigationDrawer({ open, onClose }: NavigationDrawerProps) {
  const location = useLocation();
  const { count, openCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEscapeKey(open, onClose);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    }, 40);
    return () => {
      window.clearTimeout(timer);
      restoreFocus.current?.focus?.();
    };
  }, [open]);

  /* Close automatically after navigating. */
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="nav-drawer" id="mobile-navigation">
      <div className="nav-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="nav-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onKeyDown={handleKeyDown}
      >
        <div className="nav-drawer__head">
          <Wordmark />
          <button type="button" className="nav-drawer__close" onClick={onClose} aria-label="Close menu">
            <X size={22} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <nav className="nav-drawer__nav" aria-label="Mobile navigation">
          <ul>
            {navItems.map((item, index) => (
              <li key={item.sectionId}>
                <Link to={item.to} className="nav-drawer__link" onClick={onClose}>
                  <span className="nav-drawer__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="nav-drawer__label">{item.label}</span>
                  <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-drawer__actions">
          <Link to="/reserve" className="btn btn--flame btn--md btn--full" onClick={onClose}>
            <span className="btn__label">Reserve a Table</span>
            <span className="btn__icon">
              <CalendarDays size={16} strokeWidth={1.7} aria-hidden="true" />
            </span>
          </Link>
          <button
            type="button"
            className="btn btn--outline btn--md btn--full"
            onClick={() => {
              onClose();
              openCart();
            }}
          >
            <span className="btn__label">
              {count > 0 ? `View selection (${count})` : 'View selection'}
            </span>
            <span className="btn__icon">
              <ShoppingBag size={16} strokeWidth={1.7} aria-hidden="true" />
            </span>
          </button>
        </div>

        <div className="nav-drawer__foot">
          <p className="label">{restaurant.category}</p>
          <p className="nav-drawer__foot-line">{restaurant.address.city}</p>
          <p className="nav-drawer__foot-line">{restaurant.phone}</p>
        </div>
      </div>
    </div>
  );
}
