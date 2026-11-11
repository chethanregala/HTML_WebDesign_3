import { useState, type FormEvent } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import type { PrivateDiningEnquiry as Enquiry } from '../../types';
import { buildPrivateDiningMessage } from '../../utils/whatsapp';
import { validateFutureDate, validateName, validatePhone, validateSelect } from '../../utils/validation';
import { EnquiryResult } from '../common/EnquiryResult';
import { FormField } from '../common/FormField';
import { Modal } from '../common/Modal';

interface PrivateDiningEnquiryProps {
  open: boolean;
  onClose: () => void;
}

type FormState = Omit<Enquiry, 'guests'> & { guests: string };
type FormErrors = Partial<Record<keyof FormState, string | null>>;

const initialState: FormState = {
  customerName: '',
  phone: '',
  eventType: 'celebration',
  guests: '',
  date: '',
  requirements: '',
};

export function PrivateDiningEnquiry({ open, onClose }: PrivateDiningEnquiryProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {
      customerName: validateName(form.customerName),
      phone: validatePhone(form.phone),
      eventType: validateSelect(form.eventType, 'Choose an event type.'),
      guests:
        form.guests.trim().length === 0
          ? 'Please share an expected guest count.'
          : Number.isFinite(Number(form.guests)) && Number(form.guests) >= 1
            ? null
            : 'Enter a number of guests.',
      date: form.date ? validateFutureDate(form.date, 'Date') : null,
    };
    setErrors(next);
    return Object.values(next).every((value) => !value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setMessage(
      buildPrivateDiningMessage({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        eventType: form.eventType as Enquiry['eventType'],
        guests: form.guests.trim(),
        date: form.date,
        requirements: form.requirements,
      }),
    );
  };

  const reset = () => {
    setMessage(null);
    setErrors({});
    setForm(initialState);
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(reset, 300);
  };

  if (!restaurant.privateDining.enabled) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      label="Private dining enquiry"
      variant="center"
      className="enquiry-modal"
    >
      <div className="enquiry-modal__inner">
        <header className="enquiry-modal__head">
          <span className="label">PRIVATE DINING & EVENTS</span>
          <h2 className="enquiry-modal__title">Plan your experience.</h2>
          <p className="enquiry-modal__intro">
            {restaurant.privateDining.notice} Share a few details and the team will shape the rest
            with you.
          </p>
        </header>

        {message ? (
          <EnquiryResult
            title="Private dining enquiry"
            message={message}
            onEdit={() => setMessage(null)}
          />
        ) : (
          <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="enquiry-form__grid">
              <FormField
                label="Your name"
                required
                value={form.customerName}
                onChange={(event) => set('customerName', event.target.value)}
                error={errors.customerName}
                autoComplete="name"
                placeholder="Full name"
              />
              <FormField
                label="Contact number"
                required
                type="tel"
                value={form.phone}
                onChange={(event) => set('phone', event.target.value)}
                error={errors.phone}
                autoComplete="tel"
                placeholder="+91 00000 00000"
                helper="Used only to reply to this enquiry."
              />
              <FormField
                label="Type of event"
                required
                as="select"
                value={form.eventType}
                onChange={(event) => set('eventType', event.target.value)}
                error={errors.eventType}
              >
                {restaurant.privateDining.eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </FormField>
              <FormField
                label="Expected guests"
                required
                type="number"
                min={1}
                inputMode="numeric"
                value={form.guests}
                onChange={(event) => set('guests', event.target.value)}
                error={errors.guests}
                placeholder="e.g. 14"
                icon={<Users size={15} aria-hidden="true" />}
              />
              <FormField
                label="Preferred date"
                type="date"
                value={form.date}
                onChange={(event) => set('date', event.target.value)}
                error={errors.date}
                icon={<CalendarDays size={15} aria-hidden="true" />}
                helper="Optional — the team will propose alternatives."
              />
            </div>

            <FormField
              label="Special requirements"
              as="textarea"
              rows={4}
              value={form.requirements}
              onChange={(event) => set('requirements', event.target.value)}
              error={errors.requirements}
              placeholder="Menu style, seating, timing, accessibility needs, celebration details…"
            />

            <div className="enquiry-form__foot">
              <p className="enquiry-form__disclaimer">
                No capacity, pricing or package is assumed here — arrangements are confirmed
                directly by the restaurant.
              </p>
              <button type="submit" className="btn btn--flame btn--lg">
                <span className="btn__label">Prepare enquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
