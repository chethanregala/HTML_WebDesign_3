import { Search, X } from 'lucide-react';

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const SUGGESTIONS = ['Paneer', 'Spicy', 'Something light', 'Dessert', 'Vegan'];

/** Free-text discovery input over structured menu metadata. */
export function MenuSearch({ value, onChange }: MenuSearchProps) {
  return (
    <div className="menu-search">
      <div className="menu-search__field">
        <Search size={17} strokeWidth={1.7} aria-hidden="true" className="menu-search__icon" />
        <label htmlFor="menu-search-input" className="visually-hidden">
          Search the menu by dish, ingredient, mood or dietary preference
        </label>
        <input
          id="menu-search-input"
          type="search"
          className="menu-search__input"
          placeholder="Search dishes, ingredients, moods…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            className="menu-search__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={1.7} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="menu-search__suggestions">
        <span className="menu-search__suggestions-label">TRY</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className={`chip chip--suggest ${value === suggestion ? 'is-active' : ''}`}
            onClick={() => onChange(value === suggestion ? '' : suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
