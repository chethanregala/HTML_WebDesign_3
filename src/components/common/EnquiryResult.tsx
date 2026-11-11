import { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { restaurant, whatsappConfigured } from '../../data/restaurant';
import { openWhatsApp } from '../../utils/whatsapp';

interface EnquiryResultProps {
  title: string;
  message: string;
  /** Called when the user wants to revise their answers. */
  onEdit?: () => void;
}

/**
 * Final step shared by every enquiry workflow: previews the formatted
 * message, opens WhatsApp explicitly, and falls back to an honest
 * "not configured" state when no contact number exists.
 */
export function EnquiryResult({ title, message, onEdit }: EnquiryResultProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="enquiry-result">
      <div className="enquiry-result__head">
        <span className="label">ENQUIRY READY</span>
        <h3 className="enquiry-result__title">{title}</h3>
        <p className="enquiry-result__notice">{restaurant.demoNotice}</p>
      </div>

      <pre className="enquiry-result__preview" tabIndex={0} aria-label="Formatted enquiry message">
        {message}
      </pre>

      {whatsappConfigured ? (
        <>
          <div className="enquiry-result__actions">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => openWhatsApp(restaurant.whatsappNumber, message)}
            >
              <span className="btn__label">Open WhatsApp to send</span>
              <span className="btn__icon">
                <MessageCircle size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
            </button>
            <button type="button" className="btn btn--outline btn--lg" onClick={copy}>
              <span className="btn__label">{copied ? 'Copied' : 'Copy summary'}</span>
              <span className="btn__icon">
                {copied ? (
                  <Check size={16} strokeWidth={1.9} aria-hidden="true" />
                ) : (
                  <Copy size={16} strokeWidth={1.7} aria-hidden="true" />
                )}
              </span>
            </button>
          </div>
          <p className="enquiry-result__footnote">
            Nothing is sent automatically. WhatsApp opens with this text prepared — you press send,
            and the restaurant confirms availability, timing and pricing with you.
          </p>
        </>
      ) : (
        <div className="enquiry-result__disconnected" role="status">
          <h4>WhatsApp integration is not configured</h4>
          <p>
            This demonstration has no valid WhatsApp number on file, so no message can be prepared.
            Add the restaurant’s WhatsApp number in <code>src/data/restaurant.ts</code> to enable
            enquiry delivery, or contact the restaurant by phone.
          </p>
          <a className="text-link" href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}>
            {restaurant.phone}
          </a>
        </div>
      )}

      {onEdit ? (
        <button type="button" className="text-btn enquiry-result__edit" onClick={onEdit}>
          ← Change my answers
        </button>
      ) : null}
    </div>
  );
}
