import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, MenuItem } from '../types';
import { buildLineKey, cartCount, cartSubtotal } from '../utils/pricing';
import { defaultSelection } from '../utils/pricing';
import { useLocalStorage } from './useLocalStorage';

const CART_STORAGE_KEY = 'tava.cart.v1';

/* --------------------------- persistence -------------------------- */

function isCartItemArray(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (entry) =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as CartItem).lineId === 'string' &&
      typeof (entry as CartItem).itemId === 'string' &&
      typeof (entry as CartItem).name === 'string' &&
      typeof (entry as CartItem).unitPrice === 'number' &&
      typeof (entry as CartItem).quantity === 'number' &&
      Array.isArray((entry as CartItem).customizations),
  );
}

/* ----------------------------- context ---------------------------- */

export interface CartNotice {
  id: number;
  name: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  notice: CartNotice | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    item: MenuItem,
    selection: { groupId: string; optionId: string }[],
    quantity: number,
    notes: string,
  ) => void;
  updateLine: (
    lineId: string,
    item: MenuItem,
    selection: { groupId: string; optionId: string }[],
    quantity: number,
    notes: string,
  ) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  dismissNotice: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildLine(
  item: MenuItem,
  selection: { groupId: string; optionId: string }[],
  quantity: number,
  notes: string,
): { line: CartItem; key: string } {
  const customizations = selection.flatMap((choice) => {
    const group = item.customizations.find((g) => g.id === choice.groupId);
    const option = group?.options.find((o) => o.id === choice.optionId);
    if (!group || !option) return [];
    return [
      {
        groupId: group.id,
        groupLabel: group.label,
        optionId: option.id,
        optionLabel: option.label,
        price: option.price,
      },
    ];
  });

  const key = buildLineKey(
    item.id,
    customizations.map((c) => c.optionId),
    notes,
  );

  return {
    key,
    line: {
      lineId: key,
      itemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      customizations,
      notes: notes.trim(),
    },
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(CART_STORAGE_KEY, [], isCartItemArray);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const noticeId = useRef(0);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const showNotice = useCallback((name: string, quantity: number) => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, name, quantity });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2600);
  }, []);

  const addItem = useCallback<CartContextValue['addItem']>(
    (item, selection, quantity, notes) => {
      const { line, key } = buildLine(item, selection, quantity, notes);
      setItems((prev) => {
        const existing = prev.find((entry) => entry.lineId === key);
        if (existing) {
          return prev.map((entry) =>
            entry.lineId === key
              ? { ...entry, quantity: Math.min(entry.quantity + quantity, 20) }
              : entry,
          );
        }
        return [...prev, line];
      });
      showNotice(item.name, quantity);
    },
    [setItems, showNotice],
  );

  const updateLine = useCallback<CartContextValue['updateLine']>(
    (lineId, item, selection, quantity, notes) => {
      const { line, key } = buildLine(item, selection, quantity, notes);
      setItems((prev) => {
        const withoutTarget = prev.filter((entry) => entry.lineId !== lineId);
        const existing = withoutTarget.find((entry) => entry.lineId === key);
        if (existing) {
          // The edited result already exists: merge quantities, drop the old line.
          return withoutTarget.map((entry) =>
            entry.lineId === key
              ? { ...entry, quantity: Math.min(entry.quantity + quantity, 20) }
              : entry,
          );
        }
        return [...withoutTarget, { ...line, lineId: lineId === key ? key : `${key}#edit` }];
      });
    },
    [setItems],
  );

  const removeLine = useCallback(
    (lineId: string) => setItems((prev) => prev.filter((entry) => entry.lineId !== lineId)),
    [setItems],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((entry) => entry.lineId !== lineId)
          : prev.map((entry) =>
              entry.lineId === lineId ? { ...entry, quantity: Math.min(quantity, 20) } : entry,
            ),
      ),
    [setItems],
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      isOpen,
      notice,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateLine,
      removeLine,
      setQuantity,
      clearCart,
      dismissNotice,
    }),
    [items, isOpen, notice, addItem, updateLine, removeLine, setQuantity, clearCart, dismissNotice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}

/** Selections a cart line was created with, for reopening the editor. */
export function lineToSelection(line: CartItem): { groupId: string; optionId: string }[] {
  return line.customizations.map((c) => ({ groupId: c.groupId, optionId: c.optionId }));
}

/** Rebuilds a default selection when a dish has no stored choices. */
export function selectionForItem(item: MenuItem): { groupId: string; optionId: string }[] {
  return defaultSelection(item);
}
