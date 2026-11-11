import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Users } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import type { ReservationOccasionId } from '../../types';
import { usePageMeta } from '../../hooks/useLocalStorage';
import { buildReservationMessage, OCCASION_LABELS, SEATING_OPTIONS } from '../../utils/whatsapp';
import {
  validateFutureDate,
  validateGuests,
  validateName,
  validatePhone,
  validateTime,
} from '../../utils/validation';
import { EnquiryResult } from '../common/EnquiryResult';
import { FormField } from '../common/FormField';
import { WizardProgress } from '../common/WizardProgress';

const STEPS = ['Occasion', 'Guest details', 'Date & time', 'Preferences', 'Review'];

const OCCASIONS: { id: ReservationOccasionId; blurb: string }[] = [
  { id: 'everyday', blurb: 'No occasion needed — just good food and good company.' },
  { id: 'birthday', blurb: 'Candles, cake policy and a table set for celebrating.' },
  { id: 'anniversary', blurb: 'A quieter corner and a slower pace for the evening.' },
  { id: 'family', blurb: 'Space for the whole table, including the young ones.' },
  { id: 'business', blurb: 'A calm room for conversations that matter.' },
  { id: 'other', blurb: 'Tell us what you have in mind in the notes.' },
];

interface FormState {
  occasion: ReservationOccasionId | '';
  guests: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  alternativeTime: string;
  seating: string;
  occasionNotes: string;
  requirements: string;
}

const EMPTY: FormState = {
  occasion: '',
  guests: '2',
  name: '',
  phone: '',
  date: '',
  time: '',
  alternativeTime: '',
  seating: SEATING_OPTIONS[0],
  occasionNotes: '',
  requirements: '',
};

export function ReservationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [message, setMessage] = useState<string | null>(null);

  usePageMeta(
    'Reserve a Table — TĀVA',
    'Send a table reservation enquiry to TĀVA: occasion, guests, preferred date and time.',
  );

  const today = new Date().toISOString().slice(0, 10);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = (index: number): boolean => {
    const next: Record<string, string | null> = { ...errors };

    if (index === 0) {
      next.occasion = form.occasion ? null : 'Please choose an occasion.';
    }

    if (index === 1) {
      next.guests = validateGuests(form.guests, restaurant.reservation.maxGuests);
      next.name = validateName(form.name);
      next.phone = validatePhone(form.phone);
    }

    if (index === 2) {
      next.date = validateFutureDate(form.date, 'Preferred date');
      next.time = validateTime(form.time);
      next.alternativeTime = form.alternativeTime ? validateTime(form.alternativeTime) : null;
    }

    if (index === 3) {
      next.seating = form.seating ? null : 'Please choose a seating preference.';
      next.occasionNotes = null;
      next.requirements = null;
    }

    setErrors(next);
    return Object.values(next).every((value) => !value);
  };

  const handleNext = () => {
    if (validateStep(step)) goTo(step + 1);
  };

  const handleBack = () => goTo(Math.max(0, step - 1));

  const handleSubmit = () => {
    // Re-validate the date/time block before generating anything.
    if (!form.occasion) {
      setStep(0);
      return;
    }
    if (!validateStep(2)) return;
    setMessage(
      buildReservationMessage({
        occasion: form.occasion as ReservationOccasionId,
        guests: Number(form.guests),
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        date: form.date,
        time: form.time,
        alternativeTime: form.alternativeTime,
        seating: form.seating,
        occasionNotes: form.occasionNotes,
        requirements: form.requirements,
      }),
    );
    setStep(5);
  };

  if (message) {
    return (
      <div className="wizard-page wizard-page--reserve">
        <div className="container container--narrow">
          <div className="wizard-card">
            <p className="reservation-notice reservation-notice--strong" role="status">
              {restaurant.reservation.notice}
            </p>
            <EnquiryResult
              title="Table reservation enquiry"
              message={message}
              onEdit={() => {
                setMessage(null);
                setStep(4);
              }}
            />
            <div className="wizard-card__after">
              <Link to="/" className="text-link">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-page wizard-page--reserve">
      <div className="container">
        <header className="wizard-page__head">
          <span className="label">SECTION G — TABLE RESERVATION</span>
          <h1 className="wizard-page__title">
            Request a <em>table</em>.
          </h1>
          <p className="wizard-page__intro">
            Five short steps. Everything you enter stays in this browser until you choose to send
            it — there is no booking engine behind this demonstration.
          </p>
        </header>

        <p className="reservation-notice" role="note">
          {restaurant.reservation.notice}
        </p>

        <WizardProgress steps={STEPS} current={Math.min(step, 4)} />

        <div className="wizard-card">
          {/* --------------------- STEP 0: OCCASION ----------------- */}
          {step === 0 ? (
            <section className="wizard-step" aria-label="Choose an occasion">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 01 — What brings you in?</h2>
                <p className="wizard-step__hint">Choose the closest match — you can add notes later.</p>
              </header>

              <div className="occasion-grid" role="radiogroup" aria-label="Occasion">
                {OCCASIONS.map((occasion) => (
                  <button
                    key={occasion.id}
                    type="button"
                    role="radio"
                    aria-checked={form.occasion === occasion.id}
                    className={`occasion-card ${form.occasion === occasion.id ? 'is-selected' : ''}`}
                    onClick={() => set('occasion', occasion.id)}
                  >
                    <span className="occasion-card__label">{OCCASION_LABELS[occasion.id]}</span>
                    <span className="occasion-card__blurb">{occasion.blurb}</span>
                  </button>
                ))}
              </div>

              {errors.occasion ? (
                <p className="form-alert form-alert--error" role="alert">
                  {errors.occasion}
                </p>
              ) : null}

              <div className="wizard-step__actions wizard-step__actions--end">
                <button type="button" className="btn btn--primary btn--lg" onClick={handleNext}>
                  <span className="btn__label">Guest details</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------- STEP 1: GUESTS ------------------ */}
          {step === 1 ? (
            <section className="wizard-step" aria-label="Guest details">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 02 — Who’s coming?</h2>
                <p className="wizard-step__hint">
                  Groups above {restaurant.reservation.maxGuests} guests are handled through private
                  dining.
                </p>
              </header>

              <div className="wizard-form__grid">
                <FormField
                  label="Number of guests"
                  required
                  type="number"
                  min={1}
                  max={restaurant.reservation.maxGuests}
                  inputMode="numeric"
                  value={form.guests}
                  onChange={(event) => set('guests', event.target.value)}
                  error={errors.guests}
                  icon={<Users size={15} aria-hidden="true" />}
                  helper={`1 – ${restaurant.reservation.maxGuests} guests`}
                />
                <FormField
                  label="Guest name"
                  required
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  error={errors.name}
                  autoComplete="name"
                  placeholder="Full name"
                />
                <FormField
                  label="Contact phone"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  error={errors.phone}
                  autoComplete="tel"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={handleBack}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Back</span>
                </button>
                <button type="button" className="btn btn--primary btn--lg" onClick={handleNext}>
                  <span className="btn__label">Date &amp; time</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------- STEP 2: DATE & TIME ------------- */}
          {step === 2 ? (
            <section className="wizard-step" aria-label="Date and time">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 03 — When would you like to come?</h2>
                <p className="wizard-step__hint">
                  The times below are configurable preferences, not live table availability.
                </p>
              </header>

              <div className="wizard-form__grid">
                <FormField
                  label="Preferred date"
                  required
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(event) => set('date', event.target.value)}
                  error={errors.date}
                  icon={<CalendarDays size={15} aria-hidden="true" />}
                />
                <FormField
                  label="Preferred time"
                  required
                  as="select"
                  value={form.time}
                  onChange={(event) => set('time', event.target.value)}
                  error={errors.time}
                >
                  <option value="">Select a time</option>
                  {restaurant.reservation.preferredTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Alternative time"
                  as="select"
                  value={form.alternativeTime}
                  onChange={(event) => set('alternativeTime', event.target.value)}
                  error={errors.alternativeTime}
                  helper="Optional — helps the team find you a table."
                >
                  <option value="">No preference</option>
                  {restaurant.reservation.alternativeTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </FormField>
              </div>

              <p className="form-alert form-alert--info">
                Preferred times are requests. The restaurant confirms availability before anything
                is booked.
              </p>

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={handleBack}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Back</span>
                </button>
                <button type="button" className="btn btn--primary btn--lg" onClick={handleNext}>
                  <span className="btn__label">Preferences</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------- STEP 3: PREFERENCES ------------- */}
          {step === 3 ? (
            <section className="wizard-step" aria-label="Experience preferences">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 04 — Anything we should know?</h2>
                <p className="wizard-step__hint">All optional — but every detail helps the room.</p>
              </header>

              <div className="wizard-form__grid">
                <FormField
                  label="Seating preference"
                  as="select"
                  value={form.seating}
                  onChange={(event) => set('seating', event.target.value)}
                  error={errors.seating}
                >
                  {SEATING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Occasion notes"
                  value={form.occasionNotes}
                  onChange={(event) => set('occasionNotes', event.target.value)}
                  error={errors.occasionNotes}
                  placeholder="Cake arrangements, surprises, dietary context…"
                />
              </div>

              <FormField
                label="Accessibility or other requirements"
                as="textarea"
                rows={3}
                value={form.requirements}
                onChange={(event) => set('requirements', event.target.value)}
                error={errors.requirements}
                placeholder="Wheelchair access, high chairs, seating near the entrance…"
              />

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={handleBack}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Back</span>
                </button>
                <button type="button" className="btn btn--primary btn--lg" onClick={handleNext}>
                  <span className="btn__label">Review request</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------- STEP 4: REVIEW ------------------ */}
          {step === 4 ? (
            <section className="wizard-step" aria-label="Review reservation request">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 05 — Review &amp; send</h2>
                <p className="wizard-step__hint">
                  Sending prepares a WhatsApp message. It does not book a table.
                </p>
              </header>

              <dl className="review-grid">
                <div className="review-grid__item">
                  <dt>Occasion</dt>
                  <dd>{form.occasion ? OCCASION_LABELS[form.occasion] : '—'}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Guests</dt>
                  <dd>{form.guests}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Name</dt>
                  <dd>{form.name}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Phone</dt>
                  <dd>{form.phone}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Preferred date</dt>
                  <dd>{form.date}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Preferred time</dt>
                  <dd>{form.time}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Alternative</dt>
                  <dd>{form.alternativeTime || 'None'}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Seating</dt>
                  <dd>{form.seating}</dd>
                </div>
                <div className="review-grid__item review-grid__item--wide">
                  <dt>Occasion notes</dt>
                  <dd>{form.occasionNotes.trim() || 'None'}</dd>
                </div>
                <div className="review-grid__item review-grid__item--wide">
                  <dt>Accessibility / other</dt>
                  <dd>{form.requirements.trim() || 'None'}</dd>
                </div>
              </dl>

              <p className="reservation-notice reservation-notice--strong" role="note">
                {restaurant.reservation.notice}
              </p>

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={handleBack}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Back</span>
                </button>
                <button type="button" className="btn btn--flame btn--lg" onClick={handleSubmit}>
                  <span className="btn__label">Send reservation enquiry</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}
        </div>

        <p className="wizard-page__foot">
          Ordering instead?{' '}
          <Link to="/order" className="text-link">
            Prepare an order enquiry
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
