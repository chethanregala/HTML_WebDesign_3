import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { CartItem as CartLine } from '../../types';
import { formatINR, lineTotal, unitTotal } from '../../utils/pricing';
import { QuantityStepper } from '../common/QuantityStepper';

interface CartItemProps {
  line: CartLine;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export function CartItem({ line, onQuantity, onRemove, onEdit }: CartItemProps) {
  return (
    <article className="cart-line">
      <div className="cart-line__head">
        <h3 className="cart-line__name">{line.name}</h3>
        <p className="cart-line__price">{formatINR(lineTotal(line))}</p>
      </div>

      {line.customizations.length > 0 ? (
        <ul className="cart-line__tags">
          {line.customizations.map((c) => (
            <li key={`${c.groupId}-${c.optionId}`}>
              {c.optionLabel}
              {c.price > 0 ? ` +${formatINR(c.price)}` : ''}
            </li>
          ))}
        </ul>
      ) : null}

      {line.notes.trim() ? (
        <p className="cart-line__notes">
          <span className="cart-line__notes-label">Note</span> {line.notes.trim()}
        </p>
      ) : null}

      <div className="cart-line__foot">
        <QuantityStepper value={line.quantity} onChange={onQuantity} compact label={line.name} />
        <span className="cart-line__unit">
          {line.quantity} × {formatINR(unitTotal(line))}
        </span>
        <div className="cart-line__actions">
          <button type="button" className="icon-btn" onClick={onEdit} aria-label={`Edit ${line.name}`}>
            <Pencil size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            onClick={onRemove}
            aria-label={`Remove ${line.name} from selection`}
          >
            <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function CartEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="cart-empty">
      <span className="cart-empty__mark" aria-hidden="true">
        0
      </span>
      <h3 className="cart-empty__title">Your table is unset.</h3>
      <p className="cart-empty__body">
        Nothing has been chosen yet. Browse the menu and add a few plates — your selection is saved
        on this device.
      </p>
      <Link to="/menu" className="btn btn--primary btn--md" onClick={onClose}>
        <span className="btn__label">Explore the menu</span>
      </Link>
    </div>
  );
}
