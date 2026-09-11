// Domain schema shared by every DataProvider backend. See docs/db-design.md
// for the full field-by-field design rationale.

export type SellerType = 'private' | 'dealer'
export type ListingStatus = 'draft' | 'active' | 'pending' | 'sold'
export type BodyType = 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'ev' | 'other'
export type Condition = 'excellent' | 'good' | 'fair'
export type TitleStatus = 'clean' | 'salvage' | 'rebuilt' | 'lemon' | 'flood'

export interface User {
  id: string
  type: 'consumer' | 'dealer'
  email: string
  displayName: string
  photoUrl: string | null
  phone: string | null
  createdAt: number
}

export interface DealerProfile {
  userId: string
  businessName: string
  licenseNumber: string
  certifiedPartnerId: string | null
  tier: 'standard' | 'premier'
  verified: boolean
  rating: number | null
  address: { street: string; city: string; state: string; zip: string }
  logoImageId: string | null
}

export interface VehicleListing {
  id: string
  sellerId: string
  sellerType: SellerType
  status: ListingStatus
  vin: string
  year: number
  make: string
  model: string
  trim: string | null
  bodyType: BodyType
  mileage: number
  priceCents: number
  marketAvgCents: number | null
  monthlyEstimateCents: number | null
  condition: Condition
  exteriorColor: string | null
  transmission: string | null
  drivetrain: string | null
  engine: string | null
  zeroToSixtySec: number | null
  description: string
  location: { city: string; state: string; zip: string; lat: number | null; lng: number | null }
  carfaxReportId: string | null
  primaryImageId: string | null
  viewCount: number
  saveCount: number
  inquiryCount: number
  listedAt: number
  updatedAt: number
  soldAt: number | null
}

export type ImageOwnerType = 'listing' | 'dealer-logo' | 'trade-submission'
export type ImageStorageKind = 'static' | 'blob' | 'remote'

export interface VehicleImage {
  id: string
  ownerType: ImageOwnerType
  ownerId: string
  order: number
  width: number | null
  height: number | null
  storageKind: ImageStorageKind
  staticPath: string | null
  blobKey: string | null
  remoteUrl: string | null
  remotePath: string | null
}

export interface CarfaxReport {
  id: string
  vin: string
  ownerCount: number
  accidentCount: number
  titleStatus: TitleStatus
  serviceRecordCount: number
  lastServiceDate: number | null
  externalReportUrl: string | null
  fetchedAt: number
}

export interface SavedListing {
  id: string
  userId: string
  listingId: string
  createdAt: number
}

export interface SavedSearch {
  id: string
  userId: string
  query: {
    make?: string
    model?: string
    priceMaxCents?: number
    bodyType?: BodyType
    zip?: string
    radiusMi?: number
  }
  alertsEnabled: boolean
  createdAt: number
}

export interface Conversation {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  lastMessageAt: number
  lastMessagePreview: string
  unreadCountBuyer: number
  unreadCountSeller: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: number
  readAt: number | null
}

export type OfferKind = 'purchase_offer' | 'trade_bid'
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered'

export interface Offer {
  id: string
  kind: OfferKind
  listingId: string | null
  tradeSubmissionId: string | null
  fromUserId: string
  toUserId: string
  amountCents: number
  status: OfferStatus
  message: string | null
  createdAt: number
  respondedAt: number | null
}

export type TradeSubmissionStatus = 'open' | 'accepted' | 'closed'

export interface TradeSubmission {
  id: string
  sellerId: string
  vin: string
  year: number
  make: string
  model: string
  trim: string | null
  mileage: number
  condition: Condition
  carfaxReportId: string | null
  imageIds: string[]
  kbbEstimateCents: number | null
  aiRecommendationCents: number | null
  status: TradeSubmissionStatus
  biddingClosesAt: number | null
  createdAt: number
}
