import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Placeholder from './Placeholder'
import Saved from './Saved'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'
import type { DealerProfile, Offer, TradeSubmission } from '../lib/db/schema'

const tabs = [
  { id: 'garage', label: 'My Garage', icon: 'directions_car' },
  { id: 'inquiries', label: 'Chat & Leads', icon: 'chat_bubble', dot: true },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
] as const

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

interface GarageData {
  submission: TradeSubmission
  offers: Offer[]
  topBidderName: string | null
}

function MyGarage() {
  const { user } = useAuth()
  const [data, setData] = useState<GarageData | null | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      const submissions = await db.listTradeSubmissionsBySeller(user!.uid)
      const submission = submissions[0]
      if (!submission) {
        if (!cancelled) setData(null)
        return
      }
      const offers = await db.listOffersForTradeSubmission(submission.id)
      let topBidderName: string | null = null
      if (offers.length > 0) {
        const top = offers.reduce((a, b) => (b.amountCents > a.amountCents ? b : a))
        const dealer: DealerProfile | null = await db.getDealerProfile(top.fromUserId)
        topBidderName = dealer?.businessName ?? 'A certified dealer'
      }
      if (!cancelled) setData({ submission, offers, topBidderName })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (data === undefined) return null

  if (data === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-space-sm px-space-md py-space-xl text-center min-h-[40vh]">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Icon name="directions_car" className="text-[28px]" />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No vehicles submitted</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
          Submit your car for cash offers and track dealer bids here.
        </p>
        <Link
          to="/sell"
          className="mt-space-xs px-4 h-10 flex items-center rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm"
        >
          Get Cash Offers
        </Link>
      </div>
    )
  }

  const { submission, offers, topBidderName } = data
  const topOffer = offers.length > 0 ? offers.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null

  return (
    <div className="flex flex-col gap-space-md px-gutter-sm pb-space-xl">
      <div className="bg-surface-container-low rounded-2xl p-space-md shadow-md flex flex-col gap-space-md relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              {submission.status === 'open' ? 'Open for Bids' : submission.status}
            </span>
          </div>
        </div>

        <div className="flex gap-space-md items-start">
          <div className="w-24 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 relative shadow-sm flex items-center justify-center text-on-surface-variant">
            <Icon name="directions_car" className="text-[32px]" />
            {submission.vin && (
              <div className="absolute bottom-1 right-1 bg-surface-container-lowest/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-label-sm text-on-surface">
                VIN ••{submission.vin.slice(-4)}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
              {submission.year} {submission.make} {submission.model}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {submission.trim ? `${submission.trim} • ` : ''}
              {submission.mileage.toLocaleString('en-US')} mi
            </p>
            {submission.aiRecommendationCents != null && (
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
                  {formatUsd(submission.aiRecommendationCents)}
                </span>
                <span className="font-body-sm text-body-sm text-outline">BudgetAI Estimate</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
              <Icon name="payments" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                {offers.length === 0
                  ? 'No dealer bids yet'
                  : `${offers.length} Certified Dealer Cash Bid${offers.length === 1 ? '' : 's'}`}
              </span>
              {topOffer && (
                <span className="font-body-sm text-body-sm text-secondary truncate">
                  Top offer: {formatUsd(topOffer.amountCents)} by {topBidderName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('garage')
  const { user } = useAuth()
  const [savedCount, setSavedCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    db.listSavedListings(user.uid).then((rows) => {
      if (!cancelled) setSavedCount(rows.length)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="flex flex-col w-full lg:max-w-2xl lg:mx-auto">
      <div className="px-gutter-sm pt-space-md pb-space-sm">
        <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 shadow-sm overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-label-md text-label-md text-center transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} className="text-[17px]" />
              <span>
                {tab.label}
                {tab.id === 'saved' && savedCount != null ? ` (${savedCount})` : ''}
              </span>
              {'dot' in tab && tab.dot && (
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'garage' && <MyGarage />}
      {activeTab === 'inquiries' && <Placeholder icon="chat_bubble" title="Chat & Leads" />}
      {activeTab === 'saved' && <Saved />}
    </div>
  )
}
