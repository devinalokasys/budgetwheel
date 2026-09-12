# Changes

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
