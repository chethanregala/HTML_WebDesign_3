import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Phone, MessageCircle } from 'lucide-react';
import { restaurant, whatsappConfigured } from '../../data/restaurant';
import { menuCategories } from '../../data/menu';
import { navItems } from '../../data/navigation';
import { Wordmark } from '../common/Wordmark';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="footer">
      <div className="site-footer__cta">
        <div className="site-footer__cta-copy">
          <span className="label label--light">TABLE FOR TWO, OR TWELVE</span>
          <p className="site-footer__cta-title">
            Come hungry. Leave with a story.
          </p>
        </div>
        <Link to="/reserve" className="btn btn--light btn--lg">
          <span className="btn__label">Reserve a Table</span>
          <span className="btn__icon">
            <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </span>
        </Link>
      </div>

      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <Wordmark />
          <p className="site-footer__statement">{restaurant.description}</p>
          <p className="site-footer__notice">{restaurant.demoNotice}</p>
        </div>

        <nav className="site-footer__col" aria-label="Footer navigation">
          <h2 className="site-footer__heading">Navigate</h2>
          <ul>
            {navItems.map((item) => (
              <li key={item.sectionId}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/reserve">Reserve a Table</Link>
            </li>
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="Menu categories">
          <h2 className="site-footer__heading">The Menu</h2>
          <ul>
            {menuCategories.map((category) => (
              <li key={category.id}>
                <Link to={`/menu?cat=${category.id}`}>{category.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Visit</h2>
          <address className="site-footer__address">
            {restaurant.address.line1}
            <br />
            {restaurant.address.line2}
            <br />
            {restaurant.address.city} {restaurant.address.postalCode}
          </address>
          <ul className="site-footer__contact">
            <li>
              <a href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}>
                <Phone size={14} strokeWidth={1.6} aria-hidden="true" />
                {restaurant.phone}
              </a>
            </li>
            <li>
              <a href={restaurant.mapsUrl} target="_blank" rel="noreferrer noopener">
                <MapPin size={14} strokeWidth={1.6} aria-hidden="true" />
                Directions
              </a>
            </li>
            {whatsappConfigured ? (
              <li>
                <a
                  href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MessageCircle size={14} strokeWidth={1.6} aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Hours</h2>
          <ul className="site-footer__hours">
            {restaurant.hours.map((entry) => (
              <li key={entry.day}>
                <span>{entry.day}</span>
                <span className={entry.closed ? 'is-closed' : ''}>{entry.hours}</span>
              </li>
            ))}
          </ul>
          {restaurant.socialLinks.length > 0 ? (
            <>
              <h2 className="site-footer__heading site-footer__heading--spaced">Follow</h2>
              <ul className="site-footer__social">
                {restaurant.socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a href={link.url} target="_blank" rel="noreferrer noopener">
                      {link.platform}
                      <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="site-footer__base">
        <p>
          © {year} {restaurant.name} — fictional demonstration brand. All menu content, prices and
          contact details are sample data.
        </p>
        <p className="site-footer__base-meta">
          {restaurant.descriptor} · Frontend demo, no orders or bookings are processed
        </p>
      </div>
    </footer>
  );
}
