// Pure form-to-domain-object conversion logic, extracted out of inline
// JSX event handlers in Sell.tsx / ListingDetail.tsx / ConversationThread.tsx
// so it's unit-testable without mounting those (out-of-scope) pages. Each
// page still owns its own user/thread/listing presence guards — only the
// actual coercion/validation logic lives here.

import type { Condition, Message, Offer, TradeSubmission } from './db/schema'

const HOUR = 60 * 60 * 1000

export function buildTradeSubmissionInput(
  form: FormData,
  opts: { sellerId: string; condition: Condition; now?: number },
): TradeSubmission {
  const now = opts.now ?? Date.now()
  return {
    id: `trade-${crypto.randomUUID()}`,
    sellerId: opts.sellerId,
    vin: String(form.get('vin') ?? '').toUpperCase(),
    year: Number(form.get('year')),
    make: String(form.get('make')),
    model: String(form.get('model')),
    trim: String(form.get('trim') || '') || null,
    mileage: Number(form.get('mileage')),
    condition: opts.condition,
    carfaxReportId: null,
    imageIds: [],
    kbbEstimateCents: null,
    aiRecommendationCents: null,
    status: 'open',
    biddingClosesAt: now + 48 * HOUR,
    createdAt: now,
  }
}

export function buildPurchaseOfferInput(opts: {
  listingId: string
  sellerId: string
  fromUserId: string
  offerAmount: string
  offerMessage: string
  now?: number
}): Offer {
  const now = opts.now ?? Date.now()
  return {
    id: `offer-${crypto.randomUUID()}`,
    kind: 'purchase_offer',
    listingId: opts.listingId,
    tradeSubmissionId: null,
    fromUserId: opts.fromUserId,
    toUserId: opts.sellerId,
    amountCents: Math.round(Number(opts.offerAmount) * 100),
    status: 'pending',
    message: opts.offerMessage || null,
    createdAt: now,
    respondedAt: null,
  }
}

// listing.price is a pre-formatted display string like "$33,800" (dollars,
// not cents — see mappers.ts's formatUsd) — this is only ever used as a
// suggested-offer-amount input placeholder, in the same dollar units as
// the offerAmount field buildPurchaseOfferInput above reads.
export function parseDisplayedPriceDollars(priceLabel: string): number {
  return Math.round(Number(priceLabel.replace(/[^0-9.]/g, '')) || 0)
}

// Returns null (meaning "don't send") for a whitespace-only body — the
// page's own user/thread presence guards stay inline, since those are
// orchestration wiring, not validation logic.
export function buildMessageInput(opts: {
  conversationId: string
  senderId: string
  body: string
  now?: number
}): Message | null {
  const trimmed = opts.body.trim()
  if (!trimmed) return null
  const now = opts.now ?? Date.now()
  return {
    id: `msg-${crypto.randomUUID()}`,
    conversationId: opts.conversationId,
    senderId: opts.senderId,
    body: trimmed,
    createdAt: now,
    readAt: null,
  }
}
