# TĀVA — DEMO 03 (Flagship)

An image-free, editorial-style digital restaurant experience built as a **frontend demonstration**.
Every visual is made from typography, CSS geometry, colour blocking and motion — there are no
photographs, no `<img>` tags, no background images and no remote asset URLs anywhere in the app.

TĀVA is a **fictional restaurant** created for this demo. All names, addresses, prices, opening
hours and menu copy are sample data.

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript 5 |
| Build / dev server | Vite 7 (`@vitejs/plugin-react`, full HMR — no backend, no Nodemon) |
| Routing | React Router 7 (`react-router-dom`) |
| Icons | `lucide-react` (SVG icons only) |
| Styling | Hand-written modern CSS (custom properties, grid, container-free responsive design) |
| Persistence | `localStorage` (cart only, key `tava.cart.v1`) |

No state-management library, no CSS framework, no icon-font, no charting or payment SDK.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server with HMR → http://localhost:5183
npm run build        # typecheck (tsc --noEmit) + production build to dist/
npm run preview      # serve the production build → http://localhost:4183
npm run typecheck    # TypeScript check only, no emit
```

> **Windows + npm note:** if the esbuild postinstall is blocked by a script allowlist, run
> `npm install-scripts approve esbuild` and then `npm rebuild esbuild` once after installing.

## Deploying to Vercel

This repository is ready to deploy to Vercel as-is — no environment variables or backend services
are required.

**Option A — Vercel dashboard (recommended)**

1. Go to [vercel.com/new](https://vercel.com/new) and import the
   `chethanregala/HTML_WebDesign_3` GitHub repository.
2. Leave the defaults: **Framework preset** `Vite`, **Build command** `npm run build`,
   **Output directory** `dist`, **Install command** `npm install`.
3. Click **Deploy**. Vercel installs dependencies, type-checks, and publishes `dist/`.

**Option B — Vercel CLI**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

`vercel.json` at the repository root pins the framework, build settings, long-lived caching for
hashed `/assets/*` files, and an SPA rewrite so client-side routes such as `/menu`, `/reserve` and
`/order` resolve to `index.html` on direct navigation or refresh.

## Project structure

```
restaurant-demo-03-flagship/
├── index.html                 # SEO meta, OG tags, canonical, Google Fonts link
├── public/favicon.svg         # inline SVG favicon (no raster assets)
├── src/
│   ├── main.tsx               # React root — imports all stylesheets
│   ├── App.tsx                # routes, scroll manager, JSON-LD, skip link
│   ├── pages/                 # HomePage, MenuPage, ReservePage, OrderPage, NotFoundPage
│   ├── data/                  # ← ALL fictional business data lives here
│   │   ├── restaurant.ts      # name, tagline, contact, WhatsApp, hours, address, JSON-LD
│   │   ├── menu.ts            # 36 menu items + 7 categories
│   │   ├── experiences.ts     # home-page experience/stat sections
│   │   └── navigation.ts      # nav links + footer columns
│   ├── types/                 # shared TypeScript contracts
│   ├── utils/                 # pricing, filtering/search, validation, WhatsApp message building
│   ├── hooks/                 # useCart (context + localStorage), useLocalStorage, useScrollSpy
│   ├── components/
│   │   ├── layout/            # Navbar, NavigationDrawer (mobile), Footer
│   │   ├── cart/              # CartDrawer, CartItem, CartSummary, CartToast
│   │   ├── menu/              # MenuExplorer, MenuCard, MenuSearch, MenuFilters, MenuDetailDrawer
│   │   ├── home/              # Hero, Experience, MenuPreview, Story, PrivateDining, VisitUs
│   │   ├── checkout/          # OrderEnquiry (4 steps) + shared EnquiryResult
│   │   ├── reservation/       # ReservationWizard (5 steps)
│   │   ├── private-dining/    # PrivateDiningEnquiry (modal form)
│   │   └── common/            # Button, Modal, FormField, Reveal, QuantityStepper, BackToTop, …
│   └── styles/                # tokens.css → globals.css → animations → sections → menu → wizards
└── smoke.test.mjs             # optional Playwright QA script (see "Testing")
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, experience, menu preview, story, private dining, visit/map, footer |
| `/menu` | Full menu discovery — search, filters, sort, dish detail drawer |
| `/menu?cat=<categoryId>` | Deep link that preselects a category filter |
| `/menu?edit=<lineId>` | Opens a cart line for customisation back in the menu context |
| `/reserve` | 5-step table reservation wizard |
| `/order` | 4-step order enquiry built from the cart |
| `*` | 404 page |

## What works entirely in the frontend

- **Menu discovery** — deterministic client-side search (dish names, ingredients, dietary tags,
  keywords; category/dietary terms such as "dessert" or "vegan" only match their structured
  attribute), dietary/spice/flavour/price filters, sorting, live result count, empty state with
  "clear all".
- **Dish detail drawer** — ingredients, allergens (with an honest "sample data" disclaimer),
  customisation options, quantity, add-to-cart. Accessible: focus trap, Escape to close,
  background scroll lock.
- **Cart** — persists in `localStorage` (`tava.cart.v1`), grouped by item + options + notes,
  live count badge in the navbar, quantity editing, clear, toast confirmations. Corrupted stored
  JSON is caught and reset to an empty cart.
- **Enquiry flows** — order enquiry, reservation wizard and private dining form all validate
  input and end by *composing a WhatsApp message* that the user must explicitly send.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables entrance animations and smooth scrolling.

## What is intentionally NOT faked

- **No payments.** There is no checkout, card form or payment SDK. The cart is a "selection" used
  to compose an enquiry.
- **No confirmed bookings or orders.** The app never claims an order was received or a table was
  booked. Every result screen states that the request must be confirmed by the restaurant.
- **WhatsApp only opens — it never sends.** The final action builds
  `https://wa.me/<number>?text=<message>` and opens it in a new tab. Nothing is transmitted unless
  the user presses send inside WhatsApp.
- **Disconnected state is honest.** If `whatsappNumber` in `src/data/restaurant.ts` is cleared or
  shorter than 10 digits, all WhatsApp buttons are replaced with a "connect a number" notice and
  the user can still copy the message text.
- **No real people are contacted.** The demo ships with `+1 555 555 0123` (`15555550123`), which
  is inside the fictional 555-01xx range reserved for examples.
- **Delivery is disabled** (`delivery: false`), so the delivery option in the order flow is shown
  honestly as unavailable rather than pretending to work.
- **Social links are empty** (`socialLinks: []`), so the footer renders no fake profiles.

## Editing the demo

All business content is centralised — no component hard-codes restaurant facts:

| Want to change | Edit |
| --- | --- |
| Name, tagline, phone, WhatsApp, email, address, hours | `src/data/restaurant.ts` → `restaurant` |
| WhatsApp enable/disable | set `restaurant.whatsappNumber` (≥ 10 digits enables it, anything else shows the disconnected state) |
| Enable delivery enquiries | `restaurant.delivery = true` |
| Reservation notice / party-size rules | `restaurant.reservation` |
| Private dining details | `restaurant.privateDining` |
| Menu items, prices, tags, allergens, options | `src/data/menu.ts` → `menuItems` |
| Menu categories | `src/data/menu.ts` → `menuCategories` |
| Home-page experience/stats content | `src/data/experiences.ts` |
| Nav + footer links | `src/data/navigation.ts` |
| Map link / "open in maps" URL | `restaurant.mapUrl` |
| Brand colours, fonts, spacing | `src/styles/tokens.css` |
| Restaurant JSON-LD | `buildRestaurantJsonLd()` in `src/data/restaurant.ts` |

Menu items are typed (`MenuItem` in `src/types`), so TypeScript will flag any missing or misspelled
field when you add dishes. Prices are integer paise-free rupees; formatting is handled by
`formatINR` in `src/utils/pricing.ts`.

## Backend / integrations required for production

This is a frontend demo. To become a real product it needs:

1. **A booking backend** — availability lookup + reservation storage (currently the wizard only
   composes a WhatsApp message).
2. **An order backend** — order intake, kitchen/ticket system, pricing and tax calculation
   (prices here are static sample data; taxes and service charges are not computed).
3. **Payments** — a PCI-compliant provider (Razorpay/Stripe) if prepayment is required.
4. **A real contact number** — replace the fictional 555 number in `src/data/restaurant.ts`.
5. **Menu content management** — items are compiled into the bundle; a CMS or API would allow
   live updates (sold-out states, daily specials, price changes).
6. **Maps** — replace the CSS-drawn schematic map with an embeddable map provider if live
   navigation is wanted (kept image-free in this demo on purpose).
7. **Consent/analytics** — add a cookie/consent layer before wiring any analytics.

## Testing

- `npm run typecheck` — passes with zero errors.
- `npm run build` — passes; emits `dist/` (gzipped JS ≈ 116 kB, CSS ≈ 14 kB).
- `smoke.test.mjs` — a Playwright end-to-end QA script (78 assertions: routes, search, filters,
  sort, cart persistence, corrupted-storage recovery, all three enquiry flows, validation,
  mobile drawer behaviour, and horizontal-overflow checks at 360 / 430 / 768 / 1024 / 1366 / 1920
  px). It is optional and Playwright is **not** a project dependency; to run it:

  ```bash
  npm i -D playwright && npx playwright install chromium
  npm run dev            # in another terminal
  node smoke.test.mjs
  ```

## Accessibility notes

- Skip link, semantic landmarks, labelled form controls, `aria-live` for result counts and toasts.
- All drawers/modals: focus trap, Escape to close, focus restoration, background scroll lock.
- Colour contrast checked for text on the Porcelain/Graphite palette; focus rings are visible.
- Motion respects `prefers-reduced-motion`.
- Diet indicators pair colour with text labels (not colour alone).
