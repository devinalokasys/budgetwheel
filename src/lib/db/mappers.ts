// Converts normalized domain records (VehicleListing + friends) into the
// exact display-shaped props the existing presentational components
// already expect (Listing, BrowseListing — see src/data/listings.ts).
// Keeps those components untouched while the underlying data becomes real.

import { db } from './index'
import type { CarfaxReport, VehicleListing } from './schema'
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
  // Reflects the actual DealerProfile.verified flag rather than assuming
  // every dealer-type seller is verified — a dealer whose license hasn't
  // been checked yet (verified: false, the default for a new dealer
  // account) shows as unverified, not "Verified Dealer".
  return {
    name: dealer?.businessName ?? 'Dealer',
    verified: dealer?.verified ? 'Verified Dealer' : 'Unverified Dealer',
  }
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
      { label: 'CARFAX', value: historyPill.label.split(' • ')[0], icon: historyPill.icon },
    ],
  }
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const titleStatusLabel: Record<CarfaxReport['titleStatus'], string> = {
  clean: 'Clean',
  salvage: 'Salvage',
  rebuilt: 'Rebuilt',
  lemon: 'Lemon',
  flood: 'Flood',
}

export interface ListingDetailView {
  id: string
  vin: string
  sellerId: string
  title: string
  subtitle: string
  description: string
  images: string[]
  location: string
  dealBadge: { label: string; icon: string; tone: 'secondary' | 'primary' | 'tertiary' }
  price: string
  priceNote: string
  monthlyEstimate: string
  specs: { label: string; value: string; icon: string }[]
  seller: {
    name: string
    type: 'private' | 'dealer'
    verifiedLabel: string
    rating: number | null
    address: string | null
  }
  carfax:
    | {
        status: 'available'
        titleStatus: string
        ownerCount: number
        accidentCount: number
        serviceRecordCount: number
        lastServiceDate: string | null
        reportUrl: string | null
      }
    | { status: 'pending' }
}

export async function toListingDetailView(l: VehicleListing): Promise<ListingDetailView> {
  const [images, seller, carfax, dealerProfile] = await Promise.all([
    db.listImages('listing', l.id).then((imgs) => Promise.all(imgs.map((img) => db.getImageUrl(img)))),
    sellerLabel(l),
    db.getCarfaxReportByVin(l.vin),
    l.sellerType === 'dealer' ? db.getDealerProfile(l.sellerId) : Promise.resolve(null),
  ])
  const badge = computeDealBadge(l)
  const toneMap = { great: 'secondary', good: 'primary', fair: 'tertiary' } as const

  return {
    id: l.id,
    vin: l.vin,
    sellerId: l.sellerId,
    title: `${l.year} ${l.make} ${l.model}${l.trim ? ` ${l.trim}` : ''}`,
    subtitle: [l.condition[0].toUpperCase() + l.condition.slice(1), l.exteriorColor].filter(Boolean).join(' • '),
    description: l.description,
    images: images.length > 0 ? images : ['/images/logo-brand.jpg'],
    location: `${l.location.city}, ${l.location.state} ${l.location.zip}`,
    dealBadge: {
      label: badge.priceDeltaLabel ? `${badge.label} ${badge.priceDeltaLabel}` : badge.label,
      icon: badge.icon,
      tone: toneMap[badge.tone],
    },
    price: formatUsd(l.priceCents),
    priceNote: l.marketAvgCents != null ? `Market avg ${formatUsd(l.marketAvgCents)}` : '',
    monthlyEstimate: l.monthlyEstimateCents
      ? `Est. ${formatUsd(l.monthlyEstimateCents)}/mo • 72 mo term`
      : '',
    specs: [
      { label: 'Mileage', value: formatMileageFull(l.mileage), icon: 'speed' },
      { label: 'Body Type', value: l.bodyType.toUpperCase(), icon: 'directions_car' },
      { label: 'Transmission', value: l.transmission ?? '—', icon: 'settings' },
      { label: 'Drivetrain', value: l.drivetrain ?? '—', icon: 'route' },
      { label: 'Engine', value: l.engine ?? '—', icon: 'bolt' },
      { label: '0-60 mph', value: l.zeroToSixtySec ? `${l.zeroToSixtySec}s` : '—', icon: 'timer' },
      { label: 'Exterior', value: l.exteriorColor ?? '—', icon: 'palette' },
      { label: 'VIN', value: l.vin, icon: 'tag' },
    ],
    seller: {
      name: seller.name,
      type: l.sellerType,
      verifiedLabel: seller.verified,
      rating: dealerProfile?.rating ?? null,
      address: dealerProfile
        ? `${dealerProfile.address.city}, ${dealerProfile.address.state}`
        : null,
    },
    carfax: carfax
      ? {
          status: 'available',
          titleStatus: titleStatusLabel[carfax.titleStatus],
          ownerCount: carfax.ownerCount,
          accidentCount: carfax.accidentCount,
          serviceRecordCount: carfax.serviceRecordCount,
          lastServiceDate: carfax.lastServiceDate ? formatDate(carfax.lastServiceDate) : null,
          reportUrl: carfax.externalReportUrl,
        }
      : { status: 'pending' },
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

export interface ShowcaseListingView {
  id: string
  image: string
  dealPill: { icon: string; label: string }
  bottomPill: { icon: string; label: string; tone: 'secondary' | 'primary' | 'on-surface' }
  location: string
  sellerType: string
  sellerTone: 'primary' | 'secondary'
  title: string
  subtitle: string
  specs: [{ label: string; value: string }, { label: string; value: string }]
  price: string
  priceNote: string
  monthlyEstimate: string
  term: string
}

export async function toShowcaseListingView(l: VehicleListing): Promise<ShowcaseListingView> {
  const [image, historyPill, seller] = await Promise.all([
    primaryImageUrl(l.id),
    historyPillFor(l),
    sellerLabel(l),
  ])
  const badge = computeDealBadge(l)

  return {
    id: l.id,
    image,
    dealPill: {
      icon: badge.icon,
      label: badge.priceDeltaLabel ? `${badge.priceDeltaLabel} Below Market` : badge.label,
    },
    bottomPill: {
      icon: historyPill.icon,
      label: historyPill.label,
      tone: historyPill.icon === 'shield' ? 'secondary' : 'on-surface',
    },
    location: `${l.location.city}, ${l.location.state}`,
    sellerType: l.sellerType === 'private' ? 'Private Seller' : seller.name,
    sellerTone: l.sellerType === 'private' ? 'secondary' : 'primary',
    title: `${l.year} ${l.make} ${l.model}`,
    subtitle: [l.trim, l.engine].filter(Boolean).join(' • '),
    specs: [
      { label: 'Odometer', value: formatMileageFull(l.mileage) },
      { label: 'Drivetrain', value: l.drivetrain ?? '—' },
    ],
    price: formatUsd(l.priceCents),
    priceNote:
      l.marketAvgCents != null && l.marketAvgCents > l.priceCents ? 'Priced below market' : '',
    monthlyEstimate: l.monthlyEstimateCents ? `Est. ${formatUsd(l.monthlyEstimateCents)}/mo` : '',
    term: '72 mo term',
  }
}
