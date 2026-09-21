# BudgetWheels — Database Design

## Overview

One logical schema, two interchangeable backends behind a single
`DataProvider` interface (`src/lib/db/provider.ts`):

- **Local** (`src/lib/db/localProvider.ts`) — IndexedDB via the `idb`
  library. Runs entirely in the browser, no server, no config. This is the
  default for local dev (`VITE_DATA_PROVIDER=local` or unset).
- **Firestore** (`src/lib/db/firestoreProvider.ts`) — Firebase
  Firestore + Cloud Storage. Used in production
  (`VITE_DATA_PROVIDER=firestore`), once a Firebase project exists for this
  app (none does yet — see "Not yet done" at the bottom).

Every entity below is a plain TypeScript type in `src/lib/db/schema.ts`,
shared by both backends — the app code never imports IndexedDB or Firebase
APIs directly, only `db` from `src/lib/db/index.ts`.

Field types use raw values (`priceCents: number`, `year: number`), not
display strings — the existing UI components (`BrowseListingCard`,
`FeaturedDealCard`, etc.) expect pre-formatted display objects
(`price: '$31,450'`), so `src/lib/db/mappers.ts` converts domain records to
those exact view shapes. This keeps the schema honest (a price is a number
you can sort/filter/sum) without touching any presentational component.

## Entities

### User

One account per person, role-aware rather than split into separate
buyer/seller accounts — matches the product decision that a private user
can both buy and sell. Dealers are a distinct account type (`type:
'dealer'`), matching the separate `/dealer` portal already in the app.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firebase Auth UID in prod; a generated UUID locally |
| `type` | `'consumer' \| 'dealer'` | Determines which profile record applies |
| `email` | `string` | |
| `displayName` | `string` | |
| `photoUrl` | `string \| null` | |
| `phone` | `string \| null` | |
| `createdAt` | `number` (epoch ms) | |

### DealerProfile

One-to-one with a `User` where `type === 'dealer'`. Matches
`DealerConsole`'s header ("Apex Motors", "Certified Partner #8492",
"Premier Tier") and `DealerInventoryCard`/`TradeBidCard`.

| Field | Type | Notes |
|---|---|---|
| `userId` | `string` | FK → `User.id`, also the doc id |
| `businessName` | `string` | |
| `licenseNumber` | `string` | Dealer license, verified at signup |
| `certifiedPartnerId` | `string \| null` | e.g. "#8492" |
| `tier` | `'standard' \| 'premier'` | |
| `verified` | `boolean` | |
| `rating` | `number \| null` | 0–5 |
| `address` | `{ street, city, state, zip }` | |
| `logoImageId` | `string \| null` | FK → `Image.id` |

### VehicleListing

The core entity. One row covers both the consumer marketplace
(`BrowseListingCard`/`FeaturedDealCard`) and dealer floor inventory
(`DealerInventoryCard`) — `sellerType` and `dealerId` distinguish them
rather than duplicating the shape into two tables.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `sellerId` | `string` | FK → `User.id` (private seller) or `DealerProfile.userId` |
| `sellerType` | `'private' \| 'dealer'` | |
| `status` | `'draft' \| 'active' \| 'pending' \| 'sold'` | |
| `vin` | `string` | |
| `year` | `number` | |
| `make` | `string` | |
| `model` | `string` | |
| `trim` | `string \| null` | e.g. "Long Range Dual Motor AWD" |
| `bodyType` | `'sedan' \| 'suv' \| 'truck' \| 'coupe' \| 'hatchback' \| 'ev' \| 'other'` | Powers Home's category tiles |
| `mileage` | `number` | |
| `priceCents` | `number` | Integer cents, never a float dollar amount |
| `marketAvgCents` | `number \| null` | Backs the "Great Deal -$2.4K" / "$1,450 below avg" badges — `priceCents - marketAvgCents` |
| `monthlyEstimateCents` | `number \| null` | Precomputed at write time (loan assumptions are a display concern, not stored per-listing) |
| `condition` | `'excellent' \| 'good' \| 'fair'` | |
| `exteriorColor` | `string \| null` | |
| `transmission` | `string \| null` | e.g. "PDK", "7-Speed S-Tronic" |
| `drivetrain` | `string \| null` | e.g. "AWD", "Quattro AWD" |
| `engine` | `string \| null` | e.g. "3.0L Turbo V6", "Dual Motor" |
| `zeroToSixtySec` | `number \| null` | |
| `description` | `string` | |
| `location` | `{ city, state, zip, lat: number \| null, lng: number \| null }` | `lat`/`lng` enable the map view; null until geocoded |
| `carfaxReportId` | `string \| null` | FK → `CarfaxReport.id` |
| `primaryImageId` | `string \| null` | FK → `Image.id` |
| `viewCount` | `number` | |
| `saveCount` | `number` | Denormalized count; `SavedListing` rows are the source of truth |
| `inquiryCount` | `number` | Denormalized count of `Conversation` rows for this listing |
| `listedAt` | `number` (epoch ms) | Backs "Day 4 Listed" |
| `updatedAt` | `number` | |
| `soldAt` | `number \| null` | |

**Derived, not stored:** the "Great Deal / Fair Price / High Price" badge is
computed from `priceCents` vs `marketAvgCents` at read time (in the
mapper), not persisted — it would go stale the moment either price changes.

### Image

Every listing photo, plus dealer logos. Split from `VehicleListing` because
a listing has many (0–20+) and because local vs. prod storage genuinely
differ (see "Image storage strategy" below).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `ownerType` | `'listing' \| 'dealer-logo' \| 'trade-submission'` | What it's attached to |
| `ownerId` | `string` | FK to the matching entity's id |
| `order` | `number` | Gallery position, 0 = primary |
| `width` | `number \| null` | |
| `height` | `number \| null` | |
| `storageKind` | `'static' \| 'blob' \| 'remote'` | See below |
| `staticPath` | `string \| null` | Set when `storageKind === 'static'` — a `/public/images/*.jpg` path, used for seed/demo data |
| `blobKey` | `string \| null` | Set when `storageKind === 'blob'` (local provider only) — key into the IndexedDB `imageBlobs` store |
| `remoteUrl` | `string \| null` | Set when `storageKind === 'remote'` (Firestore provider only) — a Firebase Storage download URL |
| `remotePath` | `string \| null` | Firebase Storage path, so it can be deleted later |

`storageKind` is what makes one `Image` type work for both backends and for
seed data:
- **Seed/demo listings** (seeded in both local and Firestore mode so the
  app has something to show immediately): `storageKind: 'static'`, points
  at the existing `/public/images/*.jpg` files already in this repo.
- **A photo a user actually uploads** (Sell flow, dealer photo upload):
  local provider stores the raw `Blob` in a dedicated `imageBlobs` object
  store and sets `blobKey`; Firestore provider uploads to Cloud Storage and
  sets `remoteUrl`/`remotePath`.
- `getImageUrl(image)` in `mappers.ts` resolves any of the three to a
  usable `src` string (static path as-is, `URL.createObjectURL(blob)` for
  local blobs — cached so it's not re-created every render, or the remote
  URL directly).

### CarfaxReport

A cached summary of a Carfax vehicle history report, keyed by VIN. This
app does not implement the actual Carfax API integration (that requires a
paid Carfax dealer/API agreement) — this table is the shape that
integration would write into, and is seeded with realistic placeholder
data keyed to the seed listings' VINs so the UI's Carfax badges/pills have
real data to render.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `vin` | `string` | Unique |
| `ownerCount` | `number` | Backs "1-Owner" |
| `accidentCount` | `number` | Backs "0 Accidents" |
| `titleStatus` | `'clean' \| 'salvage' \| 'rebuilt' \| 'lemon' \| 'flood'` | Backs "Clean Title" |
| `serviceRecordCount` | `number` | |
| `lastServiceDate` | `number \| null` (epoch ms) | |
| `externalReportUrl` | `string \| null` | Deep link to the actual Carfax.com report, once real API access exists |
| `fetchedAt` | `number` | When this summary was pulled/cached |

### SavedListing (favorites)

Backs `FavoriteButton` and the "Saved" tab.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `userId` | `string` | FK → `User.id` |
| `listingId` | `string` | FK → `VehicleListing.id` |
| `createdAt` | `number` | |

Unique on `(userId, listingId)` — enforced in code (check-then-write) since
neither IndexedDB nor this Firestore layout has a native compound-unique
constraint short of using `${userId}_${listingId}` as the doc id, which is
in fact what both providers do.

### SavedSearch

For "new listings matching your search" alerts (Home's search form → save
search). Not yet wired to any UI — schema only, see "Not yet done."

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `userId` | `string` | |
| `query` | `{ make?, model?, priceMaxCents?, bodyType?, zip?, radiusMi? }` | |
| `alertsEnabled` | `boolean` | |
| `createdAt` | `number` | |

### Conversation / Message

Backs the "Chat & Leads" tab and dealer console's Lead Live Feed. Schema
only for now — not yet wired to UI (both currently render static/placeholder
content).

**Conversation**

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `listingId` | `string` | |
| `buyerId` | `string` | |
| `sellerId` | `string` | Private seller's `User.id` or dealer's `DealerProfile.userId` |
| `lastMessageAt` | `number` | |
| `lastMessagePreview` | `string` | |
| `unreadCountBuyer` | `number` | |
| `unreadCountSeller` | `number` | |

**Message**

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `conversationId` | `string` | |
| `senderId` | `string` | |
| `body` | `string` | |
| `createdAt` | `number` | |
| `readAt` | `number \| null` | |

### Offer

Covers both a consumer's purchase offer on a listing and a dealer's cash
bid on a trade-in submission — same shape, `kind` distinguishes them, same
reasoning as `VehicleListing.sellerType`. Schema only for now.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `kind` | `'purchase_offer' \| 'trade_bid'` | |
| `listingId` | `string \| null` | Set for `purchase_offer` |
| `tradeSubmissionId` | `string \| null` | Set for `trade_bid` |
| `fromUserId` | `string` | Buyer, or the bidding dealer |
| `toUserId` | `string` | Seller |
| `amountCents` | `number` | |
| `status` | `'pending' \| 'accepted' \| 'declined' \| 'countered'` | |
| `message` | `string \| null` | |
| `createdAt` | `number` | |
| `respondedAt` | `number \| null` | |

### TradeSubmission

The "Sell to a dealer for cash" path — a private seller submits their car
once, multiple dealers can bid on it via `Offer` rows with
`kind: 'trade_bid'`. Backs `TradeBidCard`'s KBB/AI-rec/margin comparison.
Schema only for now.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `sellerId` | `string` | |
| `vin` | `string` | |
| `year` \| `make` \| `model` \| `trim` | see `VehicleListing` | Same shape, duplicated rather than shared since a submission isn't a listing yet |
| `mileage` | `number` | |
| `condition` | `'excellent' \| 'good' \| 'fair'` | |
| `carfaxReportId` | `string \| null` | |
| `imageIds` | `string[]` | |
| `kbbEstimateCents` | `number \| null` | |
| `aiRecommendationCents` | `number \| null` | |
| `status` | `'open' \| 'accepted' \| 'closed'` | |
| `biddingClosesAt` | `number \| null` | Backs "14h remaining" |
| `createdAt` | `number` | |

## Image storage strategy (summary)

| | Local dev | Production |
|---|---|---|
| Seed/demo photos | `storageKind: 'static'`, served from `/public/images/` — same files the current hardcoded mock data already points at | Same — static marketing/seed images ship with the app either way |
| User-uploaded photos | `storageKind: 'blob'` — raw `Blob` in IndexedDB's `imageBlobs` store, displayed via `URL.createObjectURL` | `storageKind: 'remote'` — uploaded to Firebase Storage at `listings/{listingId}/{imageId}`, `remoteUrl` is the download URL |
| Why not just base64 in Firestore/IndexedDB records | Firestore documents cap at 1MB and base64 bloats size ~33%; IndexedDB *can* hold large blobs fine, but keeping the same `Image` shape (a reference, not inline bytes) for both backends means `mappers.ts` doesn't need backend-specific branches beyond `getImageUrl` |

## Provider switch

`src/lib/db/index.ts`:

```ts
const kind = import.meta.env.VITE_DATA_PROVIDER === 'firestore' ? 'firestore' : 'local'
export const db: DataProvider = kind === 'firestore' ? firestoreProvider : localProvider
```

Default is `local` — an unset `VITE_DATA_PROVIDER` (the common case today,
since no `.env` exists yet) never accidentally tries to reach a
non-existent Firebase project.

## Not yet done (follow-up work, not part of this pass)

- ~~No Firebase project exists for budgetwheel yet~~ — done: `firebase.json`,
  `.firebaserc`, and `firestore.rules` now exist, and `.env.production`
  (gitignored, not tracked) has the real project's config values.
- ~~No Firebase Auth wiring~~ — done (real Google Sign-In, `User.id` is
  the Firebase Auth UID). One real gap this leaves: there's no Auth
  emulator set up for this app (unlike chess-master/mortgage-calculator's
  `VITE_USE_EMULATORS` pattern), and local dev has no `.env.local` with
  real Firebase credentials either — so every route behind
  `ProtectedRoute`/`DealerRoute` is currently untestable against local
  IndexedDB dev data; sign-in only works against the real deployed app.
- ~~Offer, TradeSubmission, Conversation/Message not wired to UI~~ — done.
  `Sell.tsx`/`DealPipeline.tsx`/`ListingDetail.tsx`'s offer form all write
  real `Offer`/`TradeSubmission` records. `Messages.tsx`'s "My Garage" tab
  reads a consumer's own submissions + bids; its "Saved" tab reuses the
  `Saved` page. Its "Chat & Leads" tab now lists real `Conversation`
  rows, opened via `ConversationThread.tsx` (`/messages/:conversationId`)
  — entry point is a "Message" button on `ListingDetail.tsx`'s seller
  card, calling `getOrCreateConversation`. One deliberate gap: no
  "mark as read" — `unreadCount*` fields exist and are displayed, but
  nothing resets them on opening a thread.
- **The one remaining major gap: `DealerConsole.tsx` /
  `DealerConsoleDesktop.tsx`** — dealer's own inventory, stat tiles,
  incoming trade bids are still `data/dealer.ts`/`data/dealerDesktop.ts`
  mock arrays, the last page not reading from `db`. The stat tiles in
  particular (30-day sales volume, lead conversion %) don't have a clean
  aggregation path over the current schema yet — that's real design work,
  not just a wiring pass.
- **Real Carfax API integration** — `CarfaxReport` is seeded with
  placeholder data shaped like a real report; actually calling Carfax's
  API is out of scope (requires a paid dealer/API agreement).
