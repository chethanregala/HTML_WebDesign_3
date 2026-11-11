import type { RestaurantConfiguration } from '../types';

/**
 * Central restaurant configuration.
 *
 * Everything a restaurant owner would want to change — contact details,
 * opening hours, enabled order types, reservation rules — lives here.
 *
 * NOTE: TĀVA is a fictional demonstration brand. Every detail below is
 * sample content. The phone/WhatsApp line uses the 555-01xx range that is
 * reserved for fictional use, so no real person is ever contacted by the
 * demo workflows.
 */
export const restaurant: RestaurantConfiguration = {
  name: 'TĀVA',
  wordmark: 'TĀVA',
  descriptor: 'THE INDIAN TABLE REIMAGINED.',
  category: 'Contemporary Indian Dining',
  description:
    'A modern Indian restaurant that celebrates familiar ingredients and regional inspiration through contemporary food, thoughtful hospitality, and distinctive dining experiences.',

  address: {
    line1: 'Studio 4, Residency Arts Quarter',
    line2: '18 Kasturba Cross Road',
    city: 'Bengaluru',
    region: 'Karnataka',
    postalCode: '560001',
    country: 'India',
  },

  // Fictional demo number. Replace with the restaurant's real line.
  phone: '+1 555 555 0123',
  // Digits only with country code. Replace with the restaurant's real WhatsApp
  // business number, or set to '' to show the "not configured" state.
  whatsappNumber: '15555550123',

  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bengaluru%20Karnataka',

  hours: [
    { day: 'Monday', hours: 'Closed', closed: true },
    { day: 'Tuesday — Thursday', hours: '18:00 — 23:00' },
    { day: 'Friday — Saturday', hours: '12:30 — 15:00 · 18:00 — 23:30' },
    { day: 'Sunday', hours: '12:30 — 15:00 · 18:00 — 22:30' },
  ],

  // Empty by default: links only render once a valid URL is configured.
  // Example: { platform: 'Instagram', url: 'https://instagram.com/yourhandle' }
  socialLinks: [],

  orderTypes: {
    pickup: true,
    'dine-in': true,
    delivery: false, // set to true to offer a delivery enquiry
  },

  reservation: {
    enabled: true,
    preferredTimes: [
      '12:30',
      '13:00',
      '13:30',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
    ],
    alternativeTimes: ['18:30', '21:30'],
    maxGuests: 12,
    minLeadDays: 0,
    notice:
      'Your preferred time is a request, not a confirmed booking. The restaurant must confirm availability.',
  },

  privateDining: {
    enabled: true,
    ctaLabel: 'PLAN YOUR EXPERIENCE',
    eventTypes: [
      { id: 'celebration', label: 'Private celebration' },
      { id: 'intimate', label: 'Intimate dinner' },
      { id: 'corporate', label: 'Corporate gathering' },
      { id: 'other', label: 'Something else' },
    ],
    notice:
      'Private dining arrangements, inclusions and pricing are confirmed directly by the restaurant.',
  },

  demoNotice:
    'Frontend demonstration — enquiries are prepared for WhatsApp and must be confirmed by the restaurant.',

  canonicalUrl: 'https://example.com/tava/',
};

/** Convenience selectors so components never reach into nested objects. */
export const whatsappConfigured = restaurant.whatsappNumber.replace(/\D/g, '').length >= 10;

export const formattedAddress = [
  restaurant.address.line1,
  restaurant.address.line2,
  `${restaurant.address.city} ${restaurant.address.postalCode}`,
  restaurant.address.region,
  restaurant.address.country,
]
  .filter(Boolean)
  .join(', ');

/** Schema.org JSON-LD built only from configured, grounded fields. */
export function buildRestaurantJsonLd(): Record<string, unknown> {
  const address = {
    '@type': 'PostalAddress',
    streetAddress: `${restaurant.address.line1}, ${restaurant.address.line2}`,
    addressLocality: restaurant.address.city,
    addressRegion: restaurant.address.region,
    postalCode: restaurant.address.postalCode,
    addressCountry: restaurant.address.country,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    servesCuisine: 'Indian',
    url: restaurant.canonicalUrl,
    telephone: restaurant.phone,
    address,
    openingHoursSpecification: restaurant.hours
      .filter((entry) => !entry.closed)
      .map((entry) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: entry.day.replace(' — ', ' and ').split(' and ')[0],
        opens: entry.hours.split(' — ')[0]?.trim(),
        closes: entry.hours.split(' — ').pop()?.trim(),
      })),
  };
}
