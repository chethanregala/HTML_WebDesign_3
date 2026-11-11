import { formattedAddress, restaurant } from '../data/restaurant';
import type {
  OrderEnquiry,
  OrderTypeId,
  PrivateDiningEnquiry,
  ReservationEnquiry,
} from '../types';
import { lineTotal, formatINR } from './pricing';

/* ------------------------------------------------------------------ */
/* WhatsApp enquiry helpers                                           */
/* Frontend only: nothing is sent until the user presses "send" in     */
/* WhatsApp itself, and no message is ever delivered by this app.      */
/* ------------------------------------------------------------------ */

export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isConfiguredContact(raw: string): boolean {
  return normalisePhone(raw).length >= 10;
}

export function buildWhatsAppUrl(rawNumber: string, message: string): string | null {
  const digits = normalisePhone(rawNumber);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(rawNumber: string, message: string): boolean {
  const url = buildWhatsAppUrl(rawNumber, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

const ORDER_TYPE_LABELS: Record<OrderTypeId, string> = {
  pickup: 'Pickup',
  'dine-in': 'Dine-in enquiry',
  delivery: 'Delivery enquiry',
};

export function buildOrderMessage(order: OrderEnquiry): string {
  const lines: string[] = [
    `*Order enquiry — ${restaurant.name}*`,
    `${restaurant.descriptor}`,
    '',
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Type: ${ORDER_TYPE_LABELS[order.orderType]}`,
  ];

  if (order.orderType === 'delivery') {
    lines.push(`Address: ${order.address}`);
  }
  if (order.preferredTime) {
    lines.push(`Preferred time: ${order.preferredTime}`);
  }

  lines.push('', '*Selection*');
  order.items.forEach((item) => {
    const extras = item.customizations.map((c) => c.optionLabel).join(', ');
    lines.push(
      `${item.quantity} × ${item.name} — ${formatINR(lineTotal(item))}` +
        (extras ? `  (${extras})` : ''),
    );
    if (item.notes.trim()) lines.push(`    note: ${item.notes.trim()}`);
  });

  lines.push('', `Subtotal: ${formatINR(order.subtotal)}`);
  if (order.instructions.trim()) {
    lines.push('', 'Instructions:', order.instructions.trim());
  }
  lines.push(
    '',
    'This is an enquiry only — please confirm availability, timing and final pricing.',
    `— ${restaurant.name}`,
  );

  return lines.join('\n');
}

export function buildReservationMessage(reservation: ReservationEnquiry): string {
  const occasionLabel =
    OCCASION_LABELS[reservation.occasion] ?? 'Everyday dining';

  const lines: string[] = [
    `*Table reservation enquiry — ${restaurant.name}*`,
    '',
    `Occasion: ${occasionLabel}`,
    `Guests: ${reservation.guests}`,
    `Name: ${reservation.customerName}`,
    `Phone: ${reservation.phone}`,
    `Preferred date: ${reservation.date}`,
    `Preferred time: ${reservation.time}`,
  ];

  if (reservation.alternativeTime) {
    lines.push(`Alternative time: ${reservation.alternativeTime}`);
  }
  if (reservation.seating) lines.push(`Seating: ${reservation.seating}`);
  if (reservation.occasionNotes.trim()) {
    lines.push('', 'Occasion notes:', reservation.occasionNotes.trim());
  }
  if (reservation.requirements.trim()) {
    lines.push('', 'Accessibility / other requirements:', reservation.requirements.trim());
  }

  lines.push(
    '',
    restaurant.reservation.notice,
    '— ' + restaurant.name,
  );

  return lines.join('\n');
}

export function buildPrivateDiningMessage(enquiry: PrivateDiningEnquiry): string {
  const typeLabel =
    restaurant.privateDining.eventTypes.find((t) => t.id === enquiry.eventType)?.label ??
    'Private dining';

  const lines: string[] = [
    `*Private dining enquiry — ${restaurant.name}*`,
    '',
    `Name: ${enquiry.customerName}`,
    `Phone: ${enquiry.phone}`,
    `Event type: ${typeLabel}`,
    `Expected guests: ${enquiry.guests || 'to be confirmed'}`,
  ];

  if (enquiry.date) lines.push(`Preferred date: ${enquiry.date}`);
  if (enquiry.requirements.trim()) {
    lines.push('', 'Special requirements:', enquiry.requirements.trim());
  }

  lines.push('', restaurant.privateDining.notice, `— ${restaurant.name}`);
  return lines.join('\n');
}

/** Human-readable enquiry summary shown on the final review step. */
export function summariseForScreen(message: string): string[] {
  return message.split('\n');
}

export const ORDER_TYPE_OPTIONS: { id: OrderTypeId; label: string; blurb: string }[] = [
  {
    id: 'pickup',
    label: 'Pickup',
    blurb: 'Collect from the restaurant at a confirmed time.',
  },
  {
    id: 'dine-in',
    label: 'Dine-in enquiry',
    blurb: 'Send the selection ahead for your table.',
  },
  {
    id: 'delivery',
    label: 'Delivery enquiry',
    blurb: 'Confirm with the restaurant whether delivery is offered.',
  },
];

export const OCCASION_LABELS: Record<string, string> = {
  everyday: 'Everyday dining',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  family: 'Family gathering',
  business: 'Business dinner',
  other: 'Other',
};

export const SEATING_OPTIONS: string[] = [
  'No preference',
  'Main dining room',
  'Window table',
  'Quiet corner',
  'Accessible seating',
];

export function restaurantContactLine(): string {
  return `${formattedAddress} · ${restaurant.phone}`;
}
