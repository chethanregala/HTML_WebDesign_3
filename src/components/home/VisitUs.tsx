import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { formattedAddress, restaurant, whatsappConfigured } from '../../data/restaurant';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';

/**
 * Section J — visit and location.
 * The "map" is a CSS composition: no embeds, no image assets, no third-party
 * tiles. Directions open the configured Google Maps URL in a new tab.
 */
export function VisitUs() {
  const telHref = `tel:${restaurant.phone.replace(/[^\d+]/g, '')}`;
  const whatsappHref = `https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <section className="section section--light visit" id="visit" aria-labelledby="visit-title">
      <div className="container">
        <SectionHeading
          label="SECTION J — VISIT US"
          index="J"
          titleId="visit-title"
          title={
            <>
              Come find
              <br />
              your <em>seat</em>.
            </>
          }
          intro="Everything you need to reach us — hours, directions and the fastest way to start a conversation with the team."
        />

        <div className="visit__layout">
          <Reveal className="visit__details">
            <div className="visit__block">
              <h3 className="visit__label">
                <MapPin size={15} strokeWidth={1.7} aria-hidden="true" />
                Address
              </h3>
              <address className="visit__address">
                {restaurant.name}
                <br />
                {restaurant.address.line1}
                <br />
                {restaurant.address.line2}
                <br />
                {restaurant.address.city} {restaurant.address.postalCode}
                <br />
                {restaurant.address.region}, {restaurant.address.country}
              </address>
              <a
                className="text-link"
                href={restaurant.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open in Google Maps
              </a>
            </div>

            <div className="visit__block">
              <h3 className="visit__label">
                <Phone size={15} strokeWidth={1.7} aria-hidden="true" />
                Contact
              </h3>
              <a className="visit__contact" href={telHref}>
                {restaurant.phone}
              </a>
              {whatsappConfigured ? (
                <a className="text-link text-link--whatsapp" href={whatsappHref} target="_blank" rel="noreferrer noopener">
                  <MessageCircle size={15} strokeWidth={1.7} aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              ) : (
                <p className="visit__muted">WhatsApp not configured for this demonstration.</p>
              )}
            </div>

            <div className="visit__block">
              <h3 className="visit__label">
                <Clock size={15} strokeWidth={1.7} aria-hidden="true" />
                Opening hours
              </h3>
              <ul className="visit__hours">
                {restaurant.hours.map((entry) => (
                  <li key={entry.day}>
                    <span>{entry.day}</span>
                    <span className={entry.closed ? 'is-closed' : ''}>{entry.hours}</span>
                  </li>
                ))}
              </ul>
              <p className="visit__muted">Hours are sample data for this fictional restaurant.</p>
            </div>
          </Reveal>

          {/* CSS map composition */}
          <Reveal className="visit__map" delay={120}>
            <div className="map-art" role="img" aria-label={`Stylised map showing ${formattedAddress}`}>
              <div className="map-art__grid" aria-hidden="true" />
              <div className="map-art__road map-art__road--h1" aria-hidden="true" />
              <div className="map-art__road map-art__road--h2" aria-hidden="true" />
              <div className="map-art__road map-art__road--v1" aria-hidden="true" />
              <div className="map-art__road map-art__road--v2" aria-hidden="true" />
              <div className="map-art__block map-art__block--one" aria-hidden="true" />
              <div className="map-art__block map-art__block--two" aria-hidden="true" />
              <div className="map-art__block map-art__block--three" aria-hidden="true" />
              <div className="map-art__park" aria-hidden="true" />
              <div className="map-art__marker" aria-hidden="true">
                <span className="map-art__pulse" />
                <span className="map-art__pin" />
                <span className="map-art__label">TĀVA</span>
              </div>
              <span className="map-art__street map-art__street--top" aria-hidden="true">
                RESIDENCY CROSS ROAD
              </span>
              <span className="map-art__street map-art__street--side" aria-hidden="true">
                ARTS QUARTER
              </span>
              <div className="map-art__card">
                <span className="label">YOU’LL FIND US HERE</span>
                <p>{formattedAddress}</p>
                <a href={restaurant.mapsUrl} target="_blank" rel="noreferrer noopener" className="btn btn--flame btn--sm">
                  <span className="btn__label">Get directions</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="visit__note">
          <span className="label">DEMONSTRATION NOTICE</span>
          <p>
            TĀVA is a fictional brand created for this portfolio. The address, phone number and
            hours above are sample content held in <code>src/data/restaurant.ts</code> — replace
            them with real details before using this template for a live restaurant.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
