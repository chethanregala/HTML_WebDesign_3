import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CartToast } from './components/cart/CartToast';
import { BackToTop } from './components/common/BackToTop';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ReservePage } from './pages/ReservePage';
import { OrderPage } from './pages/OrderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { buildRestaurantJsonLd } from './data/restaurant';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Route changes scroll to top; hash links scroll to their section. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        const frame = window.requestAnimationFrame(() => {
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
          });
        });
        return () => window.cancelAnimationFrame(frame);
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

/** Schema.org structured data generated from the restaurant configuration. */
function StructuredData() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(buildRestaurantJsonLd());
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}

export function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <StructuredData />
      <ScrollManager />

      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <Navbar menuOpen={navOpen} onOpenMenu={() => setNavOpen(true)} />
      <NavigationDrawer open={navOpen} onClose={() => setNavOpen(false)} />

      <main id="main" className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reserve" element={<ReservePage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer />
      <CartToast />
      <BackToTop />
    </>
  );
}
