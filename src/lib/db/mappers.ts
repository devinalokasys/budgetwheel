// Converts normalized domain records (VehicleListing + friends) into the
// exact display-shaped props the existing presentational components
// already expect (Listing, BrowseListing — see src/data/listings.ts).
// Keeps those components untouched while the underlying data becomes real.

import { db } from './index'
import type { VehicleListing } from './schema'
import type { BrowseListing, Listing } from '../../data/listings'

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatMileageFull(mi: number): string {
  return `${mi.toLocaleString('en-US')} mi`
}

function formatMileageAbbrev(mi: number): string {
  return `${(mi / 1000).toFixed(1)}k`
}

interface DealBadge {
  label: string
  icon: string
  priceDeltaLabel: string | null
  tone: 'great' | 'good' | 'fair'
}

function computeDealBadge(l: VehicleListing): DealBadge {
  if (l.marketAvgCents == null) {
    return { label: 'Verified Listing', icon: 'verified', priceDeltaLabel: null, tone: 'good' }
  }
  const delta = l.marketAvgCents - l.priceCents
  if (delta > 0) {
    const deltaK = (delta / 100_000).toFixed(1)
    return {
      label: 'Great Deal',
      icon: 'trending_down',
      priceDeltaLabel: `-$${deltaK}K`,
      tone: 'great',
    }
  }
  if (delta === 0) {
    return { label: 'Fair Price', icon: 'balance', priceDeltaLabel: null, tone: 'fair' }
  }
  return { label: 'High Price', icon: 'trending_up', priceDeltaLabel: null, tone: 'fair' }
}

async function historyPillFor(l: VehicleListing): Promise<{ label: string; icon: string }> {
  const carfax = await db.getCarfaxReportByVin(l.vin)
  if (!carfax) return { label: 'Carfax Pending', icon: 'hourglass_top' }
  const parts: string[] = []
  if (carfax.titleStatus === 'clean') parts.push('Clean Title')
  else parts.push(`${carfax.titleStatus[0].toUpperCase()}${carfax.titleStatus.slice(1)} Title`)
  if (carfax.accidentCount === 0) parts.push('0 Accidents')
  else if (carfax.ownerCount === 1) parts.push('1-Owner')
  return {
    label: parts.slice(0, 2).join(' • '),
    icon: carfax.accidentCount === 0 && carfax.titleStatus === 'clean' ? 'shield' : 'report_problem',
  }
}

async function primaryImageUrl(listingId: string): Promise<string> {
  const images = await db.listImages('listing', listingId)
  if (images.length === 0) return '/images/logo-brand.jpg'
  return db.getImageUrl(images[0])
}

async function sellerLabel(l: VehicleListing): Promise<{ name: string; verified: string }> {
  if (l.sellerType === 'private') {
    return { name: 'Private Seller', verified: 'ID Verified' }
  }
  const dealer = await db.getDealerProfile(l.sellerId)
  return { name: dealer?.businessName ?? 'Verified Dealer', verified: 'Verified Dealer' }
}

export async function toFeaturedListingView(l: VehicleListing): Promise<Listing> {
  const [image, historyPill, seller, carfax] = await Promise.all([
    primaryImageUrl(l.id),
    historyPillFor(l),
    sellerLabel(l),
    db.getCarfaxReportByVin(l.vin),
  ])
  const badge = computeDealBadge(l)
  const toneMap = { great: 'secondary', good: 'primary', fair: 'tertiary' } as const
  return {
    id: l.id,
    title: `${l.year} ${l.make} ${l.model}`,
    subtitle: [l.trim, l.engine].filter(Boolean).join(' • '),
    image,
    location: `${l.location.city}, ${l.location.state} • ${seller.name}`,
    dealBadge: {
      label: badge.priceDeltaLabel ? `${badge.label.toUpperCase()} ${badge.priceDeltaLabel}` : badge.label.toUpperCase(),
      icon: badge.icon,
      tone: toneMap[badge.tone],
    },
    historyPill,
    price: formatUsd(l.priceCents),
    priceNote: l.monthlyEstimateCents
      ? `Est. ${formatUsd(l.monthlyEstimateCents)}/mo • 72 mo`
      : '',
    // Matches the existing FeaturedDealCard rendering, which puts mileage
    // (not a monthly figure, despite the field name) in this slot.
    monthlyEstimate: formatMileageFull(l.mileage),
    seller: seller.name,
    verified: carfax?.titleStatus === 'clean' ? 'Clean Title' : undefined,
    distance: `${l.location.city}, ${l.location.state}`,
    specs: [
      { label: 'MILEAGE', value: formatMileageFull(l.mileage) },
      { label: 'CARFAX', value: historyPill.label.split(' • ')[0] },
    ],
  }
}

export async function toBrowseListingView(l: VehicleListing): Promise<BrowseListing> {
  const [image, historyPill, seller] = await Promise.all([
    primaryImageUrl(l.id),
    historyPillFor(l),
    sellerLabel(l),
  ])
  const badge = computeDealBadge(l)
  const toneMap = { great: 'secondary', good: 'secondary', fair: 'tertiary' } as const
  const priceNote =
    badge.tone === 'great' && badge.priceDeltaLabel
      ? `$${(((l.marketAvgCents ?? l.priceCents) - l.priceCents) / 100).toLocaleString('en-US')} below avg`
      : badge.tone === 'fair'
        ? 'Priced at market'
        : ''

  return {
    id: l.id,
    title: `${l.year} ${l.make} ${l.model}${l.trim ? ` ${l.trim}` : ''}`,
    seller: seller.name,
    verifiedLabel: seller.verified,
    image,
    dealBadge: { label: badge.label, icon: badge.icon, tone: toneMap[badge.tone] },
    historyPill,
    distance: `${l.location.city}, ${l.location.state}`,
    price: formatUsd(l.priceCents),
    priceNote,
    monthlyEstimate: l.monthlyEstimateCents
      ? `Est. ${formatUsd(l.monthlyEstimateCents)}/mo (72 mos, $3k down)`
      : '',
    specs: [
      { label: 'Mileage', value: formatMileageAbbrev(l.mileage) },
      { label: 'Drivetrain', value: l.drivetrain ?? '—' },
      { label: '0-60 mph', value: l.zeroToSixtySec ? `${l.zeroToSixtySec}s` : '—' },
      { label: 'Engine', value: l.engine ?? '—' },
    ],
  }
}
