# Changes

## 0.17.0 — 2026-09-24

Wired HomeDesktop's "A Few Listings Worth a Look" showcase to real
listings — it was the one piece of Home still on static mock data
(`data/homeDesktop.ts`'s `showcaseCards` array), which was itself a data
inconsistency: mobile Home already fetches real listings for its
Featured Deals rail, so desktop and mobile were showing different cars.

- New `toShowcaseListingView` mapper in `src/lib/db/mappers.ts`, following
  the same pattern as `toFeaturedListingView`/`toBrowseListingView` —
  converts a `VehicleListing` into the showcase card's exact display
  shape rather than changing the presentational JSX.
- Dropped the `apr` field entirely rather than carrying it forward: the
  mock data quoted a specific interest rate per car (e.g. "5.9% APR")
  that has no backing field anywhere in the schema — the same kind of
  fabricated-specificity issue already fixed elsewhere (0.15.0–0.16.1).
  Replaced with a plain loan-term label, matching the no-rate-quoted
  convention `toFeaturedListingView` already uses for its monthly
  estimate.
- `HomeDesktop.tsx` now fetches the first 4 active listings on mount
  (same `db.seedIfEmpty()` + `db.listListings({status:'active'})` pattern
  as mobile `Home.tsx`) and "View Details" navigates to the real
  `/listing/:id` route instead of a generic `/browse` link.
- Removed the now-dead `ShowcaseCard` interface and `showcaseCards` mock
  array from `data/homeDesktop.ts`.
- Verified: rebuild + lint clean, Playwright-confirmed the section
  renders real seed listings (2023 Ford F-150 Lightning, 2022 BMW 330i,
  2022 Tesla Model 3, 2021 Audi A5) with live-computed below-market deltas
  and real Carfax-derived history pills, no console errors.

## 0.16.1 — 2026-09-24

First production deploy went live at https://budgetwheel.web.app, which
surfaced two real issues the earlier repositioning work (0.15.0–0.16.0)
missed because they aren't in the visible page components:

- **SEO meta tags still had the fabricated claims.** `index.html`'s
  `<title>`, description, keywords, OG tags, Twitter card tags, and
  JSON-LD structured data all still said "real-time algorithmic
  valuation," "100% verified vehicle histories," "digital escrow
  protection," and "instant dealer cash buyout guarantees" — the exact
  claims already removed from Home/Account. This is what Google and link
  previews actually show, so it's the most externally-visible copy in the
  app and the last place it should've been left stale. Rewrote all of it
  to match the shipped positioning (verified accounts, vehicle history
  reports, price-vs-market transparency).
- **CSP was silently blocking the dark-mode init script in production.**
  `index.html` has a small inline `<script>` that reads `localStorage`
  and applies the `.dark` class before React mounts, to avoid a flash of
  the wrong theme. `firebase.json`'s CSP (`script-src 'self'
  https://apis.google.com`) has no allowance for inline scripts, so this
  silently failed in production — confirmed via a Playwright console-error
  check the moment the live site was checked, invisible in local dev where
  no CSP header is sent. Fixed by adding the script's exact
  `sha256-NfGkiP00c+rcoSr/GYqyJdGNTCZsySAYMDkF2SLi9k0=` hash to
  `script-src` (verified the hash matches both the source and Vite's
  built `dist/index.html` byte-for-byte, so this won't drift silently if
  the build pipeline changes).
- Deployed via the GitHub Actions workflow added in 0.13.0, now that
  `FIREBASE_SERVICE_ACCOUNT` is set — confirmed live and rendering
  correctly via Playwright screenshot against the production URL.

## 0.16.0 — 2026-09-24

Removed a much larger fabrication than the Carfax branding fixed in 0.15.x:
the Account page's "Buying Power Vault" widget claimed a real financing
pre-approval — a "Soft Pull" credit check at a specific score (840),
a "Guaranteed" 5.9% APR, a "Pre-locked" monthly payment, and a downloadable
"Pre-Approval PDF" — none of which back onto any real credit or financing
integration. This is the exact "fake financing pre-qualification" pattern
the earlier market review named, just not caught in the first pass because
it wasn't on the Home page.

- `AccountDesktop.tsx`: removed the entire Buying Power Vault card and its
  matching `Buying Capacity @ 840 Tier 1` header stat. Renamed "KYC & Vault
  Docs" → "My Documents" and dropped its fake "100% Verified" badge (no
  real document-verification process exists). Dropped the fake
  "Telemetry Synced / Last refresh: Just now" pill, the "KYC Identity
  Verified" tooltip, and the "Level 3 Certified" badge — softened
  "Verified Trader" → "Verified Account" and "Security & KYC" → "Security"
  to match what's actually true (a signed-in, authenticated account, not a
  KYC-compliant trading platform).
- `src/data/accountDesktop.ts`: `'Verified by Stripe Identity'` (no Stripe
  integration exists) → `'Uploaded by you'`; `'Push alert on new binding
  bids'` → `'Alert on new dealer bids'`; dropped the `'2 Binding'` label on
  the cash-offers stat (a dealer bid isn't a binding sale).
- `DesktopFooter.tsx` — **shared across every desktop page**, including
  the Home page already "finished" in 0.15.0: its intro paragraph claimed
  "algorithmic automotive trading and valuation infrastructure" and a
  "Marketplace Live — 14,208 verified units active" badge, neither of
  which reflect this app's actual scale or the fact that no pricing
  algorithm exists. Rewrote to plainly describe what the app is (verified
  buyers/sellers, price-vs-market comparison, history reports) and removed
  the fake live-count badge. Verified this fix reaches Home's footer too,
  not just Account's, since the component is shared via `DesktopPageShell`
  as well as direct use in `HomeDesktop.tsx`/`AccountDesktop.tsx`.
- Verified: rebuild + lint clean. Screenshotted both pages via a temporary,
  unauthenticated preview route added just for this check and fully
  reverted afterward (`/account` stays behind `ProtectedRoute`) — needed
  because Account requires real Firebase Auth sign-in that can't be
  scripted headlessly.

## 0.15.1 — 2026-09-23

Continued the trust-copy repositioning (0.15.0) onto Dealer Console and
Account pages — the two remaining surfaces with literal Carfax brand
references, deferred from that change as lower priority.

- `src/data/dealer.ts`: trade-bid tag `'Carfax 0 Acc'` → `'0 Accidents'`.
- `src/data/accountDesktop.ts`: `healthCheck: 'Clean Carfax'` → `'Clean
  Title'`; `'Carfax Synced 100%'` → `'Verified'`; document label `'2
  Carfax Reports Synced'` → `'2 Vehicle History Reports'`.
- Verified: rebuild + lint clean, no other files touched.
- **Not done, flagged separately**: while in `AccountDesktop.tsx` this
  surfaced a bigger issue than brand naming — a whole "Escrow" section
  claims funds are "held by BudgetWheels Trust Bank N.A." with a
  fictional deal ID, a document row claims "Verified by Stripe Identity",
  and pricing/buyout copy claims a binding "algorithm floor" and
  guaranteed dealer buyouts. None of these back onto a real feature
  (no escrow/trust-banking integration, no Stripe integration, no
  pricing algorithm). This is a bigger scope than a copy tweak — it's a
  fabricated capability narrative across a whole page section — so it
  was left as-is pending explicit direction rather than silently gutted.

## 0.15.0 — 2026-09-23

Repositioned the Home page's marketing copy around what the app actually
does, after a market/strategy review flagged that the "Precision Market
Engine" algorithmic-pricing framing overpromises versus a cold-start
marketplace, and that the trust surface had a real bug: every dealer-type
seller was shown as "Verified Dealer" regardless of the underlying
`DealerProfile.verified` flag.

- **Real bug fix**: `sellerLabel()` in `src/lib/db/mappers.ts` now reads
  `dealer?.verified` instead of hardcoding "Verified Dealer" for any
  dealer-type seller. A dealer whose license hasn't been checked (the
  default for a new dealer account) now correctly shows "Unverified
  Dealer". Propagates automatically to `BrowseListingCard`,
  `FeaturedDealCard`, and `ListingDetail` via the existing
  `verifiedLabel` field — no other files needed changes.
- Removed fabricated claims from `Home.tsx`, `HomeDesktop.tsx`, and
  `src/data/homeDesktop.ts`: fake Carfax branding ("Clean CARFAX",
  "Instant Carfax valuation" — Carfax is a third-party trademark this app
  has no relationship with), a fake "Verified Escrow" location tag (no
  escrow service exists), a fake VIN-decode/instant-cash-offer widget
  with a fabricated "$24,800 average buyout", and fake live inventory
  numbers ("45,820 Vehicles", "18,420 Active Units", "150k+ Cars Sold",
  "100% Escrow Wire") that don't reflect the app's actual seed-data scale.
- Rewrote the hero, search console, Buy/Sell panels, and telemetry strip
  to lead with what's actually built: verified sign-in, direct buyer-
  seller messaging, real price-vs-market comparison on listings, and a
  real dealer cash-bid flow on submitted trade-ins — rather than
  algorithmic-pricing and escrow-protection language the product doesn't
  back up yet.
- Verified: full rebuild + lint clean (only the 4 pre-existing accepted
  warnings remain). Playwright screenshots confirm the mobile and desktop
  Home pages render correctly with the new copy.

## 0.14.0 — 2026-09-21

Real buyer/seller messaging — the last major gap from `docs/db-design.md`'s
"Not yet done" list. `Conversation`/`Message` have been fully modeled in
the schema and both `DataProvider` backends since 0.3.0 but had zero UI
anywhere; `Messages.tsx`'s "Chat & Leads" tab was still a `Placeholder`.

- Two new provider methods: `getOrCreateConversation(listingId, buyerId,
  sellerId)` (reuses an existing thread for the same buyer+listing instead
  of spawning duplicates on repeat clicks) on both backends.
- New "Message" button on the vehicle detail page's seller card — the
  first real entry point into messaging anywhere in the app. Signed-out
  click redirects to `/login`, matching `FavoriteButton`'s and the offer
  form's existing pattern.
- New `ConversationThread.tsx` (`/messages/:conversationId`, behind
  `ProtectedRoute`): message bubbles, a pinned listing snippet linking back
  to the vehicle, and a compose box wired to `db.sendMessage`.
- `Messages.tsx`'s "Chat & Leads" tab now lists real conversations
  (`db.listConversations`), each row showing the other party's name, the
  listing it's about, and the last message preview — tapping one opens the
  thread. The tab's unread dot now reflects real `unreadCountBuyer`/
  `unreadCountSeller` values instead of always being on.
- **Not done**: no "mark as read" — `unreadCount*` fields exist and are
  read, but nothing resets them when a thread is opened, so the dot can
  stay lit after reading. Scoped out deliberately rather than adding an
  `updateConversation` method for a half-considered read-receipt design;
  a real follow-up, not an oversight.
- Verified: full rebuild + lint clean. Playwright-confirmed `/browse` →
  real listing detail page → "Message" button renders and (signed-out)
  correctly redirects to `/login` on click with zero console errors, and
  that both `/messages` and the new `/messages/:conversationId` route
  redirect signed-out visitors to `/login`. Couldn't exercise an actual
  signed-in conversation thread for the same reason noted in 0.11.0 (no
  local Firebase Auth credentials in this dev environment).

## 0.13.0 — 2026-09-21

Phase 4 of the deploy plan: `.github/workflows/deploy.yml`, a manual
(`workflow_dispatch`-only, matching the sibling repos' actual practice —
no auto-deploy on push) GitHub Actions workflow that builds and deploys
to Firebase Hosting. Needed because the local `firebase` CLI reliably gets
killed (SIGKILL) on any Firestore- or deploy-related subcommand on this
machine — reproduced identically in both my sandboxed tool environment
and the user's own regular terminal, which rules out a sandboxing
restriction and points at something systemic to the local CLI/network
path instead (available RAM isn't the constraint — confirmed 48GB total).
Moving the actual deploy to GitHub's runners sidesteps it entirely, and
is the more correct long-term home for this anyway.

Bakes the six `VITE_FIREBASE_*` values directly into the workflow's build
step rather than requiring them as GitHub secrets — they're the public
Firebase web client config already committed in this repo's history and
documented throughout as non-sensitive (real access control is
`firestore.rules`). The one genuine secret, `FIREBASE_SERVICE_ACCOUNT`,
still needs to be set as a GitHub Actions secret before the workflow can
run — attempted via `gh secret set` but blocked by Claude Code's own
auto-mode safety classifier (writing to a secret store), so that one step
needs a human: `gh secret set FIREBASE_SERVICE_ACCOUNT --repo
devinalokasys/budgetwheel < serviceAccountKey.json`, or paste the same
file's contents into Settings → Secrets and variables → Actions in the
GitHub UI.

## 0.12.0 — 2026-09-21

SEO pass on `index.html`, modeled on mortgage-calculator's SEO setup (the
site had no meta description, keywords, robots, canonical, OG/Twitter tags,
or structured data at all before this — just a bare `<title>`):

- Keyword-aligned `<title>` and meta description, grounded in the real hero
  copy already on the homepage ("Precision Automotive Marketplace... Real-time
  algorithmic valuation, transparent 100% verified vehicle histories, digital
  escrow protection, and instant dealer cash buyout guarantees") — no
  invented claims, and no use of the page's own "45,820 inspected vehicles"
  stat since it can't be verified as real inventory rather than seed/demo data.
- Added `meta keywords`, `robots`, canonical link, full OpenGraph/Twitter
  blocks (using the real `public/images/logo-brand.jpg` asset), and JSON-LD.
- Added `public/robots.txt` and `public/sitemap.xml` — sitemap lists only `/`
  and `/browse`, the two routes outside `ProtectedRoute` in `App.tsx`; every
  other page (dealer console, messages, sell/saved/account) is either
  auth-gated or a design placeholder.
- Canonical/OG URLs point at `budgetwheel.web.app` (the real Firebase
  Hosting default domain, confirmed via `.firebaserc`) since no custom
  domain is configured yet and the site isn't deployed (still 404s) — these
  are correct once a deploy actually happens, not a live claim right now.

## 0.11.0 — 2026-09-21

Code-quality pass plus wiring more of `Messages.tsx` to real data:

- **Bug fix**: `DealPipeline.tsx`'s `SubmissionCard` took `dealerId={user?.uid
  ?? ''}` — dead defensive code, since this page is only reachable through
  `DealerRoute`, which already guarantees a signed-in dealer. The practical
  failure mode wasn't data corruption (`firestore.rules`' `offers` create
  rule requires `fromUserId == request.auth.uid`, so an empty string would
  get rejected) but a silent one: the write throws, `submitOffer` never
  reaches `setStatus('sent')`, and the button is stuck on "Sending…" with
  no visible error. Now uses `user!.uid` directly and trusts the route
  guarantee, per the "no defensive handling for scenarios that can't
  happen" rule — a real crash if that guarantee is ever actually violated
  beats a silent stuck button.
- **`Messages.tsx`**: "My Garage" now shows the signed-in user's actual
  trade submission (`listTradeSubmissionsBySeller`, new provider method —
  needed because an unfiltered `listTradeSubmissions()` only works for a
  dealer under `firestore.rules`, not a consumer reading their own) with
  real dealer bids (`listOffersForTradeSubmission`, also new) instead of a
  hardcoded "2021 Toyota Camry SE" example. Deliberately dropped the
  original mockup's Views/Saves counts rather than inventing fake numbers
  for them — those are `VehicleListing` concepts (public marketplace
  browsing) that don't apply to a `TradeSubmission` (dealer-only, via Deal
  Pipeline), so faking them would just swap one kind of fake data for
  another. "Saved" tab now reuses the real `Saved` page instead of a
  `Placeholder`, and its tab label shows a real count instead of a
  hardcoded `(6)`. "Chat & Leads" stays a placeholder — real messaging
  needs a way to start a `Conversation` from a listing, which doesn't
  exist yet (no "message seller" entry point on the new listing detail
  page either).
- Refreshed `docs/db-design.md`'s "Not yet done" section, most of which
  had gone stale since 0.3.0 (claimed no Firebase Auth existed — it's
  fully wired since 0.8.0) — now accurately lists the real remaining gaps:
  `DealerConsole`/`DealerConsoleDesktop` still fully static (including
  stat tiles that don't have a clean aggregation path over the current
  schema yet, not just a wiring gap), Chat & Leads, and the lack of a
  Firebase Auth emulator for local dev (every `ProtectedRoute`/
  `DealerRoute` page is currently untestable against local IndexedDB data
  — sign-in only works against the real deployed app).
- Verified: full rebuild + lint clean. Confirmed via Playwright that
  `/messages` and `/dealer/deals` still correctly redirect to `/login`
  signed-out with zero console errors; couldn't exercise the actual
  signed-in "My Garage" view end-to-end for the reason above (no local
  Auth credentials) — reasoned through the data-fetching logic and rules
  interaction carefully instead, same limitation 0.8.0 already noted for
  testing auth locally.

## 0.10.0 — 2026-09-21

Added the vehicle detail page (`/listing/:id`) — until now there was no
way to click into a single listing at all: `BrowseListingCard` and
`FeaturedDealCard`'s "View Deal" buttons were inert, so browsing only ever
showed a grid of cards with no way to see the full photo set, the Carfax
report (already fully modeled in the schema and seed data, but never
rendered anywhere), or contact a seller.

- `toListingDetailView` in `src/lib/db/mappers.ts`: new mapper alongside
  the existing card-view ones, pulling every listing image (not just the
  primary), the full Carfax report, and dealer profile info (rating,
  address) when the seller is a dealer.
- `src/pages/ListingDetail.tsx`: image gallery with thumbnail strip, full
  spec grid, Vehicle History card, description, seller card, and a
  "Make an Offer" form that calls the already-implemented
  `db.createOffer` — signed-out visitors are redirected to `/login` on
  submit, matching `FavoriteButton`'s existing pattern. One responsive
  component (no separate mobile/desktop file) since there's no bespoke
  design mockup for this page, same as Browse/Sell/Saved/Messages.
  Deliberately doesn't show other buyers' offers on the same listing —
  unlike Deal Pipeline's dealer-facing trade-submission bidding, this is
  a private negotiation between one buyer and the seller.
- Wired both card components' "View Deal" buttons to `Link` elements
  pointing at the new route, rather than making the whole card clickable
  — `FavoriteButton` doesn't stop event propagation, so wrapping the
  entire card in a `Link` would have made favoriting also navigate away.
- Verified end-to-end in a real browser (mobile + desktop viewports, plus
  the not-found state for a bad id), not just `tsc`/`vite build`.

## 0.9.2 — 2026-09-21

- **Stopped tracking `.env.production` in git** — GitHub's secret scanning
  flagged its `VITE_FIREBASE_API_KEY` (commit `df07865`, "Stand up the real
  Firestore backend"). `.gitignore` never excluded real `.env*` files, only
  `.env.example`'s own comment already documented the intent ("like every
  sibling repo's Firebase web config, these are public client identifiers
  once real, not secrets") — so this was a tracking gap, not a design
  decision reversal. The key itself isn't a traditional secret (Firebase
  web config is meant to ship in the client bundle; real access control is
  `firestore.rules`, already correctly scoped — everything private requires
  `signedIn()` + ownership, nothing is a blanket `allow read, write: if
  true`), but committing the real-values file was still sloppy and the
  pattern is worth closing regardless of this key's actual blast radius.
  `git rm --cached` only — the file stays on disk so local builds keep
  working. Also fixed `docs/db-design.md`'s stale "no Firebase project
  exists yet" note, left over from before this same commit stood one up.
  **Follow-up for a human, not done here:** consider adding an HTTP-referrer
  restriction to this API key in Google Cloud Console as defense-in-depth,
  and optionally purging it from the 12-commit git history with
  `git filter-repo` + a force-push if you want it gone from `df07865`
  entirely (both are hardening, not required — the rules are what actually
  gate the data).

## 0.9.1 — 2026-09-14

Dealer/consumer segregation, at both layers that actually matter:

- **UI**: new `DealerRoute` guard (`/dealer`, `/dealer/deals`) requiring
  not just sign-in but a dealer-type profile — a signed-in consumer sees
  a clear "Dealer accounts only" message instead of the console. Desktop
  header hides the "Dealer Portal" nav link entirely for non-dealers.
  `AuthContext` now exposes `profile` (the app-level `User` doc with
  `type`) alongside the Firebase Auth identity, since role isn't
  something Firebase Auth itself knows about.
- **Data** (the boundary that actually matters — a route guard alone
  doesn't stop someone querying Firestore directly): `tradeSubmissions`
  reads were `if signedIn()` — any consumer's auth token could read
  every other seller's mileage/asking price/VIN, not just their own.
  Tightened to the submission's own seller, or a `type == 'dealer'`
  profile.

## 0.9.0 — 2026-09-14

Real Firestore backend is live: created the `budgetwheel` Firebase project,
enabled Authentication (Google) and Firestore, deployed security rules,
seeded production data, and verified the actual production build reads
from it end-to-end (6 listings, images, dealer names all rendering
correctly against the live database, not local IndexedDB).

- `firestore.rules`: owner-keyed writes per collection matching
  `docs/db-design.md`'s schema (public read on listings/images/dealer
  profiles/Carfax reports since browsing is public; everything else
  scoped to the signed-in user who owns it). `firestore.indexes.json`
  starts empty — Firestore will surface a direct link if a composite
  index is ever actually needed by a query.
- `scripts/seedFirestore.ts` (`npm run seed:firestore`): a one-time
  Admin SDK seed script, since the rules correctly reject the old
  client-side `seedIfEmpty()` path now that they're enforced —
  `firestoreProvider.seedIfEmpty()` is now a no-op for that reason (the
  local/IndexedDB provider's own `seedIfEmpty` is unaffected and still
  runs per-browser as before).
- `.env.production` (committed — these are public client identifiers,
  not secrets, same as every sibling repo) sets
  `VITE_DATA_PROVIDER=firestore` so production builds default to the
  real backend; local dev keeps defaulting to IndexedDB.
- `firebase.json`/`.firebaserc` added (hosting config + security headers,
  matching the sibling repos' pattern) — deployment itself is next.
- Note: the `firebase` CLI's Firestore-specific subcommands
  (`firestore:databases:list`, `firestore:deploy`, etc.) reliably hang
  and get killed on this machine, in both the sandboxed tool environment
  and a plain terminal — worked around it by publishing rules via the
  console and seeding via the Admin SDK directly (`tsx`), neither of
  which touches the broken CLI path. `firebase login`/`projects:list`/
  `apps:*` all work fine, so this seems specific to Firestore's own
  subcommands, not Firebase auth or general CLI health.

## 0.8.0 — 2026-09-13

Real authentication (Google Sign-In via Firebase Auth), replacing the
hardcoded demo user (`CURRENT_CONSUMER_ID`/`CURRENT_DEALER_ID`, now
deleted) everywhere it was used — favoriting, selling, and dealer offers
all act as the real signed-in user now. Follows the sibling portfolio
apps' pattern (a plain auth module + hook, `firebase/auth` dynamically
imported so it's not in the main bundle for visitors who never sign in),
adapted to use a Context (`AuthContext`, mirroring the existing
`ThemeContext`) rather than prop-drilling from the root — this app's
routed, multi-file page structure isn't the siblings' single-page shape,
so a root-level prop hand-off would mean threading auth through ~10
intermediate components just to reach the headers.

- New `/login` page, `ProtectedRoute` guarding `/sell`, `/saved`,
  `/messages`, `/account`, `/dealer`, `/dealer/deals` (redirects to
  `/login` and back). `/` and `/browse` stay public.
- First-sign-in provisioning: creates a `User` doc (consumer by default)
  on first login, matching chess-master's `upsertUserProfile` pattern.
- Both headers now show the signed-in user's photo/name with a sign-out
  action, or a "Sign In" button when signed out. Desktop header's "Saved"
  count is now real (`db.listSavedListings`), not a hardcoded `(4)`.
- No Firebase project exists yet, so sign-in isn't actually usable in
  this build — verified instead that the app degrades correctly: the
  auth check resolves to "signed out" rather than hanging, and clicking
  sign-in shows a clear error rather than crashing. Wiring a real project
  is next.

## 0.7.0 — 2026-09-13

Start of the "make this a real app" work: authentication, a real
Firestore backend, and deployment come next.

- Fixed a real perf/correctness issue: every mobile/desktop-split route
  (`/`, `/account`, `/dealer`) was mounting *both* layouts simultaneously
  and hiding one with CSS (`lg:hidden` / `hidden lg:block`), which meant
  each page's data-fetching `useEffect` ran twice on every load — wasteful
  today, and would have doubled real Firestore reads once the app has a
  real backend. New `useIsDesktop` hook + `Responsive` component mount
  only the layout that matches the actual viewport, verified via Playwright
  (confirmed single-mount at both breakpoints, and correct swap on live
  resize).
- Corrected the footer to the real company name (Aloka Systems LLC).
- Gave every page a real desktop layout — previously only Home, Account,
  and Dealer Console had one, so navigating to Browse, Saved, Sell,
  Messages, or Deal Pipeline from a desktop page dropped you into the
  mobile bottom-nav layout squeezed onto a wide screen: a jarring format
  switch, and in Deal Pipeline's case an actually-unreachable page (no
  link to it existed anywhere on desktop). New `DesktopPageShell`
  (consumer pages: shared top-nav header + footer) and `DealerDesktopShell`
  (extracted from `DealerConsoleDesktop`, now shared with the new
  `DealPipelineDesktop` so dealer-portal pages stay inside the same
  sidebar chrome rather than jumping to the consumer format). Browse and
  Saved's listing lists become responsive grids at `lg:`/`xl:` rather than
  a single narrow column. Also added a real "Deal Pipeline" entry to the
  dealer sidebar nav (previously missing) and marked the sidebar's other
  not-yet-built items as visibly disabled rather than silently dead links.

## 0.6.0 — 2026-09-12

Added desktop layouts for Home and Account, built from newly-received
design mockups. Both pages are self-contained (`HomeDesktop.tsx`,
`AccountDesktop.tsx`) and swapped in at `lg:` breakpoint via CSS, same
pattern as the existing Dealer Console mobile/desktop split — the mobile
versions are untouched.

- **Home desktop**: hero search console, live telemetry ticker, buy/sell
  dual-path panels, vehicle-class category grid, and a 4-car "Great Deals"
  showcase (BMW, Tesla, RAV4, Audi). The showcase's specific numbers use
  the real seeded listing data (already aligned in 0.5.1) rather than the
  mockup's own figures, so a listing shows the same mileage/price
  everywhere in the app. The Audi card's mockup content was cut short by
  a message-length limit; completed it with real seed data and added a
  market-average price to `seed.ts` so its "$1,900 Below Market" badge is
  backed by an actual number instead of just copied text.
- **Account desktop**: profile header, garage fleet (listed + stored
  vehicles), escrow/inquiries, buying-power vault, KYC documents, and
  market-alert preferences. No mobile Account design has been received
  yet, so mobile still shows the placeholder.
- New shared `DesktopHeader` (top nav, used by both pages) and
  `DesktopFooter` (site footer, first one received) components.

A "Saved Vehicles & Alerts" desktop mockup was also sent but cut off
almost immediately — essentially no usable content arrived, so that page
is not built yet.

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
