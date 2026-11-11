/* ------------------------------------------------------------------ */
/* TĀVA — shared TypeScript models                                    */
/* Every piece of restaurant content lives in src/data and is typed    */
/* here, so visual components never hardcode business information.    */
/* ------------------------------------------------------------------ */

export type DietaryType = 'vegetarian' | 'vegan' | 'non-vegetarian';

export type SpiceLevel = 'mild' | 'medium' | 'hot';

export type MenuCategoryId =
  | 'small-plates'
  | 'main-course'
  | 'from-the-fire'
  | 'breads-sides'
  | 'desserts'
  | 'beverages';

export type FlavourTag = 'spicy' | 'creamy' | 'smoky' | 'tangy' | 'fresh' | 'sweet';

export type AllergenTag =
  | 'dairy'
  | 'nuts'
  | 'gluten'
  | 'egg'
  | 'seafood'
  | 'soy'
  | 'mustard'
  | 'sesame';

export type OrderTypeId = 'pickup' | 'dine-in' | 'delivery';

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'alpha';

/* ----------------------------- menu ------------------------------- */

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  blurb: string;
}

export interface CustomizationOption {
  id: string;
  label: string;
  /** Additional price in INR. */
  price: number;
}

export interface CustomizationGroup {
  id: string;
  label: string;
  /** single = radio behaviour, multiple = checkbox behaviour. */
  type: 'single' | 'multiple';
  required?: boolean;
  helper?: string;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** Sample price in INR (fictional demonstration content). */
  price: number;
  category: MenuCategoryId;
  dietary: DietaryType;
  spice: SpiceLevel;
  ingredients: string[];
  allergens: AllergenTag[];
  flavours: FlavourTag[];
  /** Free-form discovery keywords: moods, moments, intents. */
  moodTags: string[];
  customizations: CustomizationGroup[];
  available: boolean;
  /** Signature dishes are surfaced in the home-page selection. */
  signature?: boolean;
  /** Optional kitchen note shown in the detail drawer. */
  note?: string;
}

/* ----------------------------- cart ------------------------------- */

export interface CartCustomization {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
  price: number;
}

export interface CartItem {
  /** Unique per dish + customizations + notes; used for grouping. */
  lineId: string;
  itemId: string;
  name: string;
  /** Price for a single unit before customizations. */
  unitPrice: number;
  quantity: number;
  customizations: CartCustomization[];
  notes: string;
}

/* -------------------------- enquiries ----------------------------- */

export interface OrderEnquiry {
  items: CartItem[];
  orderType: OrderTypeId;
  customerName: string;
  phone: string;
  preferredTime: string;
  instructions: string;
  address: string;
  subtotal: number;
}

export type ReservationOccasionId =
  | 'everyday'
  | 'birthday'
  | 'anniversary'
  | 'family'
  | 'business'
  | 'other';

export interface ReservationEnquiry {
  occasion: ReservationOccasionId;
  guests: number;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  alternativeTime: string;
  seating: string;
  occasionNotes: string;
  requirements: string;
}

export type PrivateEventTypeId = 'celebration' | 'intimate' | 'corporate' | 'other';

export interface PrivateDiningEnquiry {
  customerName: string;
  phone: string;
  eventType: PrivateEventTypeId;
  guests: string;
  date: string;
  requirements: string;
}

/* --------------------- restaurant configuration ------------------- */

export interface OpeningHour {
  day: string;
  hours: string;
  closed?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface OrderTypeConfig {
  pickup: boolean;
  'dine-in': boolean;
  delivery: boolean;
}

export interface ReservationConfig {
  enabled: boolean;
  /** Preferred times offered in the wizard (requests, never live availability). */
  preferredTimes: string[];
  alternativeTimes: string[];
  maxGuests: number;
  minLeadDays: number;
  notice: string;
}

export interface PrivateDiningConfig {
  enabled: boolean;
  ctaLabel: string;
  eventTypes: { id: PrivateEventTypeId; label: string }[];
  notice: string;
}

export interface RestaurantConfiguration {
  name: string;
  wordmark: string;
  descriptor: string;
  category: string;
  description: string;
  /** Fictional demonstration address — replace with real details before launch. */
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  /** Display phone number (fictional demo line). */
  phone: string;
  /** Digits only, with country code, used to build wa.me links. */
  whatsappNumber: string;
  mapsUrl: string;
  hours: OpeningHour[];
  socialLinks: SocialLink[];
  orderTypes: OrderTypeConfig;
  reservation: ReservationConfig;
  privateDining: PrivateDiningConfig;
  /** Shown wherever an enquiry is submitted so nobody mistakes it for a booking. */
  demoNotice: string;
  canonicalUrl: string;
}

/* ------------------------- menu filtering ------------------------- */

export interface MenuFilters {
  categories: MenuCategoryId[];
  dietary: DietaryType[];
  spice: SpiceLevel[];
  flavours: FlavourTag[];
  minPrice: number;
  maxPrice: number;
  sort: SortKey;
  query: string;
}
