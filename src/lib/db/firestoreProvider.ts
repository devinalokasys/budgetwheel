// Firestore + Cloud Storage-backed DataProvider — the production backend.
// Same DataProvider contract as localProvider.ts, so app code never
// branches on which one is active. Requires VITE_FIREBASE_* env vars (see
// .env.example) — no Firebase project exists for budgetwheel yet, so this
// is implemented against the schema but untested against a real project.

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, getFirestoreDb } from '../firebase'
import type { DataProvider } from './provider'
import type { VehicleImage, VehicleListing } from './schema'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export const firestoreProvider: DataProvider = {
  async listListings(filter) {
    const db = getFirestoreDb()
    const clauses = []
    if (filter?.make) clauses.push(where('make', '==', filter.make))
    if (filter?.bodyType) clauses.push(where('bodyType', '==', filter.bodyType))
    if (filter?.sellerType) clauses.push(where('sellerType', '==', filter.sellerType))
    if (filter?.status) clauses.push(where('status', '==', filter.status))
    if (filter?.sellerId) clauses.push(where('sellerId', '==', filter.sellerId))
    const snap = await getDocs(query(collection(db, 'listings'), ...clauses))
    let items = snap.docs.map((d) => d.data() as VehicleListing)
    // priceMaxCents and sort are done client-side rather than composite
    // Firestore indexes — this app's inventory size doesn't need that yet.
    if (filter?.priceMaxCents !== undefined) {
      items = items.filter((l) => l.priceCents <= filter.priceMaxCents!)
    }
    return items.sort((a, b) => b.listedAt - a.listedAt)
  },

  async getListing(id) {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, 'listings', id))
    return snap.exists() ? (snap.data() as VehicleListing) : null
  },

  async createListing(listing) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'listings', listing.id), listing)
  },

  async updateListing(id, patch) {
    const db = getFirestoreDb()
    const ref2 = doc(db, 'listings', id)
    const existing = await getDoc(ref2)
    if (!existing.exists()) throw new Error(`listing not found: ${id}`)
    await setDoc(ref2, { ...existing.data(), ...patch, updatedAt: Date.now() })
  },

  async listImages(ownerType, ownerId) {
    const db = getFirestoreDb()
    const snap = await getDocs(
      query(
        collection(db, 'images'),
        where('ownerType', '==', ownerType),
        where('ownerId', '==', ownerId),
      ),
    )
    return snap.docs.map((d) => d.data() as VehicleImage).sort((a, b) => a.order - b.order)
  },

  async addStaticImage(image) {
    const db = getFirestoreDb()
    const full: VehicleImage = {
      ...image,
      storageKind: 'static',
      blobKey: null,
      remoteUrl: null,
      remotePath: null,
    }
    await setDoc(doc(db, 'images', image.id), full)
  },

  async uploadImage(ownerType, ownerId, file, order) {
    const storage = getFirebaseStorage()
    const db = getFirestoreDb()
    const id = newId('img')
    const path = `${ownerType}s/${ownerId}/${id}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const image: VehicleImage = {
      id,
      ownerType,
      ownerId,
      order,
      width: null,
      height: null,
      storageKind: 'remote',
      staticPath: null,
      blobKey: null,
      remoteUrl: url,
      remotePath: path,
    }
    await setDoc(doc(db, 'images', id), image)
    return image
  },

  async getImageUrl(image) {
    if (image.storageKind === 'static' && image.staticPath) return image.staticPath
    if (image.storageKind === 'remote' && image.remoteUrl) return image.remoteUrl
    return ''
  },

  async getCarfaxReportByVin(vin) {
    const db = getFirestoreDb()
    const snap = await getDocs(
      query(collection(db, 'carfaxReports'), where('vin', '==', vin), fsLimit(1)),
    )
    return snap.empty ? null : (snap.docs[0].data() as any)
  },

  async putCarfaxReport(report) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'carfaxReports', report.id), report)
  },

  async getUser(id) {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, 'users', id))
    return snap.exists() ? (snap.data() as any) : null
  },

  async putUser(user) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'users', user.id), user)
  },

  async getDealerProfile(userId) {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, 'dealerProfiles', userId))
    return snap.exists() ? (snap.data() as any) : null
  },

  async putDealerProfile(profile) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'dealerProfiles', profile.userId), profile)
  },

  async listSavedListings(userId) {
    const db = getFirestoreDb()
    const snap = await getDocs(query(collection(db, 'savedListings'), where('userId', '==', userId)))
    return snap.docs.map((d) => d.data() as any)
  },

  async isSaved(userId, listingId) {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, 'savedListings', `${userId}_${listingId}`))
    return snap.exists()
  },

  async saveListing(userId, listingId) {
    const db = getFirestoreDb()
    const id = `${userId}_${listingId}`
    await setDoc(doc(db, 'savedListings', id), { id, userId, listingId, createdAt: Date.now() })
  },

  async unsaveListing(userId, listingId) {
    const db = getFirestoreDb()
    await deleteDoc(doc(db, 'savedListings', `${userId}_${listingId}`))
  },

  async listSavedSearches(userId) {
    const db = getFirestoreDb()
    const snap = await getDocs(query(collection(db, 'savedSearches'), where('userId', '==', userId)))
    return snap.docs.map((d) => d.data() as any)
  },

  async putSavedSearch(search) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'savedSearches', search.id), search)
  },

  async listConversations(userId) {
    const db = getFirestoreDb()
    const [asBuyer, asSeller] = await Promise.all([
      getDocs(query(collection(db, 'conversations'), where('buyerId', '==', userId))),
      getDocs(query(collection(db, 'conversations'), where('sellerId', '==', userId))),
    ])
    const byId = new Map<string, any>()
    for (const d of [...asBuyer.docs, ...asSeller.docs]) byId.set(d.id, d.data())
    return [...byId.values()]
  },

  async listMessages(conversationId) {
    const db = getFirestoreDb()
    const snap = await getDocs(
      query(collection(db, 'messages'), where('conversationId', '==', conversationId)),
    )
    return snap.docs.map((d) => d.data() as any).sort((a, b) => a.createdAt - b.createdAt)
  },

  async sendMessage(message) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'messages', message.id), message)
    const convoRef = doc(db, 'conversations', message.conversationId)
    const convo = await getDoc(convoRef)
    if (convo.exists()) {
      await setDoc(convoRef, {
        ...convo.data(),
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.body,
      })
    }
  },

  async listOffersForListing(listingId) {
    const db = getFirestoreDb()
    const snap = await getDocs(query(collection(db, 'offers'), where('listingId', '==', listingId)))
    return snap.docs.map((d) => d.data() as any)
  },

  async listTradeSubmissions(status) {
    const db = getFirestoreDb()
    const clauses = status ? [where('status', '==', status)] : []
    const snap = await getDocs(query(collection(db, 'tradeSubmissions'), ...clauses))
    return snap.docs.map((d) => d.data() as any)
  },

  async createTradeSubmission(submission) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'tradeSubmissions', submission.id), submission)
  },

  async createOffer(offer) {
    const db = getFirestoreDb()
    await setDoc(doc(db, 'offers', offer.id), offer)
  },

  async seedIfEmpty() {
    // No-op against real Firestore. Security rules (deliberately) reject
    // these writes from client code — seeding a live project only ever
    // happens once, via the Admin SDK script (`npm run seed:firestore`),
    // which bypasses rules entirely. The local/IndexedDB provider's
    // seedIfEmpty is the one that actually runs per-browser.
  },
}
