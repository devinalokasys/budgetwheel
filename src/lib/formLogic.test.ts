import { it, expect, describe } from 'vitest'
import {
  buildTradeSubmissionInput,
  buildPurchaseOfferInput,
  parseDisplayedPriceDollars,
  buildMessageInput,
} from './formLogic'

describe('buildTradeSubmissionInput', () => {
  function fullForm() {
    const form = new FormData()
    form.set('vin', 'abc123')
    form.set('year', '2021')
    form.set('make', 'Toyota')
    form.set('model', 'Camry')
    form.set('trim', 'SE')
    form.set('mileage', '32000')
    return form
  }

  it('builds a full TradeSubmission with VIN uppercased and numeric fields coerced', () => {
    const result = buildTradeSubmissionInput(fullForm(), {
      sellerId: 'seller-1',
      condition: 'excellent',
      now: 1_700_000_000_000,
    })
    expect(result).toEqual({
      id: expect.stringMatching(/^trade-/),
      sellerId: 'seller-1',
      vin: 'ABC123',
      year: 2021,
      make: 'Toyota',
      model: 'Camry',
      trim: 'SE',
      mileage: 32000,
      condition: 'excellent',
      carfaxReportId: null,
      imageIds: [],
      kbbEstimateCents: null,
      aiRecommendationCents: null,
      status: 'open',
      biddingClosesAt: 1_700_000_000_000 + 48 * 60 * 60 * 1000,
      createdAt: 1_700_000_000_000,
    })
  })

  it('defaults a missing VIN to an empty string rather than the literal "null"', () => {
    const form = fullForm()
    form.delete('vin')
    const result = buildTradeSubmissionInput(form, { sellerId: 's1', condition: 'good', now: 1 })
    expect(result.vin).toBe('')
  })

  it('converts an empty trim to null', () => {
    const form = fullForm()
    form.set('trim', '')
    const result = buildTradeSubmissionInput(form, { sellerId: 's1', condition: 'good', now: 1 })
    expect(result.trim).toBeNull()
  })

  it('preserves a non-empty trim', () => {
    const form = fullForm()
    form.set('trim', 'XLE')
    const result = buildTradeSubmissionInput(form, { sellerId: 's1', condition: 'good', now: 1 })
    expect(result.trim).toBe('XLE')
  })

  it('defaults now to the real current time when not provided', () => {
    const before = Date.now()
    const result = buildTradeSubmissionInput(fullForm(), { sellerId: 's1', condition: 'good' })
    const after = Date.now()
    expect(result.createdAt).toBeGreaterThanOrEqual(before)
    expect(result.createdAt).toBeLessThanOrEqual(after)
    expect(result.biddingClosesAt).toBe(result.createdAt + 48 * 60 * 60 * 1000)
  })
})

describe('buildPurchaseOfferInput', () => {
  it('builds a pending purchase offer with the amount converted to cents', () => {
    const result = buildPurchaseOfferInput({
      listingId: 'l1',
      sellerId: 'seller-1',
      fromUserId: 'buyer-1',
      offerAmount: '25000',
      offerMessage: 'Can you do this price?',
      now: 1_700_000_000_000,
    })
    expect(result).toEqual({
      id: expect.stringMatching(/^offer-/),
      kind: 'purchase_offer',
      listingId: 'l1',
      tradeSubmissionId: null,
      fromUserId: 'buyer-1',
      toUserId: 'seller-1',
      amountCents: 2500000,
      status: 'pending',
      message: 'Can you do this price?',
      createdAt: 1_700_000_000_000,
      respondedAt: null,
    })
  })

  it('rounds a fractional-cent offer amount to the nearest cent', () => {
    const result = buildPurchaseOfferInput({
      listingId: 'l1',
      sellerId: 's1',
      fromUserId: 'b1',
      offerAmount: '99.999',
      offerMessage: '',
      now: 1,
    })
    expect(result.amountCents).toBe(10000)
  })

  it('converts an empty message to null', () => {
    const result = buildPurchaseOfferInput({
      listingId: 'l1',
      sellerId: 's1',
      fromUserId: 'b1',
      offerAmount: '100',
      offerMessage: '',
      now: 1,
    })
    expect(result.message).toBeNull()
  })

  it('defaults now to the real current time when not provided', () => {
    const before = Date.now()
    const result = buildPurchaseOfferInput({
      listingId: 'l1',
      sellerId: 's1',
      fromUserId: 'b1',
      offerAmount: '100',
      offerMessage: '',
    })
    const after = Date.now()
    expect(result.createdAt).toBeGreaterThanOrEqual(before)
    expect(result.createdAt).toBeLessThanOrEqual(after)
  })
})

describe('parseDisplayedPriceDollars', () => {
  it('strips currency formatting down to a plain number', () => {
    expect(parseDisplayedPriceDollars('$33,800')).toBe(33800)
  })

  it('falls back to 0 for a malformed, multi-decimal-point price string', () => {
    expect(parseDisplayedPriceDollars('$1.2.3')).toBe(0)
  })

  it('returns 0 for a string with no digits at all', () => {
    expect(parseDisplayedPriceDollars('N/A')).toBe(0)
  })
})

describe('buildMessageInput', () => {
  it('builds a message with the body trimmed', () => {
    const result = buildMessageInput({
      conversationId: 'c1',
      senderId: 'u1',
      body: '  hello there  ',
      now: 1_700_000_000_000,
    })
    expect(result).toEqual({
      id: expect.stringMatching(/^msg-/),
      conversationId: 'c1',
      senderId: 'u1',
      body: 'hello there',
      createdAt: 1_700_000_000_000,
      readAt: null,
    })
  })

  it('returns null for a whitespace-only body', () => {
    expect(buildMessageInput({ conversationId: 'c1', senderId: 'u1', body: '   ' })).toBeNull()
  })

  it('returns null for an empty body', () => {
    expect(buildMessageInput({ conversationId: 'c1', senderId: 'u1', body: '' })).toBeNull()
  })

  it('defaults now to the real current time when not provided', () => {
    const before = Date.now()
    const result = buildMessageInput({ conversationId: 'c1', senderId: 'u1', body: 'hi' })
    const after = Date.now()
    expect(result?.createdAt).toBeGreaterThanOrEqual(before)
    expect(result?.createdAt).toBeLessThanOrEqual(after)
  })
})
