import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Bike, ShoppingBag, Utensils } from 'lucide-react';
import { restaurant } from '../../data/restaurant';
import type { OrderTypeId } from '../../types';
import { useCart } from '../../hooks/useCart';
import { usePageMeta } from '../../hooks/useLocalStorage';
import { formatINR, lineTotal } from '../../utils/pricing';
import {
  buildOrderMessage,
  ORDER_TYPE_OPTIONS,
} from '../../utils/whatsapp';
import { validateName, validatePhone, validateTime } from '../../utils/validation';
import { EnquiryResult } from '../common/EnquiryResult';
import { FormField } from '../common/FormField';
import { QuantityStepper } from '../common/QuantityStepper';
import { WizardProgress } from '../common/WizardProgress';
import { CartSummary } from '../cart/CartSummary';

const STEPS = ['Review cart', 'Order type', 'Your details', 'Review request'];

const TYPE_ICONS: Record<OrderTypeId, typeof ShoppingBag> = {
  pickup: ShoppingBag,
  'dine-in': Utensils,
  delivery: Bike,
};

interface Details {
  name: string;
  phone: string;
  time: string;
  instructions: string;
  address: string;
}

const EMPTY_DETAILS: Details = { name: '', phone: '', time: '', instructions: '', address: '' };

export function OrderEnquiry() {
  const { items, subtotal, count, setQuantity, removeLine, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState<OrderTypeId | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [message, setMessage] = useState<string | null>(null);

  usePageMeta(
    'Order Enquiry — TĀVA',
    'Review your selection and prepare a WhatsApp order enquiry for the TĀVA kitchen.',
  );

  const setDetail = (key: keyof Details, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validateDetails = (): boolean => {
    const next: Record<string, string | null> = {
      name: validateName(details.name),
      phone: validatePhone(details.phone),
      time:
        orderType === 'delivery'
          ? details.time
            ? validateTime(details.time)
            : null
          : validateTime(details.time),
      address:
        orderType === 'delivery'
          ? details.address.trim()
            ? null
            : 'Please share the delivery address.'
          : null,
    };
    setErrors(next);
    return Object.values(next).every((value) => !value);
  };

  const goTo = (next: number) => {
    setStep(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDetailsSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validateDetails()) return;
    goTo(3);
  };

  const handleSend = () => {
    if (!orderType) return;
    setMessage(
      buildOrderMessage({
        items,
        orderType,
        customerName: details.name.trim(),
        phone: details.phone.trim(),
        preferredTime: details.time,
        instructions: details.instructions,
        address: orderType === 'delivery' ? details.address.trim() : '',
        subtotal,
      }),
    );
    goTo(4);
  };

  /* ----------------------------- render ---------------------------- */

  if (items.length === 0 && !message) {
    return (
      <div className="wizard-page">
        <div className="container container--narrow">
          <div className="wizard-empty">
            <span className="wizard-empty__mark" aria-hidden="true">
              00
            </span>
            <h1 className="wizard-empty__title">No selection to review.</h1>
            <p className="wizard-empty__body">
              Add a few dishes from the menu first — your cart is stored on this device, so nothing
              is lost when you navigate away.
            </p>
            <Link to="/menu" className="btn btn--primary btn--lg">
              <span className="btn__label">Explore the menu</span>
              <span className="btn__icon">
                <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="wizard-page">
        <div className="container container--narrow">
          <div className="wizard-card">
            <EnquiryResult
              title="Order enquiry"
              message={message}
              onEdit={() => {
                setMessage(null);
                goTo(3);
              }}
            />
            <div className="wizard-card__after">
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  clearCart();
                  setMessage(null);
                  setStep(0);
                  setOrderType(null);
                  setDetails(EMPTY_DETAILS);
                  navigate('/menu');
                }}
              >
                Start a new selection
              </button>
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
    <div className="wizard-page">
      <div className="container">
        <header className="wizard-page__head">
          <span className="label">SECTION F — ORDER ENQUIRY</span>
          <h1 className="wizard-page__title">
            Prepare your <em>order request</em>.
          </h1>
          <p className="wizard-page__intro">
            This is an enquiry, not a confirmed order. The kitchen reviews every request and
            confirms timing, availability and final pricing with you directly.
          </p>
        </header>

        <WizardProgress steps={STEPS} current={Math.min(step, 3)} />

        <div className="wizard-card">
          {/* --------------------- STEP 0: CART -------------------- */}
          {step === 0 ? (
            <section className="wizard-step" aria-label="Review cart">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 01 — Review your cart</h2>
                <p className="wizard-step__hint">
                  {count} item{count === 1 ? '' : 's'} selected. Adjust quantities before sending.
                </p>
              </header>

              <ul className="order-lines">
                {items.map((line) => (
                  <li key={line.lineId} className="order-line">
                    <div className="order-line__main">
                      <h3 className="order-line__name">{line.name}</h3>
                      {line.customizations.length ? (
                        <p className="order-line__options">
                          {line.customizations.map((c) => c.optionLabel).join(' · ')}
                        </p>
                      ) : null}
                      {line.notes.trim() ? (
                        <p className="order-line__notes">Note: {line.notes.trim()}</p>
                      ) : null}
                    </div>
                    <div className="order-line__controls">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(qty) => setQuantity(line.lineId, qty)}
                        compact
                        label={line.name}
                      />
                      <span className="order-line__price">{formatINR(lineTotal(line))}</span>
                      <button
                        type="button"
                        className="text-btn text-btn--danger"
                        onClick={() => removeLine(line.lineId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <CartSummary subtotal={subtotal} count={count} />

              <div className="wizard-step__actions">
                <Link to="/menu" className="btn btn--outline btn--md">
                  <span className="btn__label">Add more dishes</span>
                </Link>
                <button type="button" className="btn btn--primary btn--lg" onClick={() => goTo(1)}>
                  <span className="btn__label">Choose order type</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* -------------------- STEP 1: TYPE --------------------- */}
          {step === 1 ? (
            <section className="wizard-step" aria-label="Select order type">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 02 — How would you like it?</h2>
                <p className="wizard-step__hint">
                  Availability of each option is decided by the restaurant, not this website.
                </p>
              </header>

              <div className="type-grid" role="radiogroup" aria-label="Order type">
                {ORDER_TYPE_OPTIONS.map((option) => {
                  const enabled =
                    option.id === 'pickup'
                      ? restaurant.orderTypes.pickup
                      : option.id === 'dine-in'
                        ? restaurant.orderTypes['dine-in']
                        : restaurant.orderTypes.delivery;
                  const Icon = TYPE_ICONS[option.id];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={orderType === option.id}
                      disabled={!enabled}
                      className={`type-card ${orderType === option.id ? 'is-selected' : ''} ${
                        enabled ? '' : 'is-disabled'
                      }`}
                      onClick={() => {
                        setOrderType(option.id);
                        setErrors({});
                      }}
                    >
                      <span className="type-card__icon" aria-hidden="true">
                        <Icon size={20} strokeWidth={1.6} />
                      </span>
                      <span className="type-card__label">{option.label}</span>
                      <span className="type-card__blurb">
                        {enabled
                          ? option.blurb
                          : option.id === 'delivery'
                            ? 'Not currently offered by this restaurant.'
                            : option.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!restaurant.orderTypes.delivery ? (
                <p className="form-alert form-alert--info">
                  Delivery enquiries are disabled in the restaurant configuration. Enable{' '}
                  <code>orderTypes.delivery</code> in <code>src/data/restaurant.ts</code> to offer
                  this option.
                </p>
              ) : null}

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={() => goTo(0)}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  disabled={!orderType}
                  onClick={() => goTo(2)}
                >
                  <span className="btn__label">Continue</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* -------------------- STEP 2: DETAILS ------------------ */}
          {step === 2 ? (
            <section className="wizard-step" aria-label="Customer details">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 03 — Your details</h2>
                <p className="wizard-step__hint">
                  Used only to reply to this enquiry. Nothing is stored on a server.
                </p>
              </header>

              <form className="wizard-form" onSubmit={handleDetailsSubmit} noValidate>
                <div className="wizard-form__grid">
                  <FormField
                    label="Your name"
                    required
                    value={details.name}
                    onChange={(event) => setDetail('name', event.target.value)}
                    error={errors.name}
                    autoComplete="name"
                    placeholder="Full name"
                  />
                  <FormField
                    label="Contact number"
                    required
                    type="tel"
                    value={details.phone}
                    onChange={(event) => setDetail('phone', event.target.value)}
                    error={errors.phone}
                    autoComplete="tel"
                    placeholder="+91 00000 00000"
                  />
                  <FormField
                    label="Preferred order time"
                    required={orderType !== 'delivery'}
                    type="time"
                    value={details.time}
                    onChange={(event) => setDetail('time', event.target.value)}
                    error={errors.time}
                    helper={
                      orderType === 'delivery'
                        ? 'Optional for delivery enquiries.'
                        : 'Requested time — confirmed by the restaurant.'
                    }
                  />
                </div>

                {orderType === 'delivery' ? (
                  <FormField
                    label="Delivery address"
                    required
                    value={details.address}
                    onChange={(event) => setDetail('address', event.target.value)}
                    error={errors.address}
                    placeholder="Building, street, landmark, pincode"
                    helper="Delivery enquiries are only accepted where the restaurant offers delivery."
                  />
                ) : null}

                <FormField
                  label="Instructions for the kitchen"
                  as="textarea"
                  rows={3}
                  value={details.instructions}
                  onChange={(event) => setDetail('instructions', event.target.value)}
                  error={errors.instructions}
                  placeholder="Allergies, packaging notes, timing context…"
                />

                <div className="wizard-step__actions">
                  <button type="button" className="btn btn--outline btn--md" onClick={() => goTo(1)}>
                    <span className="btn__icon">
                      <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span className="btn__label">Back</span>
                  </button>
                  <button type="submit" className="btn btn--primary btn--lg">
                    <span className="btn__label">Review request</span>
                    <span className="btn__icon">
                      <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {/* -------------------- STEP 3: REVIEW ------------------- */}
          {step === 3 ? orderType ? (
            <section className="wizard-step" aria-label="Review request">
              <header className="wizard-step__head">
                <h2 className="wizard-step__title">Step 04 — Review your request</h2>
                <p className="wizard-step__hint">
                  Check everything below. On the next screen you choose whether to open WhatsApp.
                </p>
              </header>

              <dl className="review-grid">
                <div className="review-grid__item">
                  <dt>Order type</dt>
                  <dd>{ORDER_TYPE_OPTIONS.find((o) => o.id === orderType)?.label}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Name</dt>
                  <dd>{details.name}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Contact</dt>
                  <dd>{details.phone}</dd>
                </div>
                <div className="review-grid__item">
                  <dt>Preferred time</dt>
                  <dd>{details.time || 'Not specified'}</dd>
                </div>
                {orderType === 'delivery' ? (
                  <div className="review-grid__item review-grid__item--wide">
                    <dt>Address</dt>
                    <dd>{details.address}</dd>
                  </div>
                ) : null}
                <div className="review-grid__item review-grid__item--wide">
                  <dt>Instructions</dt>
                  <dd>{details.instructions.trim() || 'None'}</dd>
                </div>
              </dl>

              <div className="review-lines">
                <h3 className="review-lines__title">Selection</h3>
                <ul>
                  {items.map((line) => (
                    <li key={line.lineId}>
                      <span>
                        {line.quantity} × {line.name}
                        {line.customizations.length ? (
                          <em> — {line.customizations.map((c) => c.optionLabel).join(', ')}</em>
                        ) : null}
                      </span>
                      <span>{formatINR(lineTotal(line))}</span>
                    </li>
                  ))}
                </ul>
                <CartSummary subtotal={subtotal} count={count} />
              </div>

              <p className="form-alert form-alert--info" role="status">
                {restaurant.demoNotice} No payment is taken and no order is placed by this page.
              </p>

              <div className="wizard-step__actions">
                <button type="button" className="btn btn--outline btn--md" onClick={() => goTo(2)}>
                  <span className="btn__icon">
                    <ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="btn__label">Edit details</span>
                </button>
                <button type="button" className="btn btn--flame btn--lg" onClick={handleSend}>
                  <span className="btn__label">Send order enquiry</span>
                  <span className="btn__icon">
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </section>
          ) : null : null}
        </div>

        <p className="wizard-page__foot">
          Need a table instead?{' '}
          <Link to="/reserve" className="text-link">
            Reserve your seating
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
