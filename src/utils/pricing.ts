import type { CartItem, CustomizationGroup, MenuItem } from '../types';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Formats an amount as Indian rupees: 1250 → "₹1,250". */
export function formatINR(amount: number): string {
  return `₹${inrFormatter.format(Math.round(amount))}`;
}

/** Price of one unit including its selected customizations. */
export function unitTotal(item: CartItem): number {
  return item.unitPrice + item.customizations.reduce((sum, c) => sum + c.price, 0);
}

export function lineTotal(item: CartItem): number {
  return unitTotal(item) * item.quantity;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Builds the grouping key for a cart line. The same dish with the same
 * customizations and the same notes collapses into a single line.
 */
export function buildLineKey(
  itemId: string,
  optionIds: string[],
  notes: string,
): string {
  return [itemId, [...optionIds].sort().join('+'), notes.trim().toLowerCase()].join('|');
}

/** Total price of a dish with a chosen set of customization options. */
export function priceWithCustomizations(
  item: MenuItem,
  selected: { groupId: string; optionId: string }[],
): number {
  return selected.reduce((sum, choice) => {
    const group = item.customizations.find((g) => g.id === choice.groupId);
    const option = group?.options.find((o) => o.id === choice.optionId);
    return sum + (option?.price ?? 0);
  }, item.price);
}

/** The default selection for a dish: required groups start pre-picked. */
export function defaultSelection(item: MenuItem): { groupId: string; optionId: string }[] {
  return item.customizations
    .filter((group) => group.required && group.type === 'single')
    .map((group) => ({ groupId: group.id, optionId: group.options[0].id }));
}

export function isOptionSelected(
  selection: { groupId: string; optionId: string }[],
  groupId: string,
  optionId: string,
): boolean {
  return selection.some((c) => c.groupId === groupId && c.optionId === optionId);
}

export function findGroup(groups: CustomizationGroup[], id: string): CustomizationGroup | undefined {
  return groups.find((group) => group.id === id);
}
