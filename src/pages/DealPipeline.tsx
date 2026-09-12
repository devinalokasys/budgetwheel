import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { db } from '../lib/db'
import { CURRENT_DEALER_ID } from '../lib/currentUser'
import type { TradeSubmission } from '../lib/db/schema'

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function timeRemaining(closesAt: number | null): string | null {
  if (closesAt == null) return null
  const ms = closesAt - Date.now()
  if (ms <= 0) return 'Closed'
  const hours = Math.round(ms / (60 * 60 * 1000))
  return hours < 24 ? `${hours}h remaining` : `${Math.round(hours / 24)}d remaining`
}

function SubmissionCard({ submission }: { submission: TradeSubmission }) {
  const [amount, setAmount] = useState(
    submission.aiRecommendationCents ? String(submission.aiRecommendationCents / 100) : '',
  )
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle')

  async function submitOffer() {
    const cents = Math.round(Number(amount) * 100)
    if (!cents || cents <= 0) return
    setStatus('submitting')
    await db.createOffer({
      id: `offer-${crypto.randomUUID()}`,
      kind: 'trade_bid',
      listingId: null,
      tradeSubmissionId: submission.id,
      fromUserId: CURRENT_DEALER_ID,
      toUserId: submission.sellerId,
      amountCents: cents,
      status: 'pending',
      message: null,
      createdAt: Date.now(),
      respondedAt: null,
    })
    setStatus('sent')
  }

  const remaining = timeRemaining(submission.biddingClosesAt)
  const hasEstimates = submission.kbbEstimateCents != null || submission.aiRecommendationCents != null

  return (
    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-sm">
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-14 h-14 rounded-lg bg-surface-container-lowest flex items-center justify-center text-outline shrink-0">
            <Icon name="directions_car" className="text-[24px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-on-surface truncate">
              {submission.year} {submission.make} {submission.model}
              {submission.trim ? ` ${submission.trim}` : ''}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {submission.mileage.toLocaleString('en-US')} mi • {submission.condition} condition
              {submission.vin ? ` • VIN ${submission.vin.slice(-6)}` : ''}
            </span>
          </div>
        </div>
        {remaining && (
          <span className="font-label-sm text-label-sm uppercase px-2 py-1 rounded-full bg-tertiary-container/30 text-tertiary shrink-0">
            {remaining}
          </span>
        )}
      </div>

      {hasEstimates && (
        <div className="grid grid-cols-2 gap-space-xs p-space-xs rounded bg-surface-container-lowest text-center">
          {submission.kbbEstimateCents != null && (
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">KBB Fair Value</span>
              <span className="font-label-md text-label-md text-on-surface">
                {formatUsd(submission.kbbEstimateCents)}
              </span>
            </div>
          )}
          {submission.aiRecommendationCents != null && (
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">BudgetAI Rec</span>
              <span className="font-label-md text-label-md text-secondary font-bold">
                {formatUsd(submission.aiRecommendationCents)}
              </span>
            </div>
          )}
        </div>
      )}

      {status === 'sent' ? (
        <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md pt-space-xs">
          <Icon name="check_circle" className="text-[18px]" filled />
          Offer sent — waiting on seller
        </div>
      ) : (
        <div className="flex items-center gap-space-sm pt-space-xs">
          <div className="relative flex items-center flex-1">
            <span className="absolute left-3 text-on-surface-variant font-body-md">$</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Your offer"
              className="w-full h-10 pl-7 pr-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container-low shadow-inner"
            />
          </div>
          <button
            onClick={submitOffer}
            disabled={status === 'submitting' || !amount}
            className="h-10 px-4 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-lg flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            <Icon name="gavel" className="text-[16px]" />
            {status === 'submitting' ? 'Sending…' : 'Submit Offer'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DealPipeline() {
  const [submissions, setSubmissions] = useState<TradeSubmission[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const open = await db.listTradeSubmissions('open')
      if (!cancelled) setSubmissions(open)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-space-md pb-space-xl gap-space-md">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="local_offer" className="text-primary text-[20px]" />
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Deal Pipeline</h1>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Trade-in submissions open for bidding across the marketplace.
        </p>
      </div>

      {submissions === null ? null : submissions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[40vh]">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon name="local_offer" className="text-[28px]" />
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">No open submissions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            New trade-in requests from sellers will show up here as they come in.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          {submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  )
}
