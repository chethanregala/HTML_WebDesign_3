import { ArrowUpRight } from 'lucide-react';
import type { MenuItem } from '../../types';
import { categoryLabel } from '../../data/menu';
import { formatINR } from '../../utils/pricing';
import { DIETARY_LABELS, FLAVOUR_LABELS, SPICE_LABELS } from '../../utils/filtering';
import { DishMark } from '../common/DishMark';

interface MenuCardProps {
  item: MenuItem;
  index: number;
  onSelect: (item: MenuItem) => void;
}

const DIETARY_SHORT: Record<MenuItem['dietary'], string> = {
  vegetarian: 'VEG',
  vegan: 'VEGAN',
  'non-vegetarian': 'NON-VEG',
};

export function MenuCard({ item, index, onSelect }: MenuCardProps) {
  return (
    <article className={`menu-card ${item.available ? '' : 'menu-card--unavailable'}`}>
      <div className="menu-card__top">
        <span className="menu-card__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="menu-card__category">{categoryLabel(item.category)}</span>
        {item.available ? null : <span className="menu-card__badge">Unavailable</span>}
      </div>

      <DishMark seed={item.id} size="sm" className="menu-card__mark" />

      <h3 className="menu-card__name">
        <button
          type="button"
          className="menu-card__trigger"
          onClick={() => onSelect(item)}
          aria-label={`View details for ${item.name}, ${formatINR(item.price)}`}
        >
          {item.name}
        </button>
      </h3>

      <p className="menu-card__description">{item.description}</p>

      <ul className="menu-card__tags">
        <li className={`tag tag--${item.dietary}`}>{DIETARY_SHORT[item.dietary]}</li>
        <li className="tag tag--spice">{SPICE_LABELS[item.spice]}</li>
        {item.flavours.slice(0, 2).map((flavour) => (
          <li key={flavour} className="tag tag--flavour">
            {FLAVOUR_LABELS[flavour]}
          </li>
        ))}
      </ul>

      <div className="menu-card__foot">
        <span className="menu-card__price">{formatINR(item.price)}</span>
        <span className="menu-card__cta" aria-hidden="true">
          View dish
          <ArrowUpRight size={15} strokeWidth={1.6} />
        </span>
      </div>

      <span className="visually-hidden">
        Dietary: {DIETARY_LABELS[item.dietary]}. Spice: {SPICE_LABELS[item.spice]}.
      </span>
    </article>
  );
}
