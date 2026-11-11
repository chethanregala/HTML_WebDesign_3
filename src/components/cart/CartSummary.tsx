import { formatINR } from '../../utils/pricing';

interface CartSummaryProps {
  subtotal: number;
  count: number;
}

/**
 * Subtotal block. Deliberately shows no taxes, fees or delivery charges —
 * final pricing is confirmed by the restaurant.
 */
export function CartSummary({ subtotal, count }: CartSummaryProps) {
  return (
    <div className="cart-summary">
      <div className="cart-summary__row">
        <span className="cart-summary__label">
          Subtotal <span className="cart-summary__count">({count} item{count === 1 ? '' : 's'})</span>
        </span>
        <span className="cart-summary__value">{formatINR(subtotal)}</span>
      </div>
      <p className="cart-summary__note">
        Sample prices in INR. Taxes, service charges and delivery fees are not included — final
        charges follow the restaurant’s actual pricing and applicable policies.
      </p>
    </div>
  );
}
