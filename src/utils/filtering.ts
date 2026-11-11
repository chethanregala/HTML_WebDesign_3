import { categoryLabel } from '../data/menu';
import type {
  DietaryType,
  FlavourTag,
  MenuCategoryId,
  MenuFilters,
  MenuItem,
  SortKey,
  SpiceLevel,
} from '../types';

/* ------------------------------------------------------------------ */
/* Deterministic keyword / tag discovery                              */
/* Structured metadata matching — no external or AI services involved. */
/* ------------------------------------------------------------------ */

/** Words that carry no intent on their own. */
const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'want',
  'would',
  'like',
  'something',
  'some',
  'any',
  'for',
  'with',
  'and',
  'to',
  'of',
  'me',
  'my',
  'please',
  'dish',
  'dishes',
  'food',
  'menu',
  'item',
  'one',
]);

/** Synonyms so "spicy", "hot" and "chilli" find the same dishes. */
const SYNONYMS: Record<string, string[]> = {
  spicy: ['hot', 'chilli', 'heat', 'kashmiri'],
  hot: ['spicy', 'chilli', 'heat'],
  mild: ['gentle', 'not spicy'],
  dessert: ['sweet', 'sweets', 'pudding'],
  sweets: ['dessert', 'sweet'],
  vegan: ['plant based', 'plant-based', 'dairy free'],
  vegetarian: ['veg', 'paneer', 'meatless'],
  'non-vegetarian': ['meat', 'chicken', 'fish', 'prawn', 'lamb', 'seafood'],
  meat: ['chicken', 'lamb', 'non-vegetarian'],
  light: ['refreshing', 'fresh', 'small plate', 'something light'],
  refreshing: ['cooler', 'fizz', 'soda'],
  drink: ['beverage', 'beverages', 'cooler', 'lassi'],
  drinks: ['beverage', 'beverages', 'cooler'],
  bread: ['naan', 'paratha'],
  'spicy pick': ['bold'],
  smoky: ['charcoal', 'tandoor', 'grilled', 'fire'],
  creamy: ['rich', 'butter', 'coconut', 'yoghurt'],
  tangy: ['sour', 'lime', 'citrus', 'kokum'],
  sweet: ['dessert', 'sugar', 'jaggery'],
  quick: ['weeknight', 'everyday'],
  family: ['crowd pleaser', 'sharing'],
};

/**
 * Tokens that map to a single structured attribute. These match strictly
 * (no synonym expansion) so "dessert" returns desserts and "vegan" returns
 * vegan dishes, rather than everything tagged sweet or plant-based.
 */
const STRICT_TOKENS: Record<string, (item: MenuItem) => boolean> = {
  dessert: (item) => item.category === 'desserts',
  desserts: (item) => item.category === 'desserts',
  beverage: (item) => item.category === 'beverages',
  beverages: (item) => item.category === 'beverages',
  drink: (item) => item.category === 'beverages',
  drinks: (item) => item.category === 'beverages',
  bread: (item) => item.category === 'breads-sides',
  breads: (item) => item.category === 'breads-sides',
  starter: (item) => item.category === 'small-plates',
  starters: (item) => item.category === 'small-plates',
  vegan: (item) => item.dietary === 'vegan',
  vegetarian: (item) => item.dietary === 'vegetarian',
  veg: (item) => item.dietary === 'vegetarian',
  'non-vegetarian': (item) => item.dietary === 'non-vegetarian',
  'non-veg': (item) => item.dietary === 'non-vegetarian',
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[āā]/g, 'a')
    .replace(/[īī]/g, 'i')
    .replace(/[ūū]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Everything about a dish that a customer might type. */
export function buildSearchText(item: MenuItem): string {
  return normalise(
    [
      item.name,
      item.description,
      item.category,
      categoryLabel(item.category),
      item.dietary,
      item.dietary === 'non-vegetarian'
        ? 'meat chicken fish prawn'
        : item.dietary,
      item.spice,
      ...item.ingredients,
      ...item.flavours,
      ...item.moodTags,
      ...item.allergens,
      item.note ?? '',
      item.available ? '' : 'unavailable sold out',
    ].join(' '),
  );
}

export function tokenise(query: string): string[] {
  return normalise(query)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function tokenMatches(item: MenuItem, searchText: string, token: string): boolean {
  const strict = STRICT_TOKENS[token];
  if (strict) return strict(item);
  if (searchText.includes(token)) return true;
  const alternatives = SYNONYMS[token] ?? [];
  return alternatives.some((alt) => searchText.includes(normalise(alt)));
}

export function matchesQuery(item: MenuItem, query: string): boolean {
  const tokens = tokenise(query);
  if (tokens.length === 0) return true;
  const searchText = buildSearchText(item);
  return tokens.every((token) => tokenMatches(item, searchText, token));
}

/* ------------------------------------------------------------------ */
/* Filters                                                            */
/* ------------------------------------------------------------------ */

export const PRICE_BOUNDS = { min: 100, max: 1500 };

export const defaultFilters: MenuFilters = {
  categories: [],
  dietary: [],
  spice: [],
  flavours: [],
  minPrice: PRICE_BOUNDS.min,
  maxPrice: PRICE_BOUNDS.max,
  sort: 'recommended',
  query: '',
};

function withinPrice(item: MenuItem, filters: MenuFilters): boolean {
  return item.price >= filters.minPrice && item.price <= filters.maxPrice;
}

function sortItems(items: MenuItem[], sort: SortKey): MenuItem[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'alpha':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'recommended':
    default:
      // Signature dishes first, then availability, then original order.
      return copy.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        if (!!b.signature !== !!a.signature) return b.signature ? 1 : -1;
        return 0;
      });
  }
}

/** Applies category + dietary + spice + flavour + price + search + sort. */
export function filterMenu(items: MenuItem[], filters: MenuFilters): MenuItem[] {
  const result = items.filter((item) => {
    if (filters.categories.length && !filters.categories.includes(item.category)) return false;
    if (filters.dietary.length && !filters.dietary.includes(item.dietary)) return false;
    if (filters.spice.length && !filters.spice.includes(item.spice)) return false;
    if (filters.flavours.length && !filters.flavours.some((f) => item.flavours.includes(f))) {
      return false;
    }
    if (!withinPrice(item, filters)) return false;
    if (!matchesQuery(item, filters.query)) return false;
    return true;
  });

  return sortItems(result, filters.sort);
}

export function countActiveFilters(filters: MenuFilters): number {
  return (
    filters.categories.length +
    filters.dietary.length +
    filters.spice.length +
    filters.flavours.length +
    (filters.minPrice !== PRICE_BOUNDS.min || filters.maxPrice !== PRICE_BOUNDS.max ? 1 : 0)
  );
}

export function hasAnyConstraint(filters: MenuFilters): boolean {
  return countActiveFilters(filters) > 0 || filters.query.trim().length > 0;
}

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'alpha', label: 'Alphabetical' },
];

export const DIETARY_LABELS: Record<DietaryType, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'non-vegetarian': 'Non-vegetarian',
};

export const SPICE_LABELS: Record<SpiceLevel, string> = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
};

export const FLAVOUR_LABELS: Record<FlavourTag, string> = {
  spicy: 'Spicy',
  creamy: 'Creamy',
  smoky: 'Smoky',
  tangy: 'Tangy',
  fresh: 'Fresh',
  sweet: 'Sweet',
};

export const ALL_CATEGORIES: MenuCategoryId[] = [
  'small-plates',
  'main-course',
  'from-the-fire',
  'breads-sides',
  'desserts',
  'beverages',
];
