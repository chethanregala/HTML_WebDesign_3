import type { MenuFilters as Filters } from '../../types';
import {
  DIETARY_LABELS,
  FLAVOUR_LABELS,
  PRICE_BOUNDS,
  SPICE_LABELS,
} from '../../utils/filtering';
import { formatINR } from '../../utils/pricing';

interface MenuFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  activeCount: number;
}

type ListKey = 'dietary' | 'spice' | 'flavours';

function toggleIn<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

export function MenuFilters({ filters, onChange, onReset, activeCount }: MenuFiltersProps) {
  const update = <K extends ListKey>(key: K, value: Filters[K][number]) => {
    onChange({ ...filters, [key]: toggleIn(filters[key] as string[], value as string) } as Filters);
  };

  const setMinPrice = (value: number) => {
    onChange({ ...filters, minPrice: Math.min(value, filters.maxPrice - 25) });
  };

  const setMaxPrice = (value: number) => {
    onChange({ ...filters, maxPrice: Math.max(value, filters.minPrice + 25) });
  };

  return (
    <div className="filters">
      <div className="filters__head">
        <span className="label">FILTER THE MENU</span>
        {activeCount > 0 ? (
          <button type="button" className="text-btn text-btn--danger" onClick={onReset}>
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>

      <fieldset className="filter-group">
        <legend className="filter-group__title">Dietary</legend>
        <div className="filter-group__chips">
          {(Object.keys(DIETARY_LABELS) as (keyof typeof DIETARY_LABELS)[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${filters.dietary.includes(key) ? 'is-active' : ''}`}
              aria-pressed={filters.dietary.includes(key)}
              onClick={() => update('dietary', key)}
            >
              {DIETARY_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group__title">Spice preference</legend>
        <div className="filter-group__chips">
          {(Object.keys(SPICE_LABELS) as (keyof typeof SPICE_LABELS)[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${filters.spice.includes(key) ? 'is-active' : ''}`}
              aria-pressed={filters.spice.includes(key)}
              onClick={() => update('spice', key)}
            >
              {SPICE_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group__title">Flavour profile</legend>
        <div className="filter-group__chips">
          {(Object.keys(FLAVOUR_LABELS) as (keyof typeof FLAVOUR_LABELS)[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${filters.flavours.includes(key) ? 'is-active' : ''}`}
              aria-pressed={filters.flavours.includes(key)}
              onClick={() => update('flavours', key)}
            >
              {FLAVOUR_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group__title">Price range</legend>
        <p className="filter-group__value" aria-live="polite">
          {formatINR(filters.minPrice)} — {formatINR(filters.maxPrice)}
        </p>
        <label className="range" htmlFor="price-min">
          <span className="range__label">Minimum</span>
          <input
            id="price-min"
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={25}
            value={filters.minPrice}
            onChange={(event) => setMinPrice(Number(event.target.value))}
          />
        </label>
        <label className="range" htmlFor="price-max">
          <span className="range__label">Maximum</span>
          <input
            id="price-max"
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={25}
            value={filters.maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
        </label>
      </fieldset>
    </div>
  );
}
