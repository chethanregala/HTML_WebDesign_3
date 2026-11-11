import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey, useLockBodyScroll } from '../../hooks/useLocalStorage';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type ModalVariant = 'sheet-right' | 'sheet-bottom' | 'center';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible dialog name. */
  label: string;
  variant?: ModalVariant;
  children: ReactNode;
  className?: string;
  /** Hides the built-in close button (custom headers can render their own). */
  hideCloseButton?: boolean;
}

/**
 * Accessible dialog: portal, focus trap, Escape to close, background scroll
 * lock, aria-hidden background and focus restoration on close.
 */
export function Modal({
  open,
  onClose,
  label,
  variant = 'sheet-right',
  children,
  className = '',
  hideCloseButton = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEscapeKey(open, onClose);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const root = document.getElementById('root');
    root?.setAttribute('aria-hidden', 'true');

    const focusTimer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialogRef.current)?.focus();
    }, 30);

    return () => {
      window.clearTimeout(focusTimer);
      root?.removeAttribute('aria-hidden');
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (focusables.length === 0) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className={`overlay overlay--${variant}`} data-modal-overlay>
      <div
        className="overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        className={`dialog dialog--${variant} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <span id={titleId} className="visually-hidden">
          {label}
        </span>
        {hideCloseButton ? null : (
          <button type="button" className="dialog__close" onClick={onClose} aria-label="Close dialog">
            <X aria-hidden="true" size={20} strokeWidth={1.6} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
