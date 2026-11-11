import { useEffect, useMemo, useState } from 'react';
import { Flame, Leaf, Plus, ShoppingBag } from 'lucide-react';
import type { CartItem, CustomizationGroup, MenuItem } from '../../types';
import { categoryLabel } from '../../data/menu';
import { useCart } from '../../hooks/useCart';
import {
  defaultSelection,
  formatINR,
  isOptionSelected,
  priceWithCustomizations,
} from '../../utils/pricing';
import { DIETARY_LABELS, FLAVOUR_LABELS, SPICE_LABELS } from '../../utils/filtering';
import { Modal } from '../common/Modal';
import { DishMark } from '../common/DishMark';
import { QuantityStepper } from '../common/QuantityStepper';

interface MenuDetailDrawerProps {
  item: MenuItem | null;
  editingLine?: CartItem | null;
  onClose: () => void;
}

type Selection = { groupId: string; optionId: string }[];

export function MenuDetailDrawer({ item, editingLine, onClose }: MenuDetailDrawerProps) {
  const { addItem, updateLine } = useCart();
  const [selection, setSelection] = useState<Selection>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(editingLine && item && editingLine.itemId === item.id);

  useEffect(() => {
    if (!item) return;
    if (isEditing && editingLine) {
      setSelection(editingLine.customizations.map((c) => ({ groupId: c.groupId, optionId: c.optionId })));
      setQuantity(editingLine.quantity);
      setNotes(editingLine.notes);
    } else {
      setSelection(defaultSelection(item));
      setQuantity(1);
      setNotes('');
    }
    setError(null);
  }, [item, editingLine, isEditing]);

  const total = useMemo(() => {
    if (!item) return 0;
    return priceWithCustomizations(item, selection) * quantity;
  }, [item, selection, quantity]);

  const toggleOption = (group: CustomizationGroup, optionId: string) => {
    setError(null);
    setSelection((prev) => {
      if (group.type === 'single') {
        return [...prev.filter((c) => c.groupId !== group.id), { groupId: group.id, optionId }];
      }
      const exists = prev.some((c) => c.groupId === group.id && c.optionId === optionId);
      return exists
        ? prev.filter((c) => !(c.groupId === group.id && c.optionId === optionId))
        : [...prev, { groupId: group.id, optionId }];
    });
  };

  const handleSubmit = () => {
    if (!item) return;
    const missing = item.customizations.find(
      (group) =>
        group.required &&
        group.type === 'single' &&
        !selection.some((c) => c.groupId === group.id),
    );
    if (missing) {
      setError(`Please choose an option for “${missing.label}”.`);
      return;
    }

    if (isEditing && editingLine) {
      updateLine(editingLine.lineId, item, selection, quantity, notes);
    } else {
      addItem(item, selection, quantity, notes);
    }
    onClose();
  };

  if (!item) return null;

  const dietaryTone =
    item.dietary === 'vegan' ? 'vegan' : item.dietary === 'vegetarian' ? 'vegetarian' : 'non-veg';

  return (
    <Modal open={Boolean(item)} onClose={onClose} label={`${item.name} details`} className="dish-drawer">
      <div className="dish-drawer__inner">
        <header className="dish-drawer__head">
          <span className="label">{categoryLabel(item.category)}</span>
          <div className="dish-drawer__head-row">
            <DishMark seed={item.id} size="md" />
            <div className="dish-drawer__head-copy">
              <h2 className="dish-drawer__title">{item.name}</h2>
              <p className="dish-drawer__price">{formatINR(item.price)}</p>
            </div>
          </div>
          <p className="dish-drawer__description">{item.description}</p>
        </header>

        <div className="dish-drawer__body">
          <dl className="spec-grid">
            <div className="spec-grid__item">
              <dt>Dietary</dt>
              <dd>
                <span className={`dot dot--${dietaryTone}`} aria-hidden="true" />
                {DIETARY_LABELS[item.dietary]}
              </dd>
            </div>
            <div className="spec-grid__item">
              <dt>Spice</dt>
              <dd>
                <Flame size={13} strokeWidth={1.7} aria-hidden="true" />
                {SPICE_LABELS[item.spice]}
              </dd>
            </div>
            <div className="spec-grid__item">
              <dt>Flavour</dt>
              <dd>{item.flavours.map((f) => FLAVOUR_LABELS[f]).join(' · ')}</dd>
            </div>
            <div className="spec-grid__item">
              <dt>Allergens</dt>
              <dd>
                {item.allergens.length ? item.allergens.join(', ') : 'None declared'}
              </dd>
            </div>
          </dl>

          <section className="dish-drawer__section" aria-labelledby={`ingredients-${item.id}`}>
            <h3 className="dish-drawer__section-title" id={`ingredients-${item.id}`}>
              Ingredients
            </h3>
            <ul className="ingredient-list">
              {item.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </section>

          <p className="dish-drawer__disclaimer">
            Sample ingredient and allergen data for demonstration only — not verified safety guidance.
            Please confirm allergens with the restaurant before ordering.
          </p>

          {item.note ? (
            <p className="dish-drawer__note">
              <Leaf size={14} strokeWidth={1.7} aria-hidden="true" /> {item.note}
            </p>
          ) : null}

          {item.customizations.length > 0 ? (
            <div className="dish-drawer__section">
              <h3 className="dish-drawer__section-title">Customise</h3>
              {item.customizations.map((group) => (
                <fieldset className="option-group" key={group.id}>
                  <legend className="option-group__legend">
                    {group.label}
                    {group.required ? <span className="option-group__required">required</span> : null}
                  </legend>
                  {group.helper ? <p className="option-group__helper">{group.helper}</p> : null}
                  <div className="option-group__options">
                    {group.options.map((option) => {
                      const selected = isOptionSelected(selection, group.id, option.id);
                      return (
                        <label
                          key={option.id}
                          className={`option ${selected ? 'is-selected' : ''}`}
                        >
                          <input
                            type={group.type === 'single' ? 'radio' : 'checkbox'}
                            name={`option-${group.id}`}
                            checked={selected}
                            onChange={() => toggleOption(group, option.id)}
                          />
                          <span className="option__label">{option.label}</span>
                          <span className="option__price">
                            {option.price > 0 ? `+${formatINR(option.price)}` : '—'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          <div className="dish-drawer__section">
            <label className="dish-drawer__notes-label" htmlFor={`notes-${item.id}`}>
              Notes for the kitchen
            </label>
            <textarea
              id={`notes-${item.id}`}
              className="field__control dish-drawer__notes"
              rows={2}
              placeholder="Allergies, spice tolerance, no onion…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={240}
            />
          </div>

          {error ? (
            <p className="form-alert form-alert--error" role="alert">
              {error}
            </p>
          ) : null}

          {!item.available ? (
            <p className="form-alert form-alert--info" role="status">
              This dish is currently unavailable. It cannot be added to your selection.
            </p>
          ) : null}
        </div>

        <footer className="dish-drawer__foot">
          <div className="dish-drawer__quantity">
            <span className="label">QUANTITY</span>
            <QuantityStepper value={quantity} onChange={(next) => setQuantity(Math.max(1, next))} />
          </div>
          <button
            type="button"
            className="btn btn--primary btn--lg dish-drawer__submit"
            onClick={handleSubmit}
            disabled={!item.available}
          >
            <span className="btn__label">
              {item.available
                ? isEditing
                  ? 'Update selection'
                  : 'Add to selection'
                : 'Unavailable'}
            </span>
            <span className="btn__icon">
              {item.available ? (
                isEditing ? (
                  <ShoppingBag size={16} strokeWidth={1.7} aria-hidden="true" />
                ) : (
                  <Plus size={16} strokeWidth={1.7} aria-hidden="true" />
                )
              ) : (
                <ShoppingBag size={16} strokeWidth={1.7} aria-hidden="true" />
              )}
            </span>
            <span className="btn__price">{formatINR(total)}</span>
          </button>
        </footer>
      </div>
    </Modal>
  );
}
