// IndexedDB-backed DataProvider — the local-dev default. No server, no
// config; everything lives in the browser's IndexedDB for this origin.

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DataProvider } from './provider'
import type {
  CarfaxReport,
  Conversation,
  DealerProfile,
  Message,
  Offer,
  SavedListing,
  SavedSearch,
  TradeSubmission,
  User,
  VehicleImage,
  VehicleListing,
} from './schema'
import {
  buildSeedImages,
  seedDealerProfiles,
  seedListingSpecs,
  seedTradeSubmissions,
  seedUsers,
} from './seed'

interface BudgetWheelDB extends DBSchema {
  listings: { key: string; value: VehicleListing }
  images: { key: string; value: VehicleImage; indexes: { ownerId: string } }
  imageBlobs: { key: string; value: Blob }
  carfaxReports: { key: string; value: CarfaxReport; indexes: { vin: string } }
  users: { key: string; value: User }
  dealerProfiles: { key: string; value: DealerProfile }
  savedListings: { key: string; value: SavedListing; indexes: { userId: string } }
  savedSearches: { key: string; value: SavedSearch; indexes: { userId: string } }
  conversations: { key: string; value: Conversation; indexes: { userIds: string } }
  messages: { key: string; value: Message; indexes: { conversationId: string } }
  offers: { key: string; value: Offer; indexes: { listingId: string } }
  tradeSubmissions: { key: string; value: TradeSubmission }
  meta: { key: string; value: { seeded: boolean } }
}

let dbPromise: Promise<IDBPDatabase<BudgetWheelDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<BudgetWheelDB>('budgetwheel', 1, {
      upgrade(db) {
        db.createObjectStore('listings', { keyPath: 'id' })
        db.createObjectStore('images', { keyPath: 'id' }).createIndex('ownerId', 'ownerId')
        db.createObjectStore('imageBlobs')
        db.createObjectStore('carfaxReports', { keyPath: 'id' }).createIndex('vin', 'vin')
        db.createObjectStore('users', { keyPath: 'id' })
        db.createObjectStore('dealerProfiles', { keyPath: 'userId' })
        db.createObjectStore('savedListings', { keyPath: 'id' }).createIndex('userId', 'userId')
        db.createObjectStore('savedSearches', { keyPath: 'id' }).createIndex('userId', 'userId')
        db.createObjectStore('conversations', { keyPath: 'id' })
        db.createObjectStore('messages', { keyPath: 'id' }).createIndex(
          'conversationId',
          'conversationId',
        )
        db.createObjectStore('offers', { keyPath: 'id' }).createIndex('listingId', 'listingId')
        db.createObjectStore('tradeSubmissions', { keyPath: 'id' })
        db.createObjectStore('meta')
      },
    })
  }
  return dbPromise
}

// Object URLs are expensive to leak — one per blobKey, reused across calls.
const objectUrlCache = new Map<string, string>()

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export const localProvider: DataProvider = {
  async listListings(filter) {
    const db = await getDb()
    let items = await db.getAll('listings')
    if (filter) {
      items = items.filter((l) => {
        if (filter.make && l.make !== filter.make) return false
        if (filter.bodyType && l.bodyType !== filter.bodyType) return false
        if (filter.priceMaxCents !== undefined && l.priceCents > filter.priceMaxCents) return false
        if (filter.sellerType && l.sellerType !== filter.sellerType) return false
        if (filter.status && l.status !== filter.status) return false
        if (filter.sellerId && l.sellerId !== filter.sellerId) return false
        return true
      })
    }
    return items.sort((a, b) => b.listedAt - a.listedAt)
  },

  async getListing(id) {
    const db = await getDb()
    return (await db.get('listings', id)) ?? null
  },

  async createListing(l) {
    const db = await getDb()
    await db.put('listings', l)
  },

  async updateListing(id, patch) {
    const db = await getDb()
    const existing = await db.get('listings', id)
    if (!existing) throw new Error(`listing not found: ${id}`)
    await db.put('listings', { ...existing, ...patch, updatedAt: Date.now() })
  },

  async listImages(ownerType, ownerId) {
    const db = await getDb()
    const all = await db.getAllFromIndex('images', 'ownerId', ownerId)
    return all.filter((img) => img.ownerType === ownerType).sort((a, b) => a.order - b.order)
  },

  async addStaticImage(image) {
    const db = await getDb()
    await db.put('images', {
      ...image,
      storageKind: 'static',
      blobKey: null,
      remoteUrl: null,
      remotePath: null,
    })
  },

  async uploadImage(ownerType, ownerId, file, order) {
    const db = await getDb()
    const id = newId('img')
    await db.put('imageBlobs', file, id)
    const image: VehicleImage = {
      id,
      ownerType,
      ownerId,
      order,
      width: null,
      height: null,
      storageKind: 'blob',
      staticPath: null,
      blobKey: id,
      remoteUrl: null,
      remotePath: null,
    }
    await db.put('images', image)
    return image
  },

  async getImageUrl(image) {
    if (image.storageKind === 'static' && image.staticPath) return image.staticPath
    if (image.storageKind === 'remote' && image.remoteUrl) return image.remoteUrl
    if (image.storageKind === 'blob' && image.blobKey) {
      const cached = objectUrlCache.get(image.blobKey)
      if (cached) return cached
      const db = await getDb()
      const blob = await db.get('imageBlobs', image.blobKey)
      if (!blob) return ''
      const url = URL.createObjectURL(blob)
      objectUrlCache.set(image.blobKey, url)
      return url
    }
    return ''
  },

  async getCarfaxReportByVin(vin) {
    const db = await getDb()
    return (await db.getFromIndex('carfaxReports', 'vin', vin)) ?? null
  },

  async putCarfaxReport(report) {
    const db = await getDb()
    await db.put('carfaxReports', report)
  },

  async getUser(id) {
    const db = await getDb()
    return (await db.get('users', id)) ?? null
  },

  async putUser(user) {
    const db = await getDb()
    await db.put('users', user)
  },

  async getDealerProfile(userId) {
    const db = await getDb()
    return (await db.get('dealerProfiles', userId)) ?? null
  },

  async putDealerProfile(profile) {
    const db = await getDb()
    await db.put('dealerProfiles', profile)
  },

  async listSavedListings(userId) {
    const db = await getDb()
    return db.getAllFromIndex('savedListings', 'userId', userId)
  },

  async isSaved(userId, listingId) {
    const db = await getDb()
    return (await db.get('savedListings', `${userId}_${listingId}`)) !== undefined
  },

  async saveListing(userId, listingId) {
    const db = await getDb()
    const id = `${userId}_${listingId}`
    await db.put('savedListings', { id, userId, listingId, createdAt: Date.now() })
  },

  async unsaveListing(userId, listingId) {
    const db = await getDb()
    await db.delete('savedListings', `${userId}_${listingId}`)
  },

  async listSavedSearches(userId) {
    const db = await getDb()
    return db.getAllFromIndex('savedSearches', 'userId', userId)
  },

  async putSavedSearch(search) {
    const db = await getDb()
    await db.put('savedSearches', search)
  },

  async listConversations(userId) {
    const db = await getDb()
    const all = await db.getAll('conversations')
    return all.filter((c) => c.buyerId === userId || c.sellerId === userId)
  },

  async listMessages(conversationId) {
    const db = await getDb()
    const all = await db.getAllFromIndex('messages', 'conversationId', conversationId)
    return all.sort((a, b) => a.createdAt - b.createdAt)
  },

  async sendMessage(message) {
    const db = await getDb()
    await db.put('messages', message)
    const conversation = await db.get('conversations', message.conversationId)
    if (conversation) {
      await db.put('conversations', {
        ...conversation,
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.body,
      })
    }
  },

  async listOffersForListing(listingId) {
    const db = await getDb()
    return db.getAllFromIndex('offers', 'listingId', listingId)
  },

  async listTradeSubmissions(status) {
    const db = await getDb()
    const all = await db.getAll('tradeSubmissions')
    return status ? all.filter((t) => t.status === status) : all
  },

  async createTradeSubmission(submission) {
    const db = await getDb()
    await db.put('tradeSubmissions', submission)
  },

  async createOffer(offer) {
    const db = await getDb()
    await db.put('offers', offer)
  },

  async seedIfEmpty() {
    const db = await getDb()
    const meta = await db.get('meta', 'status')
    if (meta?.seeded) return

    const tx = db.transaction(
      ['listings', 'images', 'carfaxReports', 'users', 'dealerProfiles', 'tradeSubmissions', 'meta'],
      'readwrite',
    )
    for (const user of seedUsers) await tx.objectStore('users').put(user)
    for (const profile of seedDealerProfiles) await tx.objectStore('dealerProfiles').put(profile)
    for (const spec of seedListingSpecs) {
      await tx.objectStore('carfaxReports').put(spec.carfax)
    }
    for (const spec of seedListingSpecs) {
      await tx.objectStore('listings').put(spec.listing)
    }
    for (const image of buildSeedImages()) {
      await tx.objectStore('images').put(image)
    }
    for (const submission of seedTradeSubmissions) {
      await tx.objectStore('tradeSubmissions').put(submission)
    }
    await tx.objectStore('meta').put({ seeded: true }, 'status')
    await tx.done

    // primaryImageId needs the images to exist first — second pass.
    for (const spec of seedListingSpecs) {
      if (spec.images.length > 0) {
        await this.updateListing(spec.listing.id, { primaryImageId: `img-${spec.listing.id}-0` })
      }
    }
  },
}
