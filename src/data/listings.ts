// Display-shaped view types for FeaturedDealCard/BrowseListingCard. The
// actual data now comes from src/lib/db (see docs/db-design.md) via the
// mappers in src/lib/db/mappers.ts, which convert normalized listing
// records into exactly these shapes — these interfaces are the contract
// between that data layer and the presentational components, not mock data
// anymore.

export interface Listing {
  id: string
  title: string
  subtitle: string
  image: string
  location: string
  dealBadge: { label: string; icon: string; tone: 'secondary' | 'primary' | 'tertiary' }
  historyPill: { label: string; icon: string }
  price: string
  priceNote: string
  monthlyEstimate: string
  seller: string
  rating?: string
  verified?: string
  distance: string
  specs: { label: string; value: string }[]
}

export interface BrowseListing {
  id: string
  title: string
  seller: string
  rating?: string
  verifiedLabel: string
  image: string
  dealBadge: { label: string; icon: string; tone: 'secondary' | 'tertiary' }
  historyPill: { label: string; icon: string }
  distance: string
  price: string
  priceNote: string
  monthlyEstimate: string
  specs: { label: string; value: string }[]
}
