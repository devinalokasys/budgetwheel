import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CarfaxReport, DealerProfile, VehicleImage, VehicleListing } from './schema'

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    getCarfaxReportByVin: vi.fn(),
    listImages: vi.fn(),
    getImageUrl: vi.fn(),
    getDealerProfile: vi.fn(),
  },
}))

vi.mock('./index', () => ({ db: dbMock }))

const {
  primaryImageUrl,
  toFeaturedListingView,
  toListingDetailView,
  toBrowseListingView,
  toShowcaseListingView,
} = await import('./mappers')

function baseListing(overrides: Partial<VehicleListing> = {}): VehicleListing {
  return {
    id: 'listing-1',
    sellerId: 'seller-1',
    sellerType: 'private',
    status: 'active',
    vin: 'VIN123456789',
    year: 2022,
    make: 'BMW',
    model: '330i',
    trim: 'xDrive',
    bodyType: 'sedan',
    mileage: 28100,
    priceCents: 3380000,
    marketAvgCents: 3525000,
    monthlyEstimateCents: 54000,
    condition: 'excellent',
    exteriorColor: 'Black',
    transmission: 'Automatic',
    drivetrain: 'AWD',
    engine: 'Turbo I4',
    zeroToSixtySec: 5.5,
    description: 'Great car',
    location: { city: 'San Jose', state: 'CA', zip: '95112', lat: null, lng: null },
    carfaxReportId: null,
    primaryImageId: null,
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    listedAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    soldAt: null,
    ...overrides,
  }
}

function carfax(overrides: Partial<CarfaxReport> = {}): CarfaxReport {
  return {
    id: 'cf-1',
    vin: 'VIN123456789',
    ownerCount: 2,
    accidentCount: 0,
    titleStatus: 'clean',
    serviceRecordCount: 3,
    lastServiceDate: 1_690_000_000_000,
    externalReportUrl: 'https://example.com/report',
    fetchedAt: 1_690_000_000_000,
    ...overrides,
  }
}

function dealerProfile(overrides: Partial<DealerProfile> = {}): DealerProfile {
  return {
    userId: 'dealer-1',
    businessName: 'Apex Motors',
    licenseNumber: 'LIC1',
    certifiedPartnerId: null,
    tier: 'standard',
    verified: true,
    rating: 4.8,
    address: { street: '1 Main St', city: 'San Jose', state: 'CA', zip: '95112' },
    logoImageId: null,
    ...overrides,
  }
}

function image(overrides: Partial<VehicleImage> = {}): VehicleImage {
  return {
    id: 'img-1',
    ownerType: 'listing',
    ownerId: 'listing-1',
    order: 0,
    width: null,
    height: null,
    storageKind: 'static',
    staticPath: '/images/bmw.jpg',
    blobKey: null,
    remoteUrl: null,
    remotePath: null,
    ...overrides,
  }
}

beforeEach(() => {
  dbMock.getCarfaxReportByVin.mockReset().mockResolvedValue(null)
  dbMock.listImages.mockReset().mockResolvedValue([])
  dbMock.getImageUrl.mockReset().mockResolvedValue('/images/resolved.jpg')
  dbMock.getDealerProfile.mockReset().mockResolvedValue(null)
})

describe('primaryImageUrl', () => {
  it('returns the default brand logo when a listing has no images', async () => {
    dbMock.listImages.mockResolvedValue([])
    const url = await primaryImageUrl('listing-1')
    expect(url).toBe('/images/logo-brand.jpg')
    expect(dbMock.getImageUrl).not.toHaveBeenCalled()
  })

  it('resolves the URL of the first image when images exist', async () => {
    const img = image()
    dbMock.listImages.mockResolvedValue([img])
    dbMock.getImageUrl.mockResolvedValue('/images/resolved.jpg')
    const url = await primaryImageUrl('listing-1')
    expect(dbMock.getImageUrl).toHaveBeenCalledExactlyOnceWith(img)
    expect(url).toBe('/images/resolved.jpg')
  })
})

describe('toFeaturedListingView', () => {
  it('renders a great-deal listing with trim/engine subtitle, monthly estimate, and clean-title verified badge', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'clean', accidentCount: 0 }))
    const listing = baseListing({ trim: 'xDrive', engine: 'Turbo I4', priceCents: 3380000, marketAvgCents: 3525000 })

    const view = await toFeaturedListingView(listing)

    expect(view.title).toBe('2022 BMW 330i')
    expect(view.subtitle).toBe('xDrive • Turbo I4')
    expect(view.location).toBe('San Jose, CA • Private Seller')
    expect(view.dealBadge.label).toBe('GREAT DEAL -$1.4K')
    expect(view.dealBadge.tone).toBe('secondary')
    expect(view.price).toBe('$33,800')
    expect(view.priceNote).toBe('Est. $540/mo • 72 mo')
    expect(view.monthlyEstimate).toBe('28,100 mi')
    expect(view.seller).toBe('Private Seller')
    expect(view.verified).toBe('Clean Title')
    expect(view.distance).toBe('San Jose, CA')
    expect(view.specs).toEqual([
      { label: 'MILEAGE', value: '28,100 mi' },
      { label: 'CARFAX', value: 'Clean Title', icon: 'shield' },
    ])
  })

  it('omits trim/engine from subtitle when both are null, and omits priceNote when no monthly estimate', async () => {
    const listing = baseListing({ trim: null, engine: null, monthlyEstimateCents: null })
    const view = await toFeaturedListingView(listing)
    expect(view.subtitle).toBe('')
    expect(view.priceNote).toBe('')
  })

  it('shows undefined verified when carfax title status is not clean', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'salvage' }))
    const view = await toFeaturedListingView(baseListing())
    expect(view.verified).toBeUndefined()
  })

  it('shows undefined verified when there is no carfax report at all', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(null)
    const view = await toFeaturedListingView(baseListing())
    expect(view.verified).toBeUndefined()
  })

  it('renders a fair-price listing (market avg equal to price) with no price delta label', async () => {
    const listing = baseListing({ priceCents: 3380000, marketAvgCents: 3380000 })
    const view = await toFeaturedListingView(listing)
    expect(view.dealBadge).toEqual({ label: 'FAIR PRICE', icon: 'balance', tone: 'tertiary' })
  })

  it('renders a high-price listing (priced above market) with no price delta label', async () => {
    const listing = baseListing({ priceCents: 3380000, marketAvgCents: 3000000 })
    const view = await toFeaturedListingView(listing)
    expect(view.dealBadge).toEqual({ label: 'HIGH PRICE', icon: 'trending_up', tone: 'tertiary' })
  })

  it('renders a verified-listing badge when market average is unknown', async () => {
    const listing = baseListing({ marketAvgCents: null })
    const view = await toFeaturedListingView(listing)
    expect(view.dealBadge).toEqual({ label: 'VERIFIED LISTING', icon: 'verified', tone: 'primary' })
  })

  it('labels a dealer listing with the dealer business name and verified status', async () => {
    dbMock.getDealerProfile.mockResolvedValue(dealerProfile({ businessName: 'Apex Motors', verified: true }))
    const listing = baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' })
    const view = await toFeaturedListingView(listing)
    expect(view.seller).toBe('Apex Motors')
    expect(view.location).toBe('San Jose, CA • Apex Motors')
  })

  it('labels an unverified dealer as "Dealer" with no profile on record', async () => {
    dbMock.getDealerProfile.mockResolvedValue(null)
    const listing = baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' })
    const view = await toFeaturedListingView(listing)
    expect(view.seller).toBe('Dealer')
  })

  it('shows Carfax Pending when there is no carfax report, with hourglass icon', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(null)
    const view = await toFeaturedListingView(baseListing())
    expect(view.historyPill).toEqual({ label: 'Carfax Pending', icon: 'hourglass_top' })
    expect(view.specs[1]).toEqual({ label: 'CARFAX', value: 'Carfax Pending', icon: 'hourglass_top' })
  })

  it('shows a non-clean title status capitalized, with 1-Owner when there is exactly one owner and no accidents', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(
      carfax({ titleStatus: 'salvage', accidentCount: 1, ownerCount: 1 }),
    )
    const view = await toFeaturedListingView(baseListing())
    expect(view.historyPill).toEqual({ label: 'Salvage Title • 1-Owner', icon: 'report_problem' })
  })

  it('shows only the title status when there are accidents and more than one owner', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ accidentCount: 2, ownerCount: 3, titleStatus: 'clean' }))
    const view = await toFeaturedListingView(baseListing())
    expect(view.historyPill).toEqual({ label: 'Clean Title', icon: 'report_problem' })
  })

  it('shows shield icon only when both clean title and zero accidents are true', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'clean', accidentCount: 0 }))
    const clean = await toFeaturedListingView(baseListing())
    expect(clean.historyPill.icon).toBe('shield')

    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'clean', accidentCount: 1, ownerCount: 1 }))
    const cleanButAccident = await toFeaturedListingView(baseListing())
    expect(cleanButAccident.historyPill.icon).toBe('report_problem')

    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'salvage', accidentCount: 0 }))
    const zeroAccidentsNotClean = await toFeaturedListingView(baseListing())
    expect(zeroAccidentsNotClean.historyPill.icon).toBe('report_problem')
  })

  it('falls back to the default brand image when the listing has no photos', async () => {
    dbMock.listImages.mockResolvedValue([])
    const view = await toFeaturedListingView(baseListing())
    expect(view.image).toBe('/images/logo-brand.jpg')
  })
})

describe('toListingDetailView', () => {
  it('renders full detail for a private-seller listing with a trim, using compound title/subtitle', async () => {
    dbMock.listImages.mockResolvedValue([image({ id: 'img-a' }), image({ id: 'img-b' })])
    dbMock.getImageUrl.mockImplementation(async (img: VehicleImage) => `/resolved/${img.id}.jpg`)
    dbMock.getCarfaxReportByVin.mockResolvedValue(
      carfax({ titleStatus: 'clean', lastServiceDate: 1_690_000_000_000 }),
    )
    const listing = baseListing({ trim: 'xDrive', condition: 'excellent', exteriorColor: 'Black' })

    const view = await toListingDetailView(listing)

    expect(view.id).toBe('listing-1')
    expect(view.vin).toBe('VIN123456789')
    expect(view.sellerId).toBe('seller-1')
    expect(view.title).toBe('2022 BMW 330i xDrive')
    expect(view.subtitle).toBe('Excellent • Black')
    expect(view.images).toEqual(['/resolved/img-a.jpg', '/resolved/img-b.jpg'])
    expect(view.location).toBe('San Jose, CA 95112')
    expect(view.dealBadge.label).toBe('Great Deal -$1.4K')
    expect(view.dealBadge.tone).toBe('secondary')
    expect(view.price).toBe('$33,800')
    expect(view.priceNote).toBe('Market avg $35,250')
    expect(view.monthlyEstimate).toBe('Est. $540/mo • 72 mo term')
    expect(view.seller).toEqual({
      name: 'Private Seller',
      type: 'private',
      verifiedLabel: 'ID Verified',
      rating: null,
      address: null,
    })
    expect(view.carfax).toEqual({
      status: 'available',
      titleStatus: 'Clean',
      ownerCount: 2,
      accidentCount: 0,
      serviceRecordCount: 3,
      lastServiceDate: 'Jul 2023',
      reportUrl: 'https://example.com/report',
    })
  })

  it('omits the trim suffix from title when trim is null', async () => {
    const view = await toListingDetailView(baseListing({ trim: null }))
    expect(view.title).toBe('2022 BMW 330i')
  })

  it('omits exteriorColor from subtitle when it is null, leaving only capitalized condition', async () => {
    const view = await toListingDetailView(baseListing({ exteriorColor: null }))
    expect(view.subtitle).toBe('Excellent')
  })

  it('falls back to the brand logo image when the listing has no photos', async () => {
    dbMock.listImages.mockResolvedValue([])
    const view = await toListingDetailView(baseListing())
    expect(view.images).toEqual(['/images/logo-brand.jpg'])
  })

  it('omits priceNote when market average is unknown', async () => {
    const view = await toListingDetailView(baseListing({ marketAvgCents: null }))
    expect(view.priceNote).toBe('')
  })

  it('omits monthlyEstimate when there is no monthly estimate figure', async () => {
    const view = await toListingDetailView(baseListing({ monthlyEstimateCents: null }))
    expect(view.monthlyEstimate).toBe('')
  })

  it('renders every spec fallback as an em dash when the optional fields are null', async () => {
    const view = await toListingDetailView(
      baseListing({
        transmission: null,
        drivetrain: null,
        engine: null,
        zeroToSixtySec: null,
        exteriorColor: null,
      }),
    )
    expect(view.specs).toEqual([
      { label: 'Mileage', value: '28,100 mi', icon: 'speed' },
      { label: 'Body Type', value: 'SEDAN', icon: 'directions_car' },
      { label: 'Transmission', value: '—', icon: 'settings' },
      { label: 'Drivetrain', value: '—', icon: 'route' },
      { label: 'Engine', value: '—', icon: 'bolt' },
      { label: '0-60 mph', value: '—', icon: 'timer' },
      { label: 'Exterior', value: '—', icon: 'palette' },
      { label: 'VIN', value: 'VIN123456789', icon: 'tag' },
    ])
  })

  it('renders the zero-to-sixty spec with seconds suffix when present', async () => {
    const view = await toListingDetailView(baseListing({ zeroToSixtySec: 4.9 }))
    expect(view.specs.find((s) => s.label === '0-60 mph')?.value).toBe('4.9s')
  })

  it('fetches and includes a dealer profile (rating + address) for a dealer-type listing', async () => {
    dbMock.getDealerProfile.mockResolvedValue(
      dealerProfile({ businessName: 'Apex Motors', verified: true, rating: 4.9 }),
    )
    const listing = baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' })

    const view = await toListingDetailView(listing)

    expect(view.seller).toEqual({
      name: 'Apex Motors',
      type: 'dealer',
      verifiedLabel: 'Verified Dealer',
      rating: 4.9,
      address: 'San Jose, CA',
    })
  })

  it('never fetches a dealer profile for a private-seller listing', async () => {
    await toListingDetailView(baseListing({ sellerType: 'private' }))
    expect(dbMock.getDealerProfile).not.toHaveBeenCalled()
  })

  it('shows an unverified label and null rating/address for a dealer with no profile on record', async () => {
    dbMock.getDealerProfile.mockResolvedValue(null)
    const view = await toListingDetailView(baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' }))
    expect(view.seller.verifiedLabel).toBe('Unverified Dealer')
    expect(view.seller.rating).toBeNull()
    expect(view.seller.address).toBeNull()
  })

  it('maps every titleStatus to its display label', async () => {
    const statuses: [CarfaxReport['titleStatus'], string][] = [
      ['clean', 'Clean'],
      ['salvage', 'Salvage'],
      ['rebuilt', 'Rebuilt'],
      ['lemon', 'Lemon'],
      ['flood', 'Flood'],
    ]
    for (const [titleStatus, expected] of statuses) {
      dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus }))
      const view = await toListingDetailView(baseListing())
      expect(view.carfax).toMatchObject({ titleStatus: expected })
    }
  })

  it('reports carfax status pending when no report exists yet', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(null)
    const view = await toListingDetailView(baseListing())
    expect(view.carfax).toEqual({ status: 'pending' })
  })

  it('reports a null lastServiceDate as null rather than a formatted string', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ lastServiceDate: null }))
    const view = await toListingDetailView(baseListing())
    expect(view.carfax).toMatchObject({ lastServiceDate: null })
  })
})

describe('toBrowseListingView', () => {
  it('shows a below-avg dollar note and secondary tone for a great deal', async () => {
    const listing = baseListing({ trim: 'xDrive', priceCents: 3380000, marketAvgCents: 3525000 })
    const view = await toBrowseListingView(listing)
    expect(view.title).toBe('2022 BMW 330i xDrive')
    expect(view.seller).toBe('Private Seller')
    expect(view.verifiedLabel).toBe('ID Verified')
    expect(view.dealBadge).toEqual({ label: 'Great Deal', icon: 'trending_down', tone: 'secondary' })
    expect(view.priceNote).toBe('$1,450 below avg')
    expect(view.distance).toBe('San Jose, CA')
    expect(view.price).toBe('$33,800')
    expect(view.monthlyEstimate).toBe('Est. $540/mo (72 mos, $3k down)')
    expect(view.specs).toEqual([
      { label: 'Mileage', value: '28.1k' },
      { label: 'Drivetrain', value: 'AWD' },
      { label: '0-60 mph', value: '5.5s' },
      { label: 'Engine', value: 'Turbo I4' },
    ])
  })

  it('omits the trim suffix from title when trim is null', async () => {
    const view = await toBrowseListingView(baseListing({ trim: null }))
    expect(view.title).toBe('2022 BMW 330i')
  })

  it('shows "Priced at market" for a fair-price listing, with secondary badge tone', async () => {
    const view = await toBrowseListingView(baseListing({ priceCents: 3380000, marketAvgCents: 3000000 }))
    expect(view.priceNote).toBe('Priced at market')
    expect(view.dealBadge.tone).toBe('tertiary')
  })

  it('shows an empty priceNote for a verified-listing (no market average) badge', async () => {
    const view = await toBrowseListingView(baseListing({ marketAvgCents: null }))
    expect(view.priceNote).toBe('')
    expect(view.dealBadge).toEqual({ label: 'Verified Listing', icon: 'verified', tone: 'secondary' })
  })

  it('omits monthlyEstimate when there is no monthly estimate figure', async () => {
    const view = await toBrowseListingView(baseListing({ monthlyEstimateCents: null }))
    expect(view.monthlyEstimate).toBe('')
  })

  it('falls back to em dashes for missing drivetrain/0-60 spec fields', async () => {
    const view = await toBrowseListingView(baseListing({ drivetrain: null, zeroToSixtySec: null, engine: null }))
    expect(view.specs).toEqual([
      { label: 'Mileage', value: '28.1k' },
      { label: 'Drivetrain', value: '—' },
      { label: '0-60 mph', value: '—' },
      { label: 'Engine', value: '—' },
    ])
  })

  it('labels a verified dealer seller by business name', async () => {
    dbMock.getDealerProfile.mockResolvedValue(dealerProfile({ businessName: 'Apex Motors', verified: true }))
    const view = await toBrowseListingView(baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' }))
    expect(view.seller).toBe('Apex Motors')
    expect(view.verifiedLabel).toBe('Verified Dealer')
  })
})

describe('toShowcaseListingView', () => {
  it('renders a below-market private-party card with a secondary bottom pill for a clean/shielded history', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'clean', accidentCount: 0 }))
    const listing = baseListing({ trim: 'xDrive', engine: 'Turbo I4', priceCents: 3380000, marketAvgCents: 3525000 })

    const view = await toShowcaseListingView(listing)

    expect(view.id).toBe('listing-1')
    expect(view.dealPill).toEqual({ icon: 'trending_down', label: '-$1.4K Below Market' })
    expect(view.bottomPill).toEqual({ icon: 'shield', label: 'Clean Title • 0 Accidents', tone: 'secondary' })
    expect(view.location).toBe('San Jose, CA')
    expect(view.sellerType).toBe('Private Seller')
    expect(view.sellerTone).toBe('secondary')
    expect(view.title).toBe('2022 BMW 330i')
    expect(view.subtitle).toBe('xDrive • Turbo I4')
    expect(view.specs).toEqual([
      { label: 'Odometer', value: '28,100 mi' },
      { label: 'Drivetrain', value: 'AWD' },
    ])
    expect(view.price).toBe('$33,800')
    expect(view.priceNote).toBe('Priced below market')
    expect(view.monthlyEstimate).toBe('Est. $540/mo')
    expect(view.term).toBe('72 mo term')
  })

  it('uses the deal-badge label (not a price delta) when there is no price delta to show', async () => {
    const view = await toShowcaseListingView(baseListing({ marketAvgCents: null }))
    expect(view.dealPill).toEqual({ icon: 'verified', label: 'Verified Listing' })
  })

  it('shows on-surface tone for the bottom pill when the history icon is not the shield icon', async () => {
    dbMock.getCarfaxReportByVin.mockResolvedValue(carfax({ titleStatus: 'salvage', accidentCount: 1, ownerCount: 3 }))
    const view = await toShowcaseListingView(baseListing())
    expect(view.bottomPill.tone).toBe('on-surface')
  })

  it('labels the seller with the dealer business name and primary tone for a dealer listing', async () => {
    dbMock.getDealerProfile.mockResolvedValue(dealerProfile({ businessName: 'Apex Motors' }))
    const view = await toShowcaseListingView(baseListing({ sellerType: 'dealer', sellerId: 'dealer-1' }))
    expect(view.sellerType).toBe('Apex Motors')
    expect(view.sellerTone).toBe('primary')
  })

  it('omits trim/engine from subtitle when both are null', async () => {
    const view = await toShowcaseListingView(baseListing({ trim: null, engine: null }))
    expect(view.subtitle).toBe('')
  })

  it('shows an empty priceNote when market average exactly equals price (not strictly above it)', async () => {
    const view = await toShowcaseListingView(baseListing({ priceCents: 3380000, marketAvgCents: 3380000 }))
    expect(view.priceNote).toBe('')
  })

  it('shows an empty priceNote when priced above market average', async () => {
    const view = await toShowcaseListingView(baseListing({ priceCents: 3380000, marketAvgCents: 3000000 }))
    expect(view.priceNote).toBe('')
  })

  it('omits monthlyEstimate when there is no monthly estimate figure', async () => {
    const view = await toShowcaseListingView(baseListing({ monthlyEstimateCents: null }))
    expect(view.monthlyEstimate).toBe('')
  })

  it('falls back to an em dash for a missing drivetrain spec', async () => {
    const view = await toShowcaseListingView(baseListing({ drivetrain: null }))
    expect(view.specs).toEqual([
      { label: 'Odometer', value: '28,100 mi' },
      { label: 'Drivetrain', value: '—' },
    ])
  })
})
