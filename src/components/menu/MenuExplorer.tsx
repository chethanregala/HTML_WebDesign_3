import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { menuCategories, menuItems } from '../../data/menu';
import type { CartItem, MenuCategoryId, MenuItem, MenuFilters as Filters } from '../../types';
import { useCart } from '../../hooks/useCart';
import { usePageMeta } from '../../hooks/useLocalStorage';
import {
  countActiveFilters,
  defaultFilters,
  filterMenu,
  hasAnyConstraint,
  SORT_OPTIONS,
} from '../../utils/filtering';
import { MenuCard } from './MenuCard';
import { MenuFilters } from './MenuFilters';
import { MenuSearch } from './MenuSearch';
import { MenuDetailDrawer } from './MenuDetailDrawer';
import { Modal } from '../common/Modal';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';

export function MenuExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: cartLines } = useCart();

  const categoryParam = searchParams.get('cat');
  const validCategory = menuCategories.some((c) => c.id === categoryParam)
    ? (categoryParam as MenuCategoryId)
    : null;

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    categories: validCategory ? [validCategory] : [],
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [editingLine, setEditingLine] = useState<CartItem | null>(null);

  usePageMeta(
    'Discover the Menu — TĀVA',
    'Search and filter the TĀVA menu by dish, ingredient, dietary preference, spice level, flavour and price.',
  );

  /* Consume ?cat= and ?edit= once, then clean the URL. */
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const line = cartLines.find((entry) => entry.lineId === decodeURIComponent(editId));
      if (line) {
        const item = menuItems.find((entry) => entry.id === line.itemId);
        if (item) {
          setEditingLine(line);
          setSelected(item);
        }
      }
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => filterMenu(menuItems, filters), [filters]);
  const activeCount = countActiveFilters(filters);

  const signature = useMemo(
    () =>
      [
        filters.query,
        filters.categories.join(','),
        filters.dietary.join(','),
        filters.spice.join(','),
        filters.flavours.join(','),
        filters.minPrice,
        filters.maxPrice,
        filters.sort,
      ].join('|'),
    [filters],
  );

  const handleReset = () =>
    setFilters({
      ...defaultFilters,
      categories: validCategory ? [validCategory] : [],
      query: '',
    });

  const closeDrawer = () => {
    setSelected(null);
    setEditingLine(null);
  };

  return (
    <div className="menu-explorer">
      <SectionHeading
        label={`MENU DISCOVERY — ${menuItems.length} DISHES, ONE TABLE`}
        index="C"
        title="Find your next favourite."
        intro="Explore by flavour, preference, mood, and moment. Search runs across dish names, ingredients, dietary tags and discovery keywords — structured metadata, matched deterministically in your browser."
      />

      <div className="menu-explorer__toolbar">
        <MenuSearch value={filters.query} onChange={(query) => setFilters((f) => ({ ...f, query }))} />

        <div className="menu-explorer__controls">
          <label className="sort-control" htmlFor="menu-sort">
            <span className="sort-control__label">Sort</span>
            <select
              id="menu-sort"
              className="sort-control__select"
              value={filters.sort}
              onChange={(event) =>
                setFilters((f) => ({ ...f, sort: event.target.value as Filters['sort'] }))
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn--outline btn--md menu-explorer__filter-toggle"
            onClick={() => setFiltersOpen(true)}
            aria-expanded={filtersOpen}
          >
            <span className="btn__label">Filters</span>
            <span className="btn__icon">
              <SlidersHorizontal size={16} strokeWidth={1.7} aria-hidden="true" />
            </span>
            {activeCount > 0 ? <span className="filter-count">{activeCount}</span> : null}
          </button>
        </div>
      </div>

      <div className="menu-explorer__meta">
        <p className="menu-explorer__count" aria-live="polite">
          <strong>{results.length}</strong> of {menuItems.length} dishes
          {filters.query ? <> matching “{filters.query}”</> : null}
        </p>

        {hasAnyConstraint(filters) ? (
          <div className="active-filters">
            {filters.categories.map((id) => (
              <button
                key={id}
                type="button"
                className="chip chip--active"
                onClick={() =>
                  setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== id) }))
                }
              >
                {menuCategories.find((c) => c.id === id)?.label}
                <X size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
            {filters.dietary.map((id) => (
              <button
                key={id}
                type="button"
                className="chip chip--active"
                onClick={() => setFilters((f) => ({ ...f, dietary: f.dietary.filter((d) => d !== id) }))}
              >
                {id}
                <X size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
            {filters.spice.map((id) => (
              <button
                key={id}
                type="button"
                className="chip chip--active"
                onClick={() => setFilters((f) => ({ ...f, spice: f.spice.filter((s) => s !== id) }))}
              >
                {id} heat
                <X size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
            {filters.flavours.map((id) => (
              <button
                key={id}
                type="button"
                className="chip chip--active"
                onClick={() => setFilters((f) => ({ ...f, flavours: f.flavours.filter((s) => s !== id) }))}
              >
                {id}
                <X size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="text-btn text-btn--danger" onClick={handleReset}>
              Clear all
            </button>
          </div>
        ) : (
          <p className="menu-explorer__hint">Filters combine with search — try “vegan” + “fresh”.</p>
        )}
      </div>

      <div className="menu-explorer__layout">
        <aside className="menu-explorer__sidebar" aria-label="Menu filters">
          <MenuFilters filters={filters} onChange={setFilters} onReset={handleReset} activeCount={activeCount} />
        </aside>

        <div className="menu-explorer__results">
          {results.length > 0 ? (
            <div className="menu-grid" key={signature}>
              {results.map((item, index) => (
                <MenuCard key={item.id} item={item} index={index} onSelect={(dish) => { setEditingLine(null); setSelected(dish); }} />
              ))}
            </div>
          ) : (
            <Reveal className="menu-empty">
              <span className="menu-empty__mark" aria-hidden="true">
                00
              </span>
              <h3 className="menu-empty__title">Nothing matches — yet.</h3>
              <p className="menu-empty__body">
                No dish satisfies every filter at once. Try loosening one: remove a dietary tag,
                widen the price range, or search for something broader like “paneer” or “light”.
              </p>
              <div className="menu-empty__actions">
                <button type="button" className="btn btn--primary btn--md" onClick={handleReset}>
                  <span className="btn__label">Clear all filters</span>
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--md"
                  onClick={() => setFilters({ ...defaultFilters, query: 'paneer' })}
                >
                  <span className="btn__label">Search “paneer”</span>
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        label="Menu filters"
        variant="sheet-bottom"
        className="filter-sheet"
      >
        <div className="filter-sheet__inner">
          <MenuFilters filters={filters} onChange={setFilters} onReset={handleReset} activeCount={activeCount} />
          <button
            type="button"
            className="btn btn--primary btn--lg btn--full"
            onClick={() => setFiltersOpen(false)}
          >
            <span className="btn__label">Show {results.length} dishes</span>
          </button>
        </div>
      </Modal>

      <MenuDetailDrawer item={selected} editingLine={editingLine} onClose={closeDrawer} />
    </div>
  );
}
