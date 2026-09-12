# Changes

## 0.5.1 — 2026-09-12

Data alignment fixes: the mobile Dealer Console, desktop Dealer Console,
and Messages pages were each built from separate design mockups sent at
different times, and each one invented slightly different numbers for what
was supposed to be the same vehicle. Audited every vehicle that appears in
more than one place and aligned them to the real seeded DB record
(`src/lib/db/seed.ts`) as the source of truth:

- **BMW 330i**: desktop Floor Inventory table had it as a 2021 at 33k mi
  for $27,990 "Fair Market" — actually a 2022 at 28,100 mi for $33,800,
  $1,450 below market (now matches the mobile console and the seeded
  listing exactly).
- **Tesla Model 3**: desktop table had a VIN typo (`...EB...` vs the
  seeded `...EA...`) and showed 19k mi / "$1,100 below" instead of the
  real 24,180 mi / $2,400 below market.
- **Toyota Camry SE trade-in**: the mileage (28,400 / 32,150 / 41,200 mi),
  the VIN suffix shown, and the seller's location (San Jose vs Portland)
  disagreed across Messages, the mobile console, and the desktop console.
  All now read 32,150 mi and the seeded VIN's actual last 4 digits.
  "Metro Auto Group" as the top bidder's name is kept — that one's
  actually consistent across multiple independently-received mockups, not
  an error.
- **Honda Accord Sport** trade-in: mileage and algo-target bid amount
  disagreed between mobile and desktop; aligned to the desktop numbers
  (more detailed/specific).
- **Current user identity**: the seeded consumer account was named
  "Jane R." with no page ever showing that name; the newly-received
  Account page mockup names this same person "Marcus Sterling" — updated
  the seed user (and the one place that showed a different name for the
  same seller) to match, so the identity is consistent everywhere it's
  shown.

## 0.5.0 — 2026-09-12

Built out Saved, Sell, and Deal Pipeline (previously "coming soon"
placeholders) and did a polish pass on already-built pages. Account stays
a placeholder — that design is still to come.

- **Saved**: real favorites, not a mockup. `FavoriteButton` now persists
  through `db.saveListing`/`unsaveListing`/`isSaved` (was local-only
  `useState`); the Saved page reads `db.listSavedListings` and reuses
  `BrowseListingCard` as-is. Runs as a fixed demo identity
  (`src/lib/currentUser.ts`) since there's no auth yet.
- **Sell**: a real trade-in submission form (year/make/model/mileage/
  condition/VIN) that calls `db.createTradeSubmission`, not a static page.
- **Deal Pipeline** (`/dealer/deals`): lists open trade submissions
  marketplace-wide via `db.listTradeSubmissions('open')`, with a working
  "Submit Offer" that calls `db.createOffer` — so a submission from Sell
  shows up here for real, and submitting a bid here is a genuine write, not
  a toast pretending to be one.
- **Polish**: Home's search form, category tiles, and CTA cards now
  actually navigate (were inert decorative divs) — category tiles and the
  price dropdown pass real filters to Browse via URL params
  (`bodyType`, `priceMaxCents`), which Browse now applies to its
  `db.listListings` call instead of only showing static decorative filter
  chips. Browse's search box is wired to a real (client-side) title
  match, with a working clear button and an empty-results state. Fixed a
  "Showing 1 verified cars" pluralization bug, a "Reset Filters" button
  that didn't reset its own local state, and replaced a fragile
  label-string-matching check in `FeaturedDealCard` with an explicit field
  on the mapper output.

## 0.4.0 — 2026-09-12

Added light/dark theme support. Every color in the app already went through
semantic Tailwind tokens (`bg-primary`, `text-on-surface-variant`, etc.), so
the implementation is a CSS-variable swap under a `.dark` class rather than
per-component changes:

- `src/index.css`'s `@theme` block now holds a new, hand-designed **light**
  palette (the only design mockups received were dark-only, so this pairs
  each dark token with an accessible light counterpart — reusing M3's
  scheme-invariant `*-fixed` roles unchanged, swapping `inverse-*` roles,
  and deepening `secondary`/`tertiary` base tones for contrast on white). A
  `.dark { ... }` block holds the original dark values, unchanged.
- `@custom-variant dark (&:where(.dark, .dark *));` added — Tailwind v4's
  default `dark:` is media-query-only; this enables class-based toggling.
- `src/contexts/ThemeContext.tsx` + `src/hooks/useTheme.ts`: theme state,
  persisted to `localStorage`, defaulting to `prefers-color-scheme` when
  nothing is stored yet.
- A light/dark toggle button in `Header.tsx` (covers every route through
  the shared `Layout`) and a second one in `DealerConsoleDesktop.tsx`'s own
  header (the one page that doesn't use `Layout`).
- `index.html` drops the hardcoded `class="dark"` and gets a small inline
  blocking script so the correct theme applies before first paint (no
  flash of the wrong theme).
- Verified in a real browser across Home/Browse/Messages/Dealer Console
  (mobile + desktop): default-light under a light system preference,
  default-dark under a dark system preference, manual toggle, and
  persistence across reload.

## 0.3.0 — 2026-09-11

Added a real data layer (`src/lib/db`) behind a single `DataProvider`
interface, replacing the hardcoded mock arrays in `src/data/listings.ts`:

- **Local backend** (default): IndexedDB via `idb`, no server/config needed.
- **Firestore backend** (`VITE_DATA_PROVIDER=firestore`): Firestore +
  Cloud Storage for images. No Firebase project exists for this app yet,
  so this is implemented against the schema but untested against a real
  project — see `docs/db-design.md`'s "Not yet done".
- Full schema: `User`, `DealerProfile`, `VehicleListing`, `VehicleImage`,
  `CarfaxReport`, `SavedListing`, `SavedSearch`, `Conversation`/`Message`,
  `Offer`, `TradeSubmission`. Detailed field-by-field design and the
  image-storage strategy (static seed images vs. user-uploaded
  blobs/Storage) are in `docs/db-design.md`.
- Wired `Home` and `Browse` up to load real (seeded) listings through this
  layer via `src/lib/db/mappers.ts`, which converts normalized records back
  into the exact display-shaped props those components already expected —
  no component changes needed. `DealerConsole`/`DealerConsoleDesktop` and
  `Messages` still render their existing static content; wiring those up
  is follow-up work, not part of this pass.
- Verified in a real browser (not just `tsc`/`vite build`, which can't
  catch a runtime data bug): caught and fixed a real cents→dollars
  formatting bug this way (prices were rendering as $4,280,000 instead of
  $42,800) before it shipped.

## 0.2.0 — 2026-09-11

Added a desktop layout for the Dealer Console (`/dealer` at `lg:` breakpoint
and up): sidebar navigation, top command strip, KPI instrument cards, a
private-seller acquisitions queue, a live floor inventory table, a buyer
inquiries stream, floorplan/capital velocity panel, and a quick-tools grid.
Mobile Dealer Console is unchanged; the two layouts are toggled with pure
CSS (`lg:hidden` / `hidden lg:block`), not a JS breakpoint hook.

A desktop Browse Inventory mockup was also sent but got cut off by the same
message-length limit early in the page (right after the nav links) — not
enough arrived to build from, so Browse remains mobile-layout-only for now.

## 0.1.0 — 2026-09-11

Initial build: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 scaffold
(matching the stack conventions used across the sibling alokasys.com
portfolio repos), wired up to the BudgetWheels dark Material Design 3–style
design system (custom color/spacing/typography tokens, Outfit + Plus
Jakarta Sans fonts, Material Symbols icons).

Implemented pages: Home, Browse, Dealer Console, and Messages (My Garage
tab). The Messages page's Chat & Leads and Saved tabs are placeholders —
those design mockups were cut off by a message-length limit before arriving.

Dev server pinned to port 5175 to avoid colliding with sibling repos'
dev servers.
