# EasyOrders — Product Detail Page

A responsive e-commerce product detail page built from a Figma design and the live EasyOrders API. It covers variant selection with correct sale pricing, a persistent cart, static reviews with saved votes, and related-product rails.

**Stack:** React 19 · TypeScript (strict) · Tailwind CSS · Zustand + Immer · TanStack Query · Vite · Vitest + React Testing Library + axe · Playwright

## Contents

- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Features](#features)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Components, hooks and stores](#components-hooks-and-stores)
- [Scope decisions and design deviations](#scope-decisions-and-design-deviations)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Getting started

**Requirements:** Node.js 22.12+ (or 24+) and npm. Google Chrome is needed only for the E2E tests: Playwright uses the installed Chrome, so there is no browser download.

```bash
npm install
npm run dev        # http://localhost:5173
```

No environment variables are needed. The product API is public, and its base URL, product slug and request timeout are in `src/services/config.ts`.

## Scripts

| Script                  | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                                           |
| `npm run build`         | Type-check app, tests and E2E code (`tsc -b`), then production build |
| `npm run preview`       | Serve the production build locally                                   |
| `npm test`              | Unit, component, integration and accessibility tests (Vitest)        |
| `npm run test:watch`    | Vitest in watch mode                                                 |
| `npm run test:e2e`      | Playwright E2E, desktop + mobile, against a mocked API               |
| `npm run test:e2e:live` | Playwright smoke test against the live API                           |
| `npm run lint`          | oxlint                                                               |
| `npm run format`        | Prettier (write)                                                     |
| `npm run format:check`  | Prettier (check only)                                                |

## Features

- **Gallery:** thumbnails for every image, previous/next buttons and arrow keys, zoom (hover, click or keyboard, with panning), share (native share or copy link), and a wishlist toggle. Picking a colour jumps to its image.
- **Variants:** colour swatches and sizes with stock-aware availability and no dead ends. Picking a conflicting option clears the incompatible choice instead of blocking you. The price follows the selected variant and keeps the product sale.
- **Purchase:** a quantity selector capped by stock. "Add to Cart" validates the selection, shows a hint and focuses the first missing option. "Checkout Now" adds the item and opens the cart.
- **Cart:** a slide-out drawer, loaded on demand. It's saved in localStorage with a versioned format. Saved data is validated when it's loaded back, and changes sync across browser tabs.
- **Reviews:** rating summary, rating and topic filters, tabs and pagination. Like/dislike votes are saved in localStorage.
- **Resilience:** loading skeletons, friendly error states with retry, and an app-level error boundary. If a background refresh fails, the page stays on screen with a small notice.
- **Accessibility:** full keyboard support, managed focus, screen-reader labels and live regions, and WCAG AA text contrast. Checked with axe in the test suite.
- **SEO:** the document title and meta description are set from the product.

## Project structure

```
src/
├── app/providers.tsx        # QueryClient (retry policy) + provider
├── App.tsx                  # Shell: Header, lazy CartDrawer, ProductPage, Footer
├── main.tsx                 # Entry: StrictMode, app-level ErrorBoundary
├── constants.ts             # Business rules: default currency, quantity cap
├── components/              # Shared components
│   ├── ErrorBoundary.tsx    # Catches render/lazy-load errors (+ AppCrashFallback)
│   ├── layout/              # Container, Header, Footer, Logo, DashedDivider
│   └── ui/                  # icons, ProductImage, StarRating, Pagination, Skeleton, StaticLink
├── hooks/                   # Shared hooks: useImageRetry
├── features/
│   ├── product/
│   │   ├── components/      # ProductPage, Gallery, ProductInfo, PurchasePanel, VariationSelector, ...
│   │   ├── hooks/           # useProduct, useProductSelection, useAddToCart, gallery and purchase hooks
│   │   └── utils/           # variant-matrix (pricing, availability), product-view-data
│   ├── cart/
│   │   ├── components/      # LazyCartDrawer, CartDrawer, CartItemRow
│   │   └── hooks/           # useLazyCartDrawer
│   └── reviews/
│       ├── components/      # ReviewsSection, RatingSummary, ReviewFilters, ReviewItem
│       ├── hooks/           # useReviewList
│       ├── data/            # Static reviews and rating distribution
│       ├── utils/           # Filtering, rating summary, formatting
│       └── types.ts         # Review, ReviewTopic, ReviewTab, ReviewFilterState
├── services/                # api-client, product-service, validate-product, normalize-product, config
├── store/                   # Zustand: cart (Immer + persist), wishlist, review votes
├── types/                   # Shared types: API (raw), domain (normalized), cart
├── utils/                   # Shared helpers: format-price, pagination, text, cn
└── test/                    # Vitest setup, fixtures, render helpers, page-level tests
e2e/                         # Playwright specs, helpers, captured API fixture
```

The code is organised by feature. Each feature has the same layout: `components/` and `hooks/`, plus `utils/`, `data/` and `types.ts` only when it needs them. Anything used by more than one feature lives at the top level: `components/`, `hooks/`, `utils/` and `types/`. The global stores in `store/` and the API layer in `services/` are shared too. Business logic is pure functions in `utils/` and `services/`, so it can be unit-tested without React. Tests sit next to the file they test; page-level integration and accessibility tests are in `src/test/`.

**Components vs. hooks.** Components render. Non-trivial state and behaviour live in custom hooks (`use-*.ts`) next to the component that uses them. Simple UI state, such as a single toggle, stays in the component. Pure derivations are plain functions, not hooks.

## Architecture

### Data flow

```
EasyOrders API ─▶ api-client (fetch, timeout, cancellation, typed errors)
               ─▶ validate-product (runtime shape check)
               ─▶ normalize-product (sanitize HTML, typed domain Product)
               ─▶ useProduct (TanStack Query cache)
               ─▶ ProductPage ─▶ useProductSelection (variant state) ─▶ UI
                                                  └─▶ cart store (Zustand) ─▶ CartDrawer
```

### State management

1. **Server state: TanStack Query** (`features/product/hooks/use-product.ts`). It caches with a 5-minute stale time and cancels through the query's abort signal. It retries only transient failures: network, timeout and 5xx. It never retries 4xx or invalid data.
2. **Global client state: Zustand.**
   - `store/cart-store.ts` uses Immer for updates and `persist` for localStorage. Only `items` are saved.
   - The saved format is versioned (v2), with a migration from v1. When the cart is loaded back, every line is validated, duplicates are merged and quantities are clamped.
   - Re-adding a line refreshes its price and stock bounds.
   - `store/wishlist-store.ts` and `store/review-votes-store.ts` are small persisted stores that also validate their saved data.
   - All three stores stay in sync across browser tabs: a `storage` event in one tab reloads the store in the others.
3. **Local UI state: React.** This covers variant selection, gallery index and zoom, and review filters. Derived values such as price, stock and availability are computed by pure functions, never stored.

### Variant logic (`features/product/utils/variant-matrix.ts`)

- **Pricing (`getPricing`):** a variant overrides product pricing only when it defines its own values. The live API sends variants with `sale_price: 0` that mirror the product price, so they inherit the product sale (EGP 190 → **160**).
- **Availability, without dead ends:** every option is in one of three states.
  - _Available:_ compatible with the current selection.
  - _Conflict:_ exists, but not with the current selection. It is dimmed but clickable, and picking it clears the conflicting choice (`applyOption`).
  - _Unavailable:_ has no purchasable combination, so it is disabled.

  Stock only counts when the product tracks stock.

- **Initial selection:** the first purchasable colour is pre-selected, as in the design. The size is never pre-selected, so the customer always chooses it.

### API integration

`GET https://api.easy-orders.net/api/v1/products/slug/clear-theme/Sneakers12?join=reviews`

- Errors are `ApiError` with a `kind`: `network`, `timeout`, `http`, `parse` or `invalid`. Users only see friendly messages from `getUserErrorMessage`.
- A timeout or cancellation is classified correctly both while connecting and while reading the response body.
- The response is checked structurally before normalization, so a changed payload fails clearly instead of crashing.
- The product description is sanitized with DOMPurify before it is rendered.
- If a background refresh fails while the product is on screen, the page stays and a small notice appears. The full error state is only for when there is nothing to show.

### Resilience

An app-level `ErrorBoundary` shows a "Something went wrong" screen with a reload button instead of a blank page. The cart drawer is code-split. If its chunk fails to load (offline, or replaced by a new deploy), a retryable alert appears and the page keeps working.

## Components, hooks and stores

### Layout and UI primitives (`src/components/`)

| Component       | Props                                     | Notes                                                                                                                                        |
| --------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`     | `children`, `className?`                  | Page-width wrapper: 1280px content in a 1440px frame.                                                                                        |
| `Header`        | —                                         | Logo and cart button with a count badge. Search, Categories, Sign in, Wishlist and Menu are design placeholders (`aria-disabled` + tooltip). |
| `Footer`        | —                                         | Static content. The newsletter form shows a confirmation without reloading.                                                                  |
| `ProductImage`  | `src`, `alt`, `eager?`, `<img>`           | Lazy loading, one automatic retry (`useImageRetry`), placeholder on failure. Uses `object-contain`, so products are never cropped.           |
| `StarRating`    | `rating`, `starClassName?`                | Whole stars, labelled "Rated X out of 5".                                                                                                    |
| `Pagination`    | `page`, `totalPages`, `onChange`, `label` | Long ranges collapse with ellipses. Renders nothing for a single page.                                                                       |
| `StaticLink`    | `children`, `className?`                  | Link-styled text for out-of-scope links.                                                                                                     |
| `Skeleton`      | `className?`                              | Pulsing placeholder that respects reduced motion.                                                                                            |
| `ErrorBoundary` | `children`, `fallback(reset)`             | Catches render and lazy-load errors. `AppCrashFallback` is the last-resort screen.                                                           |

### Product (`src/features/product/`)

| Component           | Notes                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ProductPage`       | Fetches the product and renders the skeleton, the error with retry, or the page. Sets `<title>` and the meta description.                        |
| `Gallery`           | `images`, `alt`, `productId`, `highlightImage?`. Navigation, zoom, share and wishlist (see hooks below).                                         |
| `ProductInfo`       | Brand line, title, `StockStatus`, `PriceBlock`, `Description` and `PurchasePanel`.                                                               |
| `PurchasePanel`     | Options, quantity and buttons. The validation hint sits in a live region that is always mounted. Buttons are disabled only for a sold-out line.  |
| `VariationSelector` | Swatches for `type: 'image'` groups, text buttons otherwise. Shows the three option states above.                                                |
| `QuantitySelector`  | `value`, `max`, `onChange`. Stepper plus input. A typed value can be cleared while editing; it commits, clamped to `[1, max]`, on blur or Enter. |
| `PriceBlock`        | Strikethrough original price when on sale, with "Was"/"Now" for screen readers.                                                                  |
| `Breadcrumb`        | Homepage › primary category › product (the API's categories are flat tags).                                                                      |
| `ProductCategories` | De-duplicated list of all categories under the purchase panel.                                                                                   |
| `Description`       | Plain-text excerpt with "See More....", which expands to the sanitized HTML.                                                                     |
| `ProductShowcase`   | Product rail: a 5-column grid on desktop, a horizontal scroller on smaller screens.                                                              |

| Hook                                            | Responsibility                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `useProduct(slug)`                              | TanStack Query hook returning the normalized `Product`.                                                              |
| `useProductSelection(product)`                  | Selection state, plus the resolved variant, validation, pricing, stock and max quantity, and the image to highlight. |
| `useAddToCart(product, selection)`              | Quantity state (clamped to stock); builds the cart line, adds it, and opens the drawer.                              |
| `usePurchaseActions({...})`                     | Validation on click, the hint text, and focusing the first missing option group.                                     |
| `useQuantityInput({ value, max, onChange })`    | Stepper actions and the editable value that commits on blur or Enter.                                                |
| `useGalleryNavigation(images, highlightImage?)` | Active image, previous/next and arrow keys, jumping to the highlighted image.                                        |
| `useImageZoom()`                                | Zoom by hover, click or keyboard, and panning while zoomed.                                                          |
| `useShareLink(title)`                           | Native share with clipboard fallback and a status message that clears itself.                                        |

### Cart (`src/features/cart/`) and reviews (`src/features/reviews/`)

| Component        | Notes                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `LazyCartDrawer` | Code-split wrapper (`useLazyCartDrawer`). Prefetches when the browser is idle, mounts on first open, and offers a retry if the chunk fails. |
| `CartDrawer`     | Headless UI dialog: an "Added…" banner (or a warning at the stock limit), line items, subtotal and an empty state.                          |
| `CartItemRow`    | Image, options, unit price, quantity stepper, line total and remove.                                                                        |
| `ReviewsSection` | Rating summary, filters, tabs and paged list (`useReviewList`, 4 per page; focus moves to the list after paging).                           |
| `RatingSummary`  | Progress ring plus per-star bars showing each rating's true share of the total.                                                             |
| `ReviewItem`     | Review with like/dislike, saved via `useReviewVotesStore`.                                                                                  |

### Stores (`src/store/`)

| Store                 | Persisted as               | API                                                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCartStore`        | `easy-orders-cart` (v2)    | `items`, `isOpen`, `lastAdd`, `addItem`, `updateQuantity` (≤ 0 removes), `removeItem`, `openCart`, `closeCart`. `addItem` merges by `variantId` and clamps to stock. Selectors: `selectCartCount`, `selectCartSubtotal`, `selectCartCurrency`, `selectCartItems`, `selectCartIsOpen`. |
| `useWishlistStore`    | `easy-orders-wishlist`     | `ids`, `toggle(productId)`, `selectWishlistCount`.                                                                                                                                                                                                                                    |
| `useReviewVotesStore` | `easy-orders-review-votes` | `votes`, `vote(reviewId, 'like' \| 'dislike')`. Voting the same value again clears it.                                                                                                                                                                                                |

```tsx
const count = useCartStore(selectCartCount); // subscribe to exactly what you render
```

## Scope decisions and design deviations

**Scope.**

- Login, search, categories and the menu are shown as in the design but are inactive and announced as unavailable.
- Footer links, "View All", "View Size Chart" and "Delivery T&C" are static.
- "Related Product" and "Popular this week" repeat the API product.
- The API returns no reviews despite `join=reviews`, so reviews, the rating and the sold count are consistent static data (1,250 reviews, average 4.5).
- Checkout is out of scope: "Checkout Now" adds the item and opens the cart.

**Deliberate differences from the design.**

- **Stock badge and quantity selector:** required by the brief but absent from the design, so both are kept compact.
- **Text contrast:** the design's secondary greys (`#8F8F8F`, `#8892A2`) fail WCAG AA at about 3.2:1, so they use `#737373` (4.74:1) instead. All other colours are the design's exact values.
- **Breadcrumb:** the API's categories are flat tags, not a hierarchy, so the breadcrumb shows only the primary category. All categories are listed under the purchase panel.
- **Data-driven content:** the currency comes from the API (EGP, where the design shows £/$). Colour swatches use the API's swatch photos, and review avatars are initials.
- **Rating bars:** the design's sample numbers aren't internally consistent, so the bars show each rating's true share of the review data.

## Testing

| Layer                            | Tooling                               | Where                                      |
| -------------------------------- | ------------------------------------- | ------------------------------------------ |
| Unit (store, variant logic, API) | Vitest                                | `src/**/*.test.ts`                         |
| Component                        | React Testing Library                 | `src/**/*.test.tsx`                        |
| Integration (full page in jsdom) | RTL + mocked service                  | `src/test/checkout-flow.test.tsx`          |
| Accessibility                    | axe (page, skeleton, error, drawer)   | `src/test/accessibility.test.tsx`          |
| E2E (real browser)               | Playwright, desktop 1440 + mobile 390 | `e2e/purchase.spec.ts`, `e2e/page.spec.ts` |
| Live smoke                       | Playwright, unmocked                  | `e2e/live.spec.ts`                         |

E2E tests mock the API with a captured copy of the live response (`e2e/fixtures/sneakers12.json`). They also replace CDN images with a 1px PNG, because the image CDN intermittently times out. The live smoke test covers the real integration.

## Deployment

```bash
npm run build     # static bundle in dist/
npm run preview   # optional: check the build locally
```

Deploy `dist/` to any static host (Vercel, Netlify, S3 + CloudFront, nginx). It is a single page with no client-side routing, so no rewrite rules are needed. The browser calls the API directly, and the API allows cross-origin requests. To show another product, change `PRODUCT_SLUG` in `src/services/config.ts`.

## Known limitations

- **Image CDN reliability:** images on `easyorders.fra1.digitaloceanspaces.com` intermittently hang. `ProductImage` retries once, then shows a placeholder. The CDN can't resize images, so thumbnails download full-size files.
- **Currency:** the API provides no ISO currency code, so prices show the product's custom currency label or `EGP`.
- **Single product:** the page shows one product, set by `PRODUCT_SLUG`. There is no routing.
