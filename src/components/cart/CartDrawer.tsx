import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Modal } from '../common/Modal';
import { CartEmpty, CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, count, removeLine, setQuantity, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (lineId: string) => {
    closeCart();
    navigate(`/menu?edit=${encodeURIComponent(lineId)}`);
  };

  return (
    <Modal open={isOpen} onClose={closeCart} label="Your selection" className="cart-drawer">
      <div className="cart-drawer__inner">
        <header className="cart-drawer__head">
          <div>
            <span className="label">YOUR SELECTION</span>
            <h2 className="cart-drawer__title">
              {count > 0 ? `${count} item${count === 1 ? '' : 's'} chosen` : 'Nothing chosen yet'}
            </h2>
          </div>
        </header>

        <div className="cart-drawer__list">
          {items.length === 0 ? (
            <CartEmpty onClose={closeCart} />
          ) : (
            items.map((line) => (
              <CartItem
                key={line.lineId}
                line={line}
                onQuantity={(qty) => setQuantity(line.lineId, qty)}
                onRemove={() => removeLine(line.lineId)}
                onEdit={() => handleEdit(line.lineId)}
              />
            ))
          )}
        </div>

        {items.length > 0 ? (
          <footer className="cart-drawer__foot">
            <CartSummary subtotal={subtotal} count={count} />

            <Link to="/order" className="btn btn--primary btn--lg btn--full" onClick={closeCart}>
              <span className="btn__label">Review order enquiry</span>
              <span className="btn__icon">
                <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
            </Link>

            <div className="cart-drawer__secondary">
              <button type="button" className="text-btn" onClick={closeCart}>
                Continue browsing
              </button>
              {confirmClear ? (
                <span className="cart-drawer__confirm">
                  <button type="button" className="text-btn text-btn--danger" onClick={() => { clearCart(); setConfirmClear(false); }}>
                    Remove everything
                  </button>
                  <button type="button" className="text-btn" onClick={() => setConfirmClear(false)}>
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" className="text-btn text-btn--muted" onClick={() => setConfirmClear(true)}>
                  Clear selection
                </button>
              )}
            </div>
          </footer>
        ) : (
          <div className="cart-drawer__foot cart-drawer__foot--empty">
            <Link to="/menu" className="text-link" onClick={closeCart}>
              <ShoppingBag size={15} strokeWidth={1.6} aria-hidden="true" />
              Start with the menu
            </Link>
          </div>
        )}
      </div>
    </Modal>
  );
}
