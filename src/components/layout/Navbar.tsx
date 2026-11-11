import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import { homeSectionIds, navItems, routeFallbackSection } from '../../data/navigation';
import { useCart } from '../../hooks/useCart';
import { useActiveSection, useScrolledPast } from '../../hooks/useScrollSpy';
import { Wordmark } from '../common/Wordmark';
import type { NavItem } from '../../data/navigation';

interface NavbarProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function Navbar({ menuOpen, onOpenMenu }: NavbarProps) {
  const scrolled = useScrolledPast(28);
  const { count, openCart } = useCart();
  const location = useLocation();

  const fallback =
    routeFallbackSection[location.pathname] ?? (location.pathname === '/' ? 'home' : '');
  const ids = useMemo(
    () => (homeSectionIds.includes('home') ? homeSectionIds : ['home', ...homeSectionIds]),
    [],
  );
  const activeSection = useActiveSection(ids, fallback);

  const isActive = (item: NavItem): boolean => item.sectionId === activeSection;

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__meta">
        <span className="site-header__meta-left">{restaurant.descriptor}</span>
        <span className="site-header__meta-right">
          {restaurant.category} · {restaurant.address.city}
        </span>
      </div>

      <div className="site-header__bar">
        <Link to="/" className="site-header__brand" aria-label={`${restaurant.name} — home`}>
          <Wordmark />
        </Link>

        <nav className="site-header__nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.sectionId}
              to={item.to}
              className={`nav-link ${isActive(item) ? 'is-active' : ''}`}
              aria-current={isActive(item) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link to="/reserve" className="btn btn--flame btn--sm site-header__reserve">
            <span className="btn__label">Reserve a Table</span>
          </Link>

          <button
            type="button"
            className="cart-trigger"
            onClick={openCart}
            aria-label={count > 0 ? `Open selection, ${count} items` : 'Open selection, empty'}
          >
            <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
            {count > 0 ? (
              <span className="cart-trigger__count" key={count}>
                {count}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className="nav-toggle"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={22} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
