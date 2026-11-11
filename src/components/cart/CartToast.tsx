import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

/**
 * Subtle add-to-cart confirmation. Uses a polite live region so screen
 * readers announce the addition without stealing focus.
 */
export function CartToast() {
  const { notice, dismissNotice, openCart, count } = useCart();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!notice) return;
    timer.current = window.setTimeout(dismissNotice, 2600);
    return () => window.clearTimeout(timer.current);
  }, [notice, dismissNotice]);

  if (!notice) return null;

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span className="cart-toast__icon" aria-hidden="true">
        <Check size={15} strokeWidth={2} />
      </span>
      <span className="cart-toast__copy">
        <strong>{notice.name}</strong>
        <span>
          {notice.quantity > 1 ? `${notice.quantity} × ` : ''}added to your selection
        </span>
      </span>
      <button type="button" className="cart-toast__action" onClick={openCart}>
        View ({count})
      </button>
      <button type="button" className="cart-toast__close" onClick={dismissNotice} aria-label="Dismiss confirmation">
        ×
      </button>
    </div>
  );
}
