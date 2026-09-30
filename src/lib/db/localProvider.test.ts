import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { openDB } from 'idb'
import type {
  DealerProfile,
  Message,
  Offer,
  TradeSubmission,
  User,
  VehicleImage,
  VehicleListing,
} from './schema'
import { localProvider } from './localProvider'

// Reusing one localProvider module instance for the whole file — rather
// than vi.resetModules() + delete-and-reopen the database per test — is
// deliberate: repeated delete/reopen cycles leak IDB connections (nothing
// closes localProvider's internal cached connection just because the
// module was "reset"), and fake-indexeddb deadlocks once enough leaked
// connections pile up. Clearing every object store's *data* between tests
// resets state just as effectively without ever touching the database's
// existence/version, so no connection juggling is needed. The one
// module-level cache this doesn't reset (objectUrlCache, a Map keyed by
// blobKey) is harmless to leave warm across tests: every test that
// exercises it generates a fresh random blobKey via crypto.randomUUID().
const STORES = [
  'listings',
  'images',
  'imageBlobs',
  'carfaxReports',
  'users',
  'dealerProfiles',
  'savedListings',
  'savedSearches',
  'conversations',
  'messages',
  'offers',
  'tradeSubmissions',
  'meta',
] as const

async function clearAllStores() {
  const db = await openDB('budgetwheel', 1)
  const tx = db.transaction(STORES, 'readwrite')
  await Promise.all(STORES.map((store) => tx.objectStore(store).clear()))
  await tx.done
  db.close()
}

beforeAll(async () => {
  // Forces localProvider's internal getDb() to run once, creating the
  // database/object-store schema — clearAllStores() needs that schema to
  // already exist (it has no upgrade callback of its own).
  await localProvider.listListings()
})

beforeEach(async () => {
  vi.restoreAllMocks()
  await clearAllStores()
})

function makeListing(overrides: Partial<VehicleListing> = {}): VehicleListing {
  return {
    id: `listing-${Math.random().toString(36).slice(2)}`,
    sellerId: 'seller-1',
    sellerType: 'private',
    status: 'active',
    vin: 'VIN000000000',
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    trim: null,
    bodyType: 'sedan',
    mileage: 30000,
    priceCents: 2000000,
    marketAvgCents: null,
    monthlyEstimateCents: null,
    condition: 'good',
    exteriorColor: null,
    transmission: null,
    drivetrain: null,
    engine: null,
    zeroToSixtySec: null,
    description: '',
    location: { city: 'Austin', state: 'TX', zip: '78701', lat: null, lng: null },
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

function makeImage(overrides: Partial<VehicleImage> = {}): VehicleImage {
  return {
    id: `img-${Math.random().toString(36).slice(2)}`,
    ownerType: 'listing',
    ownerId: 'listing-1',
    order: 0,
    width: null,
    height: null,
    storageKind: 'static',
    staticPath: '/images/x.jpg',
    blobKey: null,
    remoteUrl: null,
    remotePath: null,
    ...overrides,
  }
}

function makeDealer(overrides: Partial<DealerProfile> = {}): DealerProfile {
  return {
    userId: 'dealer-1',
    businessName: 'Test Motors',
    licenseNumber: 'LIC1',
    certifiedPartnerId: null,
    tier: 'standard',
    verified: false,
    rating: null,
    address: { street: '1 Main', city: 'Austin', state: 'TX', zip: '78701' },
    logoImageId: null,
    ...overrides,
  }
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    type: 'consumer',
    email: 'a@example.com',
    displayName: 'A User',
    photoUrl: null,
    phone: null,
    createdAt: 1_700_000_000_000,
    ...overrides,
  }
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Math.random().toString(36).slice(2)}`,
    conversationId: 'conv-1',
    senderId: 'buyer-1',
    body: 'hello',
    createdAt: 1_700_000_000_000,
    readAt: null,
    ...overrides,
  }
}

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: `offer-${Math.random().toString(36).slice(2)}`,
    kind: 'purchase_offer',
    listingId: 'listing-1',
    tradeSubmissionId: null,
    fromUserId: 'buyer-1',
    toUserId: 'seller-1',
    amountCents: 1000000,
    status: 'pending',
    message: null,
    createdAt: 1_700_000_000_000,
    respondedAt: null,
    ...overrides,
  }
}

function makeTradeSubmission(overrides: Partial<TradeSubmission> = {}): TradeSubmission {
  return {
    id: `ts-${Math.random().toString(36).slice(2)}`,
    sellerId: 'seller-1',
    vin: 'VIN000000000',
    year: 2020,
    make: 'Honda',
    model: 'Accord',
    trim: null,
    mileage: 40000,
    condition: 'good',
    carfaxReportId: null,
    imageIds: [],
    kbbEstimateCents: null,
    aiRecommendationCents: null,
    status: 'open',
    biddingClosesAt: null,
    createdAt: 1_700_000_000_000,
    ...overrides,
  }
}

describe('listListings', () => {
  it('returns all listings sorted newest-listed-first when there is no filter', async () => {
    await localProvider.createListing(makeListing({ id: 'a', listedAt: 1 }))
    await localProvider.createListing(makeListing({ id: 'b', listedAt: 3 }))
    await localProvider.createListing(makeListing({ id: 'c', listedAt: 2 }))
    const result = await localProvider.listListings()
    expect(result.map((l) => l.id)).toEqual(['b', 'c', 'a'])
  })

  it('filters by make', async () => {
    await localProvider.createListing(makeListing({ id: 'a', make: 'Toyota' }))
    await localProvider.createListing(makeListing({ id: 'b', make: 'Honda' }))
    const result = await localProvider.listListings({ make: 'Toyota' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('filters by bodyType', async () => {
    await localProvider.createListing(makeListing({ id: 'a', bodyType: 'suv' }))
    await localProvider.createListing(makeListing({ id: 'b', bodyType: 'sedan' }))
    const result = await localProvider.listListings({ bodyType: 'suv' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('filters by priceMaxCents (inclusive of an exact match)', async () => {
    await localProvider.createListing(makeListing({ id: 'a', priceCents: 1000000 }))
    await localProvider.createListing(makeListing({ id: 'b', priceCents: 1500000 }))
    const result = await localProvider.listListings({ priceMaxCents: 1000000 })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('filters by sellerType', async () => {
    await localProvider.createListing(makeListing({ id: 'a', sellerType: 'dealer' }))
    await localProvider.createListing(makeListing({ id: 'b', sellerType: 'private' }))
    const result = await localProvider.listListings({ sellerType: 'dealer' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('filters by status', async () => {
    await localProvider.createListing(makeListing({ id: 'a', status: 'sold' }))
    await localProvider.createListing(makeListing({ id: 'b', status: 'active' }))
    const result = await localProvider.listListings({ status: 'sold' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('filters by sellerId', async () => {
    await localProvider.createListing(makeListing({ id: 'a', sellerId: 'seller-a' }))
    await localProvider.createListing(makeListing({ id: 'b', sellerId: 'seller-b' }))
    const result = await localProvider.listListings({ sellerId: 'seller-a' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('applies every provided filter field simultaneously (AND semantics)', async () => {
    await localProvider.createListing(
      makeListing({ id: 'match', make: 'Toyota', bodyType: 'suv', status: 'active' }),
    )
    await localProvider.createListing(
      makeListing({ id: 'wrong-body', make: 'Toyota', bodyType: 'sedan', status: 'active' }),
    )
    const result = await localProvider.listListings({ make: 'Toyota', bodyType: 'suv', status: 'active' })
    expect(result.map((l) => l.id)).toEqual(['match'])
  })

  it('returns an empty array (not all listings) when the filter object is empty but present', async () => {
    await localProvider.createListing(makeListing({ id: 'a' }))
    const result = await localProvider.listListings({})
    expect(result.map((l) => l.id)).toEqual(['a'])
  })
})

describe('getListing / createListing / updateListing', () => {
  it('returns null for a listing that does not exist', async () => {
    expect(await localProvider.getListing('nope')).toBeNull()
  })

  it('returns a created listing by id', async () => {
    await localProvider.createListing(makeListing({ id: 'a', make: 'Ford' }))
    expect((await localProvider.getListing('a'))?.make).toBe('Ford')
  })

  it('throws when updating a listing that does not exist', async () => {
    await expect(localProvider.updateListing('nope', { priceCents: 1 })).rejects.toThrow(
      'listing not found: nope',
    )
  })

  it('merges a patch onto the existing listing and bumps updatedAt', async () => {
    await localProvider.createListing(makeListing({ id: 'a', priceCents: 1000000, updatedAt: 1 }))
    const before = Date.now()
    await localProvider.updateListing('a', { priceCents: 2000000 })
    const after = Date.now()
    const updated = await localProvider.getListing('a')
    expect(updated?.priceCents).toBe(2000000)
    expect(updated?.updatedAt).toBeGreaterThanOrEqual(before)
    expect(updated?.updatedAt).toBeLessThanOrEqual(after)
    expect(updated?.make).toBe('Toyota')
  })
})

describe('images', () => {
  it('listImages returns only images matching both ownerId and ownerType, sorted by order', async () => {
    await localProvider.addStaticImage(makeImage({ id: 'z', ownerId: 'listing-1', ownerType: 'listing', order: 1 }))
    await localProvider.addStaticImage(makeImage({ id: 'a', ownerId: 'listing-1', ownerType: 'listing', order: 0 }))
    await localProvider.addStaticImage(
      makeImage({ id: 'wrong-owner', ownerId: 'listing-2', ownerType: 'listing', order: 0 }),
    )
    await localProvider.addStaticImage(
      makeImage({ id: 'wrong-type', ownerId: 'listing-1', ownerType: 'dealer-logo', order: 0 }),
    )
    const result = await localProvider.listImages('listing', 'listing-1')
    expect(result.map((i) => i.id)).toEqual(['a', 'z'])
  })

  it('addStaticImage stores a static-kind image with null blob/remote fields', async () => {
    await localProvider.addStaticImage(
      makeImage({ id: 'a', ownerId: 'listing-1', ownerType: 'listing', staticPath: '/x.jpg' }),
    )
    const [img] = await localProvider.listImages('listing', 'listing-1')
    expect(img).toMatchObject({ storageKind: 'static', blobKey: null, remoteUrl: null, remotePath: null })
  })

  it('uploadImage stores the blob and returns a blob-kind image record', async () => {
    const file = new Blob(['hello'], { type: 'text/plain' })
    const image = await localProvider.uploadImage('listing', 'listing-1', file, 2)
    expect(image.storageKind).toBe('blob')
    expect(image.order).toBe(2)
    expect(image.blobKey).toBeTruthy()
    const [stored] = await localProvider.listImages('listing', 'listing-1')
    expect(stored.id).toBe(image.id)
  })

  it('getImageUrl returns the staticPath for a static image', async () => {
    const url = await localProvider.getImageUrl(makeImage({ storageKind: 'static', staticPath: '/x.jpg' }))
    expect(url).toBe('/x.jpg')
  })

  it('getImageUrl returns empty string for a static image with no staticPath', async () => {
    const url = await localProvider.getImageUrl(
      makeImage({ storageKind: 'static', staticPath: null }),
    )
    expect(url).toBe('')
  })

  it('getImageUrl returns the remoteUrl for a remote image', async () => {
    const url = await localProvider.getImageUrl(
      makeImage({ storageKind: 'remote', remoteUrl: 'https://cdn.example/x.jpg' }),
    )
    expect(url).toBe('https://cdn.example/x.jpg')
  })

  it('getImageUrl returns empty string for a remote image with no remoteUrl', async () => {
    const url = await localProvider.getImageUrl(makeImage({ storageKind: 'remote', remoteUrl: null }))
    expect(url).toBe('')
  })

  it('getImageUrl creates and caches an object URL for a blob image, reusing it on a second call', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const file = new Blob(['hello'])
    const image = await localProvider.uploadImage('listing', 'listing-1', file, 0)

    const first = await localProvider.getImageUrl(image)
    const second = await localProvider.getImageUrl(image)

    expect(first).toBe('blob:mock-url')
    expect(second).toBe('blob:mock-url')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('getImageUrl returns empty string for a blob image whose blob was never stored', async () => {
    const url = await localProvider.getImageUrl(
      makeImage({ storageKind: 'blob', blobKey: 'missing-key' }),
    )
    expect(url).toBe('')
  })

  it('getImageUrl returns empty string for a blob image with no blobKey', async () => {
    const url = await localProvider.getImageUrl(makeImage({ storageKind: 'blob', blobKey: null }))
    expect(url).toBe('')
  })
})

describe('carfax reports', () => {
  it('returns null for an unknown VIN', async () => {
    expect(await localProvider.getCarfaxReportByVin('UNKNOWN')).toBeNull()
  })

  it('returns a stored report by VIN', async () => {
    await localProvider.putCarfaxReport({
      id: 'cf-1',
      vin: 'VIN1',
      ownerCount: 1,
      accidentCount: 0,
      titleStatus: 'clean',
      serviceRecordCount: 0,
      lastServiceDate: null,
      externalReportUrl: null,
      fetchedAt: 1,
    })
    expect((await localProvider.getCarfaxReportByVin('VIN1'))?.id).toBe('cf-1')
  })
})

describe('users and dealer profiles', () => {
  it('returns null for an unknown user', async () => {
    expect(await localProvider.getUser('nope')).toBeNull()
  })

  it('returns a stored user by id', async () => {
    await localProvider.putUser(makeUser({ id: 'u1', displayName: 'Jane' }))
    expect((await localProvider.getUser('u1'))?.displayName).toBe('Jane')
  })

  it('returns null for an unknown dealer profile', async () => {
    expect(await localProvider.getDealerProfile('nope')).toBeNull()
  })

  it('returns a stored dealer profile by userId', async () => {
    await localProvider.putDealerProfile(makeDealer({ userId: 'd1', businessName: 'ACME' }))
    expect((await localProvider.getDealerProfile('d1'))?.businessName).toBe('ACME')
  })
})

describe('saved listings', () => {
  it('lists saved listings for a user via the userId index', async () => {
    await localProvider.saveListing('u1', 'l1')
    await localProvider.saveListing('u1', 'l2')
    await localProvider.saveListing('u2', 'l3')
    const result = await localProvider.listSavedListings('u1')
    expect(result.map((s) => s.listingId).sort()).toEqual(['l1', 'l2'])
  })

  it('isSaved is false before saving and true after', async () => {
    expect(await localProvider.isSaved('u1', 'l1')).toBe(false)
    await localProvider.saveListing('u1', 'l1')
    expect(await localProvider.isSaved('u1', 'l1')).toBe(true)
  })

  it('unsaveListing removes the saved record', async () => {
    await localProvider.saveListing('u1', 'l1')
    await localProvider.unsaveListing('u1', 'l1')
    expect(await localProvider.isSaved('u1', 'l1')).toBe(false)
  })
})

describe('saved searches', () => {
  it('lists saved searches for a user via the userId index', async () => {
    await localProvider.putSavedSearch({
      id: 's1',
      userId: 'u1',
      query: { make: 'Toyota' },
      alertsEnabled: true,
      createdAt: 1,
    })
    await localProvider.putSavedSearch({
      id: 's2',
      userId: 'u2',
      query: {},
      alertsEnabled: false,
      createdAt: 1,
    })
    const result = await localProvider.listSavedSearches('u1')
    expect(result.map((s) => s.id)).toEqual(['s1'])
  })
})

describe('conversations and messages', () => {
  it('lists conversations where the user is the buyer', async () => {
    await localProvider.getOrCreateConversation('l1', 'me', 'seller-1')
    const result = await localProvider.listConversations('me')
    expect(result).toHaveLength(1)
  })

  it('lists conversations where the user is the seller', async () => {
    await localProvider.getOrCreateConversation('l1', 'buyer-1', 'me')
    const result = await localProvider.listConversations('me')
    expect(result).toHaveLength(1)
  })

  it('excludes conversations the user is neither buyer nor seller in', async () => {
    await localProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    const result = await localProvider.listConversations('someone-else')
    expect(result).toHaveLength(0)
  })

  it('sorts conversations by most-recently-messaged first', async () => {
    const old = await localProvider.getOrCreateConversation('l-old', 'me', 'seller-1')
    const fresh = await localProvider.getOrCreateConversation('l-new', 'me', 'seller-1')
    await localProvider.sendMessage(makeMessage({ conversationId: old.id, senderId: 'me', createdAt: 1000 }))
    await localProvider.sendMessage(makeMessage({ conversationId: fresh.id, senderId: 'me', createdAt: 9000 }))

    const result = await localProvider.listConversations('me')
    expect(result.map((c) => c.id)).toEqual([fresh.id, old.id])
  })

  it('getOrCreateConversation creates a fresh conversation with zeroed unread counts when none exists', async () => {
    const convo = await localProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    expect(convo).toMatchObject({
      listingId: 'l1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      lastMessagePreview: '',
      unreadCountBuyer: 0,
      unreadCountSeller: 0,
    })
  })

  it('getOrCreateConversation returns the existing conversation for the same listing+buyer instead of creating a duplicate', async () => {
    const first = await localProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    const second = await localProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    expect(second.id).toBe(first.id)
    const all = await localProvider.listConversations('buyer-1')
    expect(all).toHaveLength(1)
  })

  it('listMessages returns only messages for the given conversation, sorted oldest-first', async () => {
    await localProvider.sendMessage(makeMessage({ id: 'm2', conversationId: 'c1', createdAt: 2 }))
    await localProvider.sendMessage(makeMessage({ id: 'm1', conversationId: 'c1', createdAt: 1 }))
    await localProvider.sendMessage(makeMessage({ id: 'm-other', conversationId: 'c2', createdAt: 1 }))
    const result = await localProvider.listMessages('c1')
    expect(result.map((m) => m.id)).toEqual(['m1', 'm2'])
  })

  it('sendMessage updates the parent conversation lastMessageAt/lastMessagePreview when it exists', async () => {
    const convo = await localProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    await localProvider.sendMessage(
      makeMessage({ conversationId: convo.id, body: 'hi there', createdAt: 5000 }),
    )
    const [updated] = await localProvider.listConversations('buyer-1')
    expect(updated.lastMessageAt).toBe(5000)
    expect(updated.lastMessagePreview).toBe('hi there')
  })

  it('sendMessage does not throw when the parent conversation does not exist', async () => {
    await expect(
      localProvider.sendMessage(makeMessage({ conversationId: 'ghost-conversation' })),
    ).resolves.toBeUndefined()
  })
})

describe('offers', () => {
  it('listOffersForListing returns offers via the listingId index', async () => {
    await localProvider.createOffer(makeOffer({ id: 'o1', listingId: 'l1' }))
    await localProvider.createOffer(makeOffer({ id: 'o2', listingId: 'l2' }))
    const result = await localProvider.listOffersForListing('l1')
    expect(result.map((o) => o.id)).toEqual(['o1'])
  })

  it('listOffersForTradeSubmission filters by tradeSubmissionId and sorts newest first', async () => {
    await localProvider.createOffer(
      makeOffer({ id: 'old', tradeSubmissionId: 'ts1', listingId: null, createdAt: 1 }),
    )
    await localProvider.createOffer(
      makeOffer({ id: 'new', tradeSubmissionId: 'ts1', listingId: null, createdAt: 9 }),
    )
    await localProvider.createOffer(
      makeOffer({ id: 'other', tradeSubmissionId: 'ts2', listingId: null, createdAt: 5 }),
    )
    const result = await localProvider.listOffersForTradeSubmission('ts1')
    expect(result.map((o) => o.id)).toEqual(['new', 'old'])
  })
})

describe('trade submissions', () => {
  it('listTradeSubmissions with no status returns every submission', async () => {
    await localProvider.createTradeSubmission(makeTradeSubmission({ id: 't1', status: 'open' }))
    await localProvider.createTradeSubmission(makeTradeSubmission({ id: 't2', status: 'closed' }))
    const result = await localProvider.listTradeSubmissions()
    expect(result.map((t) => t.id).sort()).toEqual(['t1', 't2'])
  })

  it('listTradeSubmissions with a status filters to matching submissions only', async () => {
    await localProvider.createTradeSubmission(makeTradeSubmission({ id: 't1', status: 'open' }))
    await localProvider.createTradeSubmission(makeTradeSubmission({ id: 't2', status: 'closed' }))
    const result = await localProvider.listTradeSubmissions('open')
    expect(result.map((t) => t.id)).toEqual(['t1'])
  })

  it('listTradeSubmissionsBySeller filters by sellerId and sorts newest first', async () => {
    await localProvider.createTradeSubmission(
      makeTradeSubmission({ id: 'old', sellerId: 's1', createdAt: 1 }),
    )
    await localProvider.createTradeSubmission(
      makeTradeSubmission({ id: 'new', sellerId: 's1', createdAt: 9 }),
    )
    await localProvider.createTradeSubmission(
      makeTradeSubmission({ id: 'other', sellerId: 's2', createdAt: 5 }),
    )
    const result = await localProvider.listTradeSubmissionsBySeller('s1')
    expect(result.map((t) => t.id)).toEqual(['new', 'old'])
  })
})

describe('seedIfEmpty', () => {
  it('populates listings, users, dealer profiles, carfax reports, images, and trade submissions on first run', async () => {
    await localProvider.seedIfEmpty()
    const listings = await localProvider.listListings()
    expect(listings.length).toBeGreaterThan(0)
    expect(await localProvider.getUser('user-private-1')).not.toBeNull()
    expect(await localProvider.getDealerProfile('user-dealer-1')).not.toBeNull()
    for (const l of listings) {
      expect(l.primaryImageId).not.toBeNull()
    }
  })

  it('is a no-op on a second call (does not duplicate data or throw)', async () => {
    await localProvider.seedIfEmpty()
    const before = await localProvider.listListings()
    await localProvider.seedIfEmpty()
    const after = await localProvider.listListings()
    expect(after.length).toBe(before.length)
  })

  it('leaves primaryImageId null for a seed listing with zero images, skipping the second-pass update', async () => {
    const noImageListing = makeListing({ id: 'no-image-listing' })
    vi.doMock('./seed', () => ({
      seedUsers: [] as User[],
      seedDealerProfiles: [] as DealerProfile[],
      seedListingSpecs: [
        {
          listing: noImageListing,
          images: [] as string[],
          carfax: {
            id: 'cf-1',
            vin: noImageListing.vin,
            ownerCount: 1,
            accidentCount: 0,
            titleStatus: 'clean',
            serviceRecordCount: 0,
            lastServiceDate: null,
            externalReportUrl: null,
            fetchedAt: 1,
          },
        },
      ],
      buildSeedImages: () => [] as VehicleImage[],
      seedTradeSubmissions: [] as TradeSubmission[],
    }))
    vi.resetModules()
    const { localProvider: providerWithMockedSeed } = await import('./localProvider')

    await providerWithMockedSeed.seedIfEmpty()

    const seeded = await providerWithMockedSeed.getListing('no-image-listing')
    expect(seeded?.primaryImageId).toBeNull()

    vi.doUnmock('./seed')
  })
})
