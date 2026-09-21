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

export interface ListingFilter {
  make?: string
  bodyType?: VehicleListing['bodyType']
  priceMaxCents?: number
  sellerType?: VehicleListing['sellerType']
  status?: VehicleListing['status']
  sellerId?: string
}

// A single interface both the local (IndexedDB) and Firestore backends
// implement identically, so the rest of the app never knows which one is
// active. Only the methods the app actually uses are implemented fully
// end-to-end right now (listings, images, Carfax reports, saved listings,
// dealer inventory) — see docs/db-design.md's "Not yet done" for what's
// schema-only (Messages/Offers/TradeSubmission) versus wired to UI.
export interface DataProvider {
  // Listings
  listListings(filter?: ListingFilter): Promise<VehicleListing[]>
  getListing(id: string): Promise<VehicleListing | null>
  createListing(listing: VehicleListing): Promise<void>
  updateListing(id: string, patch: Partial<VehicleListing>): Promise<void>

  // Images
  listImages(ownerType: VehicleImage['ownerType'], ownerId: string): Promise<VehicleImage[]>
  addStaticImage(image: Omit<VehicleImage, 'blobKey' | 'remoteUrl' | 'remotePath' | 'storageKind'>): Promise<void>
  uploadImage(
    ownerType: VehicleImage['ownerType'],
    ownerId: string,
    file: Blob,
    order: number,
  ): Promise<VehicleImage>
  getImageUrl(image: VehicleImage): Promise<string>

  // Carfax
  getCarfaxReportByVin(vin: string): Promise<CarfaxReport | null>
  putCarfaxReport(report: CarfaxReport): Promise<void>

  // Users / dealers
  getUser(id: string): Promise<User | null>
  putUser(user: User): Promise<void>
  getDealerProfile(userId: string): Promise<DealerProfile | null>
  putDealerProfile(profile: DealerProfile): Promise<void>

  // Saved listings (favorites)
  listSavedListings(userId: string): Promise<SavedListing[]>
  isSaved(userId: string, listingId: string): Promise<boolean>
  saveListing(userId: string, listingId: string): Promise<void>
  unsaveListing(userId: string, listingId: string): Promise<void>

  // Saved searches — schema-only consumers today, included for completeness
  listSavedSearches(userId: string): Promise<SavedSearch[]>
  putSavedSearch(search: SavedSearch): Promise<void>

  // Conversations/messages
  listConversations(userId: string): Promise<Conversation[]>
  // Returns the existing buyer/listing conversation if one exists, else
  // creates it — so re-messaging the same seller about the same listing
  // reuses one thread instead of spawning duplicates.
  getOrCreateConversation(listingId: string, buyerId: string, sellerId: string): Promise<Conversation>
  listMessages(conversationId: string): Promise<Message[]>
  sendMessage(message: Message): Promise<void>

  // Offers / trade submissions
  listOffersForListing(listingId: string): Promise<Offer[]>
  listOffersForTradeSubmission(tradeSubmissionId: string): Promise<Offer[]>
  // Status-filtered, dealer-facing (Deal Pipeline) — an unfiltered call
  // only works for a dealer under firestore.rules, since a plain consumer
  // can't prove every matching doc is theirs. Use
  // listTradeSubmissionsBySeller for a consumer's own submissions.
  listTradeSubmissions(status?: TradeSubmission['status']): Promise<TradeSubmission[]>
  listTradeSubmissionsBySeller(sellerId: string): Promise<TradeSubmission[]>
  createTradeSubmission(submission: TradeSubmission): Promise<void>
  createOffer(offer: Offer): Promise<void>

  // Dev/test convenience
  seedIfEmpty(): Promise<void>
}
