// Seed data equivalent to the hardcoded mock data this replaces
// (src/data/listings.ts, src/data/dealer.ts) — same cars, same images,
// now shaped as normalized domain records instead of pre-formatted
// display strings. Used by both providers' seedIfEmpty().

import type {
  CarfaxReport,
  DealerProfile,
  TradeSubmission,
  User,
  VehicleImage,
  VehicleListing,
} from './schema'

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

export const seedUsers: User[] = [
  {
    id: 'user-private-1',
    type: 'consumer',
    email: 'marcus.sterling@example.com',
    displayName: 'Marcus Sterling',
    photoUrl: null,
    phone: null,
    createdAt: now - 90 * DAY,
  },
  {
    id: 'user-dealer-1',
    type: 'dealer',
    email: 'listings@apexmotors.example',
    displayName: 'Apex Motors',
    photoUrl: null,
    phone: '408-555-0192',
    createdAt: now - 400 * DAY,
  },
]

export const seedDealerProfiles: DealerProfile[] = [
  {
    userId: 'user-dealer-1',
    businessName: 'Apex Motors',
    licenseNumber: 'CA-DLR-88213',
    certifiedPartnerId: '#8492',
    tier: 'premier',
    verified: true,
    rating: 4.9,
    address: { street: '4820 Stevens Creek Blvd', city: 'San Jose', state: 'CA', zip: '95129' },
    logoImageId: null,
  },
]

interface SeedListingSpec {
  listing: VehicleListing
  images: string[] // static /images/*.jpg paths, first is primary
  carfax: CarfaxReport
}

function listing(partial: Omit<VehicleListing, 'status' | 'viewCount' | 'saveCount' | 'inquiryCount' | 'updatedAt' | 'soldAt' | 'primaryImageId' | 'carfaxReportId'> & { carfaxReportId: string }): VehicleListing {
  return {
    status: 'active',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    updatedAt: now,
    soldAt: null,
    primaryImageId: null,
    ...partial,
  }
}

function carfax(id: string, vin: string, overrides: Partial<CarfaxReport>): CarfaxReport {
  return {
    id,
    vin,
    ownerCount: 1,
    accidentCount: 0,
    titleStatus: 'clean',
    serviceRecordCount: 4,
    lastServiceDate: now - 60 * DAY,
    externalReportUrl: null,
    fetchedAt: now,
    ...overrides,
  }
}

export const seedListingSpecs: SeedListingSpec[] = [
  {
    listing: listing({
      id: 'tesla-model-3',
      sellerId: 'user-private-1',
      sellerType: 'private',
      vin: '5YJ3E1EA0NF483920',
      year: 2022,
      make: 'Tesla',
      model: 'Model 3',
      trim: 'Long Range Dual Motor AWD',
      bodyType: 'ev',
      mileage: 24180,
      priceCents: 3_145_000,
      marketAvgCents: 3_385_000,
      monthlyEstimateCents: 48_200,
      condition: 'excellent',
      exteriorColor: null,
      transmission: 'Single-Speed',
      drivetrain: 'AWD',
      engine: 'Dual Motor',
      zeroToSixtySec: 4.2,
      description: '2022 Tesla Model 3 Long Range Dual Motor AWD, one owner, garage kept.',
      location: { city: 'Austin', state: 'TX', zip: '78701', lat: null, lng: null },
      listedAt: now - 6 * DAY,
      carfaxReportId: 'carfax-tesla-model-3',
    }),
    images: ['/images/tesla-model-3.jpg', '/images/tesla-model-3-table.jpg'],
    carfax: carfax('carfax-tesla-model-3', '5YJ3E1EA0NF483920', { accidentCount: 0, ownerCount: 1 }),
  },
  {
    listing: listing({
      id: 'porsche-macan',
      sellerId: 'user-dealer-1',
      sellerType: 'dealer',
      vin: 'WP1AA2A58MLB12934',
      year: 2021,
      make: 'Porsche',
      model: 'Macan',
      trim: 'S',
      bodyType: 'suv',
      mileage: 31540,
      priceCents: 4_890_000,
      marketAvgCents: null,
      monthlyEstimateCents: 72_000,
      condition: 'excellent',
      exteriorColor: null,
      transmission: 'PDK',
      drivetrain: 'AWD',
      engine: '3.0L Turbo V6',
      zeroToSixtySec: null,
      description: '2021 Porsche Macan S, 3.0L Turbo V6, PDK, dealer certified.',
      location: { city: 'Dallas', state: 'TX', zip: '75201', lat: null, lng: null },
      listedAt: now - 10 * DAY,
      carfaxReportId: 'carfax-porsche-macan',
    }),
    images: ['/images/porsche-macan.jpg'],
    carfax: carfax('carfax-porsche-macan', 'WP1AA2A58MLB12934', { ownerCount: 1 }),
  },
  {
    listing: listing({
      id: 'ford-f150-lightning',
      sellerId: 'user-private-1',
      sellerType: 'private',
      vin: '1FTVW1EV3PWG29104',
      year: 2023,
      make: 'Ford',
      model: 'F-150 Lightning',
      trim: 'XLT Extended Range 4WD',
      bodyType: 'truck',
      mileage: 18220,
      priceCents: 4_280_000,
      marketAvgCents: 4_590_000,
      monthlyEstimateCents: 61_000,
      condition: 'excellent',
      exteriorColor: null,
      transmission: 'Single-Speed',
      drivetrain: '4WD',
      engine: 'Extended Range Dual Motor',
      zeroToSixtySec: 4.0,
      description: '2023 Ford F-150 Lightning XLT, Extended Range battery, 4WD.',
      location: { city: 'Houston', state: 'TX', zip: '77002', lat: null, lng: null },
      listedAt: now - 3 * DAY,
      carfaxReportId: 'carfax-ford-f150-lightning',
    }),
    images: ['/images/ford-f150-lightning.jpg'],
    carfax: carfax('carfax-ford-f150-lightning', '1FTVW1EV3PWG29104', { accidentCount: 0, ownerCount: 1 }),
  },
  {
    listing: listing({
      id: 'bmw-330i',
      sellerId: 'user-dealer-1',
      sellerType: 'dealer',
      vin: 'WBA5R7C09NFH12088',
      year: 2022,
      make: 'BMW',
      model: '330i',
      trim: 'xDrive',
      bodyType: 'sedan',
      mileage: 28100,
      priceCents: 3_380_000,
      marketAvgCents: 3_525_000,
      monthlyEstimateCents: 54_000,
      condition: 'excellent',
      exteriorColor: null,
      transmission: 'Automatic',
      drivetrain: 'AWD',
      engine: '2.0T I4',
      zeroToSixtySec: 5.3,
      description: '2022 BMW 330i xDrive, AWD, clean Carfax, dealer verified.',
      location: { city: 'San Jose', state: 'CA', zip: '95129', lat: null, lng: null },
      listedAt: now - 4 * DAY,
      carfaxReportId: 'carfax-bmw-330i',
    }),
    images: ['/images/bmw-330i.jpg', '/images/bmw-330i-table.jpg'],
    carfax: carfax('carfax-bmw-330i', 'WBA5R7C09NFH12088', { accidentCount: 0, ownerCount: 1 }),
  },
  {
    listing: listing({
      id: 'toyota-rav4-hybrid',
      sellerId: 'user-private-1',
      sellerType: 'private',
      vin: '2T3RWRFV4LW089452',
      year: 2020,
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      trim: 'XSE',
      bodyType: 'suv',
      mileage: 41600,
      priceCents: 2_765_000,
      marketAvgCents: 2_765_000,
      monthlyEstimateCents: 44_500,
      condition: 'good',
      exteriorColor: null,
      transmission: 'eCVT',
      drivetrain: 'eAWD',
      engine: '2.5L Hybrid',
      zeroToSixtySec: 7.8,
      description: '2020 Toyota RAV4 Hybrid XSE, eAWD, single owner.',
      location: { city: 'Austin', state: 'TX', zip: '78702', lat: null, lng: null },
      listedAt: now - 8 * DAY,
      carfaxReportId: 'carfax-toyota-rav4-hybrid',
    }),
    images: ['/images/toyota-rav4-hybrid.jpg'],
    carfax: carfax('carfax-toyota-rav4-hybrid', '2T3RWRFV4LW089452', { ownerCount: 1 }),
  },
  {
    listing: listing({
      id: 'audi-a5',
      sellerId: 'user-dealer-1',
      sellerType: 'dealer',
      vin: 'WAUR8AF44MA091237',
      year: 2021,
      make: 'Audi',
      model: 'A5 Sportback',
      trim: '45',
      bodyType: 'sedan',
      mileage: 33520,
      priceCents: 3_450_000,
      marketAvgCents: null,
      monthlyEstimateCents: null,
      condition: 'excellent',
      exteriorColor: null,
      transmission: '7-Speed S-Tronic',
      drivetrain: 'Quattro AWD',
      engine: '2.0T I4',
      zeroToSixtySec: null,
      description: '2021 Audi A5 Sportback 45, Quattro AWD, dealer floor stock.',
      location: { city: 'San Jose', state: 'CA', zip: '95129', lat: null, lng: null },
      listedAt: now - 7 * DAY,
      carfaxReportId: 'carfax-audi-a5',
    }),
    images: ['/images/audi-a5-sportback.jpg'],
    carfax: carfax('carfax-audi-a5', 'WAUR8AF44MA091237', { ownerCount: 1 }),
  },
]

export function buildSeedImages(): VehicleImage[] {
  const images: VehicleImage[] = []
  for (const spec of seedListingSpecs) {
    spec.images.forEach((path, i) => {
      images.push({
        id: `img-${spec.listing.id}-${i}`,
        ownerType: 'listing',
        ownerId: spec.listing.id,
        order: i,
        width: null,
        height: null,
        storageKind: 'static',
        staticPath: path,
        blobKey: null,
        remoteUrl: null,
        remotePath: null,
      })
    })
  }
  return images
}

// A trade-in submission awaiting dealer bids — backs TradeBidCard's first
// entry ("2021 Toyota Camry SE", the same car shown as the seller's
// "Active Marketplace Listing" in Messages > My Garage).
export const seedTradeSubmissions: TradeSubmission[] = [
  {
    id: 'trade-camry-se',
    sellerId: 'user-private-1',
    vin: '4T1G11AK5MU498213',
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE Nightshade Edition',
    mileage: 32150,
    condition: 'excellent',
    carfaxReportId: null,
    imageIds: [],
    kbbEstimateCents: 2_480_000,
    aiRecommendationCents: 2_450_000,
    status: 'open',
    biddingClosesAt: now + 14 * 60 * 60 * 1000,
    createdAt: now - 2 * DAY,
  },
]
