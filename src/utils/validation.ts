/* ------------------------------------------------------------------ */
/* Lightweight, framework-free form validation.                        */
/* Each helper returns an error message, or null when the value is OK. */
/* ------------------------------------------------------------------ */

export type ValidationResult = string | null;

export function required(value: string, label = 'This field'): ValidationResult {
  return value.trim().length > 0 ? null : `${label} is required.`;
}

export function validateName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your name.';
  if (trimmed.length < 2) return 'Please enter at least 2 characters.';
  return null;
}

/**
 * Accepts international formats: 9876543210, +91 98765 43210,
 * +1 555 555 0123, (555) 555-0123.
 */
export function validatePhone(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter a contact number.';
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) {
    return 'Use digits only, with an optional + country code.';
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) return 'That number looks too short.';
  if (digits.length > 15) return 'That number looks too long.';
  return null;
}

export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter an email address.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? null : 'Enter a valid email address.';
}

/** yyyy-mm-dd string must be today or later. */
export function validateFutureDate(value: string, label = 'Date'): ValidationResult {
  if (!value) return `Please choose a ${label.toLowerCase()}.`;
  const chosen = new Date(`${value}T00:00:00`);
  if (Number.isNaN(chosen.getTime())) return 'Choose a valid date.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (chosen < today) return 'That date has already passed.';
  return null;
}

export function validateGuests(value: number | string, max: number): ValidationResult {
  const count = typeof value === 'string' ? Number(value) : value;
  if (!value && value !== 0) return 'Please enter the number of guests.';
  if (!Number.isFinite(count) || !Number.isInteger(count)) return 'Enter a whole number.';
  if (count < 1) return 'At least 1 guest is required.';
  if (count > max) {
    return `For groups above ${max}, please use the private dining enquiry.`;
  }
  return null;
}

export function validateSelect(value: string, message: string): ValidationResult {
  return value.trim().length > 0 ? null : message;
}

export function validateTime(value: string): ValidationResult {
  if (!value) return 'Please choose a time.';
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? null : 'Choose a valid time.';
}

/** Runs a list of validators and returns the first failure. */
export function firstError(...results: ValidationResult[]): ValidationResult {
  return results.find((result) => result !== null) ?? null;
}

/** Turns an index-keyed error map into a single summary message. */
export function errorSummary(errors: Record<string, string | null>): string | null {
  const messages = Object.values(errors).filter((m): m is string => !!m);
  return messages.length ? messages[0] : null;
}
