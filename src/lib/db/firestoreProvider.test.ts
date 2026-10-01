import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Offer, TradeSubmission, VehicleImage, VehicleListing } from './schema'

const { fsMocks, storageMocks } = vi.hoisted(() => ({
  fsMocks: {
    collection: vi.fn((_db: unknown, path: string) => ({ __collection: path })),
    doc: vi.fn((...args: unknown[]) => ({ __doc: args.slice(1) })),
    where: vi.fn((field: string, op: string, value: unknown) => ({ __where: [field, op, value] })),
    query: vi.fn((base: unknown, ...clauses: unknown[]) => ({ __query: base, clauses })),
    limit: vi.fn((n: number) => ({ __limit: n })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
  },
  storageMocks: {
    ref: vi.fn((_storage: unknown, path: string) => ({ __storageRef: path })),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
  },
}))

vi.mock('firebase/firestore', () => ({
  collection: fsMocks.collection,
  doc: fsMocks.doc,
  where: fsMocks.where,
  query: fsMocks.query,
  limit: fsMocks.limit,
  getDoc: fsMocks.getDoc,
  getDocs: fsMocks.getDocs,
  setDoc: fsMocks.setDoc,
  deleteDoc: fsMocks.deleteDoc,
}))
vi.mock('firebase/storage', () => ({
  ref: storageMocks.ref,
  uploadBytes: storageMocks.uploadBytes,
  getDownloadURL: storageMocks.getDownloadURL,
}))
vi.mock('../firebase', () => ({
  getFirestoreDb: vi.fn(() => ({ __brand: 'db' })),
  getFirebaseStorage: vi.fn(() => ({ __brand: 'storage' })),
}))

const { firestoreProvider } = await import('./firestoreProvider')

function docSnap(exists: boolean, data?: unknown) {
  return { exists: () => exists, data: () => data }
}

function querySnap(items: { id: string; data: unknown }[]) {
  return {
    empty: items.length === 0,
    docs: items.map(({ id, data }) => ({ id, data: () => data })),
  }
}

function makeListing(overrides: Partial<VehicleListing> = {}): VehicleListing {
  return {
    id: 'listing-1',
    sellerId: 'seller-1',
    sellerType: 'private',
    status: 'active',
    vin: 'VIN1',
    year: 2022,
    make: 'Toyota',
    model: 'Camry',
    trim: null,
    bodyType: 'sedan',
    mileage: 10000,
    priceCents: 1000000,
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
    listedAt: 1,
    updatedAt: 1,
    soldAt: null,
    ...overrides,
  }
}

function makeImage(overrides: Partial<VehicleImage> = {}): VehicleImage {
  return {
    id: 'img-1',
    ownerType: 'listing',
    ownerId: 'listing-1',
    order: 0,
    width: null,
    height: null,
    storageKind: 'static',
    staticPath: '/x.jpg',
    blobKey: null,
    remoteUrl: null,
    remotePath: null,
    ...overrides,
  }
}

beforeEach(() => {
  for (const m of Object.values(fsMocks)) if ('mockReset' in m) m.mockReset()
  for (const m of Object.values(storageMocks)) m.mockReset()
  fsMocks.collection.mockImplementation((_db: unknown, path: string) => ({ __collection: path }))
  fsMocks.doc.mockImplementation((...args: unknown[]) => ({ __doc: args.slice(1) }))
  fsMocks.where.mockImplementation((field: string, op: string, value: unknown) => ({
    __where: [field, op, value],
  }))
  fsMocks.query.mockImplementation((base: unknown, ...clauses: unknown[]) => ({ __query: base, clauses }))
  fsMocks.limit.mockImplementation((n: number) => ({ __limit: n }))
  storageMocks.ref.mockImplementation((_storage: unknown, path: string) => ({ __storageRef: path }))
})

describe('listListings', () => {
  it('queries with no where clauses when no filter is given', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]))
    await firestoreProvider.listListings()
    expect(fsMocks.query.mock.calls[0][1]).toBeUndefined()
    expect(fsMocks.query.mock.calls[0].length).toBe(1)
  })

  it('adds a where clause per provided filter field', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]))
    await firestoreProvider.listListings({
      make: 'Toyota',
      bodyType: 'suv',
      sellerType: 'dealer',
      status: 'active',
      sellerId: 'seller-9',
    })
    const clauses = fsMocks.query.mock.calls[0].slice(1)
    expect(clauses).toEqual([
      { __where: ['make', '==', 'Toyota'] },
      { __where: ['bodyType', '==', 'suv'] },
      { __where: ['sellerType', '==', 'dealer'] },
      { __where: ['status', '==', 'active'] },
      { __where: ['sellerId', '==', 'seller-9'] },
    ])
  })

  it('filters by priceMaxCents client-side, inclusive of an exact match', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'a', data: makeListing({ id: 'a', priceCents: 1000000, listedAt: 1 }) },
        { id: 'b', data: makeListing({ id: 'b', priceCents: 1500000, listedAt: 2 }) },
      ]),
    )
    const result = await firestoreProvider.listListings({ priceMaxCents: 1000000 })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('does not apply a priceMaxCents filter when it is undefined', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([{ id: 'a', data: makeListing({ id: 'a', priceCents: 9999999, listedAt: 1 }) }]),
    )
    const result = await firestoreProvider.listListings({ make: 'Toyota' })
    expect(result.map((l) => l.id)).toEqual(['a'])
  })

  it('sorts results newest-listed-first', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'old', data: makeListing({ id: 'old', listedAt: 1 }) },
        { id: 'new', data: makeListing({ id: 'new', listedAt: 9 }) },
      ]),
    )
    const result = await firestoreProvider.listListings()
    expect(result.map((l) => l.id)).toEqual(['new', 'old'])
  })
})

describe('getListing / createListing / updateListing', () => {
  it('returns null when the doc does not exist', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    expect(await firestoreProvider.getListing('nope')).toBeNull()
  })

  it('returns the listing data when the doc exists', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(true, makeListing({ id: 'a' })))
    const result = await firestoreProvider.getListing('a')
    expect(result?.id).toBe('a')
  })

  it('createListing writes the listing to its own doc', async () => {
    const listing = makeListing({ id: 'a' })
    await firestoreProvider.createListing(listing)
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['listings', 'a'])
    expect(fsMocks.setDoc).toHaveBeenCalledWith(expect.anything(), listing)
  })

  it('updateListing throws when the listing does not exist', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    await expect(firestoreProvider.updateListing('nope', { priceCents: 1 })).rejects.toThrow(
      'listing not found: nope',
    )
  })

  it('updateListing merges the patch onto the existing data with a fresh updatedAt', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(true, makeListing({ id: 'a', priceCents: 1, updatedAt: 1 })))
    const before = Date.now()
    await firestoreProvider.updateListing('a', { priceCents: 2000000 })
    const after = Date.now()
    const written = fsMocks.setDoc.mock.calls[0][1]
    expect(written.priceCents).toBe(2000000)
    expect(written.id).toBe('a')
    expect(written.updatedAt).toBeGreaterThanOrEqual(before)
    expect(written.updatedAt).toBeLessThanOrEqual(after)
  })
})

describe('images', () => {
  it('listImages queries by ownerType+ownerId and sorts by order', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'b', data: makeImage({ id: 'b', order: 1 }) },
        { id: 'a', data: makeImage({ id: 'a', order: 0 }) },
      ]),
    )
    const result = await firestoreProvider.listImages('listing', 'listing-1')
    expect(result.map((i) => i.id)).toEqual(['a', 'b'])
    const clauses = fsMocks.query.mock.calls[0].slice(1)
    expect(clauses).toEqual([
      { __where: ['ownerType', '==', 'listing'] },
      { __where: ['ownerId', '==', 'listing-1'] },
    ])
  })

  it('addStaticImage writes a static-kind image with null blob/remote fields', async () => {
    const image = makeImage({ id: 'a' })
    await firestoreProvider.addStaticImage(image)
    const written = fsMocks.setDoc.mock.calls[0][1]
    expect(written).toMatchObject({ storageKind: 'static', blobKey: null, remoteUrl: null, remotePath: null })
  })

  it('uploadImage uploads to a namespaced path and writes a remote-kind image', async () => {
    storageMocks.uploadBytes.mockResolvedValue(undefined)
    storageMocks.getDownloadURL.mockResolvedValue('https://cdn.example/x.jpg')
    const file = new Blob(['x'])

    const image = await firestoreProvider.uploadImage('listing', 'listing-1', file, 3)

    expect(storageMocks.ref.mock.calls[0][1]).toMatch(/^listings\/listing-1\/img-/)
    expect(storageMocks.uploadBytes).toHaveBeenCalledTimes(1)
    expect(image.storageKind).toBe('remote')
    expect(image.remoteUrl).toBe('https://cdn.example/x.jpg')
    expect(image.order).toBe(3)
    const written = fsMocks.setDoc.mock.calls[0][1]
    expect(written).toEqual(image)
  })

  it('getImageUrl returns the staticPath for a static image', async () => {
    expect(await firestoreProvider.getImageUrl(makeImage({ storageKind: 'static', staticPath: '/x.jpg' }))).toBe(
      '/x.jpg',
    )
  })

  it('getImageUrl returns empty string for a static image with no staticPath', async () => {
    expect(await firestoreProvider.getImageUrl(makeImage({ storageKind: 'static', staticPath: null }))).toBe('')
  })

  it('getImageUrl returns the remoteUrl for a remote image', async () => {
    expect(
      await firestoreProvider.getImageUrl(makeImage({ storageKind: 'remote', remoteUrl: 'https://x/y.jpg' })),
    ).toBe('https://x/y.jpg')
  })

  it('getImageUrl returns empty string for a remote image with no remoteUrl', async () => {
    expect(await firestoreProvider.getImageUrl(makeImage({ storageKind: 'remote', remoteUrl: null }))).toBe('')
  })

  it('getImageUrl returns empty string for a blob-kind image (unsupported by this provider)', async () => {
    expect(
      await firestoreProvider.getImageUrl(makeImage({ storageKind: 'blob', blobKey: 'k', staticPath: null, remoteUrl: null })),
    ).toBe('')
  })
})

describe('carfax reports', () => {
  it('returns null when no report matches the VIN', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]))
    expect(await firestoreProvider.getCarfaxReportByVin('nope')).toBeNull()
  })

  it('returns the first matching report, querying with limit(1)', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 'cf-1', data: { id: 'cf-1', vin: 'VIN1' } }]))
    const result = await firestoreProvider.getCarfaxReportByVin('VIN1')
    expect(result?.id).toBe('cf-1')
    expect(fsMocks.limit).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('putCarfaxReport writes to its own doc', async () => {
    await firestoreProvider.putCarfaxReport({
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
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['carfaxReports', 'cf-1'])
  })
})

describe('users and dealer profiles', () => {
  it('getUser returns null when the doc does not exist', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    expect(await firestoreProvider.getUser('nope')).toBeNull()
  })

  it('getUser returns the stored user', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(true, { id: 'u1' }))
    expect((await firestoreProvider.getUser('u1'))?.id).toBe('u1')
  })

  it('putUser writes to users/{id}', async () => {
    await firestoreProvider.putUser({
      id: 'u1',
      type: 'consumer',
      email: '',
      displayName: '',
      photoUrl: null,
      phone: null,
      createdAt: 1,
    })
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['users', 'u1'])
  })

  it('getDealerProfile returns null when the doc does not exist', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    expect(await firestoreProvider.getDealerProfile('nope')).toBeNull()
  })

  it('getDealerProfile returns the stored profile', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(true, { userId: 'd1' }))
    expect((await firestoreProvider.getDealerProfile('d1'))?.userId).toBe('d1')
  })

  it('putDealerProfile writes to dealerProfiles/{userId}', async () => {
    await firestoreProvider.putDealerProfile({
      userId: 'd1',
      businessName: 'Apex',
      licenseNumber: '',
      certifiedPartnerId: null,
      tier: 'standard',
      verified: false,
      rating: null,
      address: { street: '', city: '', state: '', zip: '' },
      logoImageId: null,
    })
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['dealerProfiles', 'd1'])
  })
})

describe('saved listings and searches', () => {
  it('listSavedListings queries by userId', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 's1', data: { id: 's1' } }]))
    const result = await firestoreProvider.listSavedListings('u1')
    expect(result).toEqual([{ id: 's1' }])
    expect(fsMocks.query.mock.calls[0].slice(1)).toEqual([{ __where: ['userId', '==', 'u1'] }])
  })

  it('isSaved is false when the doc does not exist and true when it does', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    expect(await firestoreProvider.isSaved('u1', 'l1')).toBe(false)
    fsMocks.getDoc.mockResolvedValue(docSnap(true))
    expect(await firestoreProvider.isSaved('u1', 'l1')).toBe(true)
  })

  it('saveListing writes a composite-id doc', async () => {
    await firestoreProvider.saveListing('u1', 'l1')
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['savedListings', 'u1_l1'])
    expect(fsMocks.setDoc.mock.calls[0][1]).toMatchObject({ id: 'u1_l1', userId: 'u1', listingId: 'l1' })
  })

  it('unsaveListing deletes the composite-id doc', async () => {
    await firestoreProvider.unsaveListing('u1', 'l1')
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['savedListings', 'u1_l1'])
    expect(fsMocks.deleteDoc).toHaveBeenCalledTimes(1)
  })

  it('listSavedSearches queries by userId', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 's1', data: { id: 's1' } }]))
    await firestoreProvider.listSavedSearches('u1')
    expect(fsMocks.query.mock.calls[0].slice(1)).toEqual([{ __where: ['userId', '==', 'u1'] }])
  })

  it('putSavedSearch writes to its own doc', async () => {
    await firestoreProvider.putSavedSearch({ id: 's1', userId: 'u1', query: {}, alertsEnabled: true, createdAt: 1 })
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['savedSearches', 's1'])
  })
})

describe('conversations and messages', () => {
  it('listConversations merges buyer and seller result sets, deduping by doc id', async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(querySnap([{ id: 'shared', data: { lastMessageAt: 5 } }]))
      .mockResolvedValueOnce(querySnap([{ id: 'shared', data: { lastMessageAt: 5 } }]))
    const result = await firestoreProvider.listConversations('me')
    expect(result).toHaveLength(1)
  })

  it('listConversations sorts by most-recent message first', async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(
        querySnap([
          { id: 'old', data: { id: 'old', lastMessageAt: 1 } },
          { id: 'new', data: { id: 'new', lastMessageAt: 9 } },
        ]),
      )
      .mockResolvedValueOnce(querySnap([]))
    const result = await firestoreProvider.listConversations('me')
    expect(result.map((c) => c.id)).toEqual(['new', 'old'])
  })

  it('getOrCreateConversation returns the existing conversation without writing when one is found', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 'existing', data: { id: 'existing' } }]))
    const result = await firestoreProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    expect(result).toEqual({ id: 'existing' })
    expect(fsMocks.setDoc).not.toHaveBeenCalled()
  })

  it('getOrCreateConversation creates and writes a fresh conversation when none is found', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]))
    const result = await firestoreProvider.getOrCreateConversation('l1', 'buyer-1', 'seller-1')
    expect(result).toMatchObject({
      listingId: 'l1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      lastMessagePreview: '',
      unreadCountBuyer: 0,
      unreadCountSeller: 0,
    })
    expect(fsMocks.setDoc).toHaveBeenCalledTimes(1)
  })

  it('listMessages queries by conversationId and sorts oldest-first', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'm2', data: { id: 'm2', createdAt: 2 } },
        { id: 'm1', data: { id: 'm1', createdAt: 1 } },
      ]),
    )
    const result = await firestoreProvider.listMessages('c1')
    expect(result.map((m) => m.id)).toEqual(['m1', 'm2'])
  })

  it('sendMessage writes the message and updates the parent conversation when it exists', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(true, { id: 'c1', lastMessageAt: 1, lastMessagePreview: 'old' }))
    await firestoreProvider.sendMessage({
      id: 'm1',
      conversationId: 'c1',
      senderId: 'u1',
      body: 'hi',
      createdAt: 5000,
      readAt: null,
    })
    expect(fsMocks.setDoc).toHaveBeenCalledTimes(2)
    const convoUpdate = fsMocks.setDoc.mock.calls[1][1]
    expect(convoUpdate.lastMessageAt).toBe(5000)
    expect(convoUpdate.lastMessagePreview).toBe('hi')
  })

  it('sendMessage skips the conversation update when the parent conversation does not exist', async () => {
    fsMocks.getDoc.mockResolvedValue(docSnap(false))
    await firestoreProvider.sendMessage({
      id: 'm1',
      conversationId: 'ghost',
      senderId: 'u1',
      body: 'hi',
      createdAt: 5000,
      readAt: null,
    })
    expect(fsMocks.setDoc).toHaveBeenCalledTimes(1)
  })
})

describe('offers', () => {
  it('listOffersForListing queries by listingId', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 'o1', data: { id: 'o1' } }]))
    const result = await firestoreProvider.listOffersForListing('l1')
    expect(result).toEqual([{ id: 'o1' }])
    expect(fsMocks.query.mock.calls[0].slice(1)).toEqual([{ __where: ['listingId', '==', 'l1'] }])
  })

  it('listOffersForTradeSubmission queries by tradeSubmissionId and sorts newest first', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'old', data: { id: 'old', createdAt: 1 } as Offer },
        { id: 'new', data: { id: 'new', createdAt: 9 } as Offer },
      ]),
    )
    const result = await firestoreProvider.listOffersForTradeSubmission('ts1')
    expect(result.map((o) => o.id)).toEqual(['new', 'old'])
  })
})

describe('trade submissions', () => {
  it('listTradeSubmissions with no status queries with no where clause and returns every doc', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([{ id: 't1', data: { id: 't1' } }]))
    const result = await firestoreProvider.listTradeSubmissions()
    expect(result).toEqual([{ id: 't1' }])
    expect(fsMocks.query.mock.calls[0].slice(1)).toEqual([])
  })

  it('listTradeSubmissions with a status adds a status where clause', async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]))
    await firestoreProvider.listTradeSubmissions('open')
    expect(fsMocks.query.mock.calls[0].slice(1)).toEqual([{ __where: ['status', '==', 'open'] }])
  })

  it('listTradeSubmissionsBySeller queries by sellerId and sorts newest first', async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([
        { id: 'old', data: { id: 'old', createdAt: 1 } as TradeSubmission },
        { id: 'new', data: { id: 'new', createdAt: 9 } as TradeSubmission },
      ]),
    )
    const result = await firestoreProvider.listTradeSubmissionsBySeller('s1')
    expect(result.map((t) => t.id)).toEqual(['new', 'old'])
  })

  it('createTradeSubmission writes to its own doc', async () => {
    await firestoreProvider.createTradeSubmission({
      id: 't1',
      sellerId: 's1',
      vin: 'VIN1',
      year: 2020,
      make: 'Honda',
      model: 'Accord',
      trim: null,
      mileage: 1,
      condition: 'good',
      carfaxReportId: null,
      imageIds: [],
      kbbEstimateCents: null,
      aiRecommendationCents: null,
      status: 'open',
      biddingClosesAt: null,
      createdAt: 1,
    })
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['tradeSubmissions', 't1'])
  })

  it('createOffer writes to its own doc', async () => {
    await firestoreProvider.createOffer({
      id: 'o1',
      kind: 'purchase_offer',
      listingId: 'l1',
      tradeSubmissionId: null,
      fromUserId: 'u1',
      toUserId: 'u2',
      amountCents: 1,
      status: 'pending',
      message: null,
      createdAt: 1,
      respondedAt: null,
    })
    expect(fsMocks.doc.mock.calls[0].slice(1)).toEqual(['offers', 'o1'])
  })
})

describe('seedIfEmpty', () => {
  it('is a no-op against real Firestore', async () => {
    await expect(firestoreProvider.seedIfEmpty()).resolves.toBeUndefined()
    expect(fsMocks.setDoc).not.toHaveBeenCalled()
    expect(fsMocks.getDocs).not.toHaveBeenCalled()
  })
})
