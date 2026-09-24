import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import DesktopHeader from '../components/DesktopHeader'
import DesktopFooter from '../components/DesktopFooter'
import { documents, marketAlerts } from '../data/accountDesktop'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'
import { primaryImageUrl } from '../lib/db/mappers'
import type { Offer, TradeSubmission, VehicleListing } from '../lib/db/schema'

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function timeAgo(ms: number): string {
  const diffMin = Math.round((Date.now() - ms) / 60000)
  if (diffMin < 60) return `${Math.max(diffMin, 1)}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.round(diffHr / 24)}d ago`
}

const listingStatusLabel: Record<VehicleListing['status'], string> = {
  active: 'Live Listing',
  draft: 'Draft',
  pending: 'Pending Sale',
  sold: 'Sold',
}

interface ListingRow {
  listing: VehicleListing
  image: string
  offerCount: number
  topOffer: Offer | null
  topOfferName: string | null
}

interface TradeSubmissionRow {
  submission: TradeSubmission
  offerCount: number
  topOffer: Offer | null
  topOfferName: string | null
}

interface InquiryRow {
  conversationId: string
  buyerName: string
  listingTitle: string
  lastMessagePreview: string
  lastMessageAt: number
  unread: number
}

interface AccountData {
  listings: ListingRow[]
  tradeSubmissions: TradeSubmissionRow[]
  inquiries: InquiryRow[]
  savedSearchCount: number
}

const statTone: Record<string, string> = {
  'on-surface': 'text-on-surface',
  primary: 'text-primary',
  secondary: 'text-secondary',
}

const alertTone: Record<string, string> = {
  tertiary: 'text-tertiary',
  secondary: 'text-secondary',
  primary: 'text-primary',
}

const documentIcons: Record<'check' | 'download' | 'open_in_new', string> = {
  check: 'check',
  download: 'download',
  open_in_new: 'open_in_new',
}

export default function AccountDesktop() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [data, setData] = useState<AccountData | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const [rawListings, submissions, conversations, savedSearches] = await Promise.all([
        db.listListings({ sellerId: user!.uid }),
        db.listTradeSubmissionsBySeller(user!.uid),
        db.listConversations(user!.uid),
        db.listSavedSearches(user!.uid),
      ])

      const listings: ListingRow[] = await Promise.all(
        rawListings.map(async (listing) => {
          const [image, offers] = await Promise.all([
            primaryImageUrl(listing.id),
            db.listOffersForListing(listing.id),
          ])
          const topOffer =
            offers.length > 0 ? offers.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null
          const topOfferName = topOffer ? (await db.getUser(topOffer.fromUserId))?.displayName ?? 'A buyer' : null
          return { listing, image, offerCount: offers.length, topOffer, topOfferName }
        }),
      )

      const tradeSubmissions: TradeSubmissionRow[] = await Promise.all(
        submissions.map(async (submission) => {
          const offers = await db.listOffersForTradeSubmission(submission.id)
          const topOffer =
            offers.length > 0 ? offers.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null
          const topOfferName = topOffer
            ? (await db.getDealerProfile(topOffer.fromUserId))?.businessName ?? 'A certified dealer'
            : null
          return { submission, offerCount: offers.length, topOffer, topOfferName }
        }),
      )

      const inquiries: InquiryRow[] = await Promise.all(
        conversations
          .filter((c) => c.sellerId === user!.uid)
          .map(async (conversation) => {
            const [listing, buyer] = await Promise.all([
              db.getListing(conversation.listingId),
              db.getUser(conversation.buyerId),
            ])
            return {
              conversationId: conversation.id,
              buyerName: buyer?.displayName ?? 'A buyer',
              listingTitle: listing ? `${listing.year} ${listing.make} ${listing.model}` : 'a listing',
              lastMessagePreview: conversation.lastMessagePreview,
              lastMessageAt: conversation.lastMessageAt,
              unread: conversation.unreadCountSeller,
            }
          }),
      )
      inquiries.sort((a, b) => b.lastMessageAt - a.lastMessageAt)

      if (!cancelled) {
        setData({ listings, tradeSubmissions, inquiries, savedSearchCount: savedSearches.length })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <DesktopHeader active="account" />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-48 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-[1600px] mx-auto px-margin py-space-lg flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-label-md text-outline">
                <span className="flex items-center gap-1">
                  <Icon name="account_circle" className="text-[16px]" />
                  Account
                </span>
                <span className="text-outline-variant">/</span>
                <span className="text-primary font-semibold">My Garage &amp; Overview</span>
              </nav>
            </div>

            <div className="relative w-full rounded-2xl bg-surface-container p-space-lg lg:p-space-xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-primary-container/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-md p-1 overflow-hidden">
                      {profile?.photoUrl ? (
                        <img
                          alt="Profile avatar"
                          className="w-full h-full object-cover rounded-xl"
                          src={profile.photoUrl}
                        />
                      ) : (
                        <Icon name="account_circle" className="text-[64px] text-on-surface-variant" />
                      )}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 bg-secondary-container text-on-secondary-container rounded-full p-1 shadow-sm flex items-center justify-center"
                      title="Verified Account"
                    >
                      <Icon name="verified" className="text-[16px]" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                        {profile?.displayName ?? 'My Account'}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm uppercase">
                        Verified Account
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                        {profile?.type === 'dealer' ? 'Dealer' : 'Private Seller'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-outline flex items-center gap-2 flex-wrap">
                      <span>{profile?.email}</span>
                      {profile?.createdAt && (
                        <>
                          <span>•</span>
                          <span>
                            Member since{' '}
                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                  <button
                    onClick={() => navigate('/sell')}
                    className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-inverse-primary transition-all font-label-md text-label-md shadow-md"
                  >
                    <Icon name="add_circle" className="text-[18px]" />
                    Add Vehicle to Garage
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-label-md text-label-md">
                    <Icon name="edit_note" className="text-[18px]" />
                    Edit Profile
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-label-md text-label-md">
                    <Icon name="security" className="text-[18px]" />
                    Security
                  </button>
                </div>
              </div>

              {data && (
                <div className="mt-space-lg pt-space-md grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                  {[
                    {
                      label: 'Garage Fleet',
                      value: String(data.listings.length + data.tradeSubmissions.length),
                      unit: 'Units',
                      tone: 'on-surface',
                    },
                    {
                      label: 'Active Listings',
                      value: String(data.listings.filter((r) => r.listing.status === 'active').length),
                      unit:
                        data.listings.filter((r) => r.listing.status === 'active').length > 0
                          ? `(${formatUsd(
                              data.listings
                                .filter((r) => r.listing.status === 'active')
                                .reduce((sum, r) => sum + r.listing.priceCents, 0),
                            )} ask)`
                          : '',
                      tone: 'primary',
                    },
                    {
                      label: 'Buyer Inquiries',
                      value: String(data.inquiries.length),
                      unit: `${data.inquiries.reduce((sum, i) => sum + i.unread, 0)} Unread`,
                      tone: 'secondary',
                    },
                    {
                      label: 'Saved Alerts',
                      value: String(data.savedSearchCount),
                      unit: 'Searches',
                      tone: 'on-surface',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-surface-container-lowest/70 p-space-sm rounded-lg flex flex-col"
                    >
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className={`font-label-numeric-lg text-label-numeric-lg ${statTone[stat.tone]}`}>
                          {stat.value}
                        </span>
                        <span className="font-body-sm text-body-sm text-outline">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="garage" className="text-primary text-[24px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">My Garage Fleet</h2>
                      {data && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm ml-2">
                          {data.listings.length + data.tradeSubmissions.length} Vehicle
                          {data.listings.length + data.tradeSubmissions.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>

                  {data && data.listings.length === 0 && data.tradeSubmissions.length === 0 && (
                    <div className="bg-surface-container rounded-2xl p-space-xl flex flex-col items-center text-center gap-space-sm">
                      <div className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                        <Icon name="directions_car" className="text-[28px]" />
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Your garage is empty</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                        List a car for sale or submit it for dealer cash offers to see it here.
                      </p>
                      <button
                        onClick={() => navigate('/sell')}
                        className="mt-space-xs px-4 h-10 flex items-center rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm"
                      >
                        List a Car
                      </button>
                    </div>
                  )}

                  {data?.listings.map(({ listing, image, offerCount, topOffer, topOfferName }) => {
                    const priceNote =
                      listing.marketAvgCents != null && listing.marketAvgCents > listing.priceCents
                        ? `${formatUsd(listing.marketAvgCents - listing.priceCents)} below market`
                        : ''
                    return (
                      <div
                        key={listing.id}
                        className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md"
                      >
                        <div className="flex flex-col xl:flex-row gap-space-md justify-between items-start">
                          <div className="flex flex-col sm:flex-row gap-space-md w-full xl:w-7/12">
                            <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest">
                              <img
                                className="w-full h-full object-cover"
                                src={image}
                                alt={`${listing.year} ${listing.make} ${listing.model}`}
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1">
                                {listing.status === 'active' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container animate-ping" />
                                )}
                                {listingStatusLabel[listing.status]}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                                {listing.year} {listing.make} {listing.model}
                              </h3>
                              <span className="font-body-sm text-body-sm text-outline font-mono">
                                VIN: {listing.vin}
                              </span>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-surface-container-lowest px-2 py-1 rounded">
                                  <span className="font-label-sm text-label-sm text-outline block">Odometer</span>
                                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                    {listing.mileage.toLocaleString('en-US')} mi
                                  </span>
                                </div>
                                <div className="bg-surface-container-lowest px-2 py-1 rounded">
                                  <span className="font-label-sm text-label-sm text-outline block">Drivetrain</span>
                                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                    {listing.drivetrain ?? '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end justify-between w-full xl:w-5/12 bg-surface-container-low p-space-sm rounded-xl">
                            <div className="flex flex-col sm:text-right">
                              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">
                                Listing Price
                              </span>
                              <div className="font-label-numeric-lg text-label-numeric-lg text-primary">
                                {formatUsd(listing.priceCents)}
                              </div>
                              {priceNote && (
                                <span className="font-body-sm text-body-sm text-secondary flex items-center sm:justify-end gap-1">
                                  <Icon name="trending_up" className="text-[14px]" />
                                  {priceNote}
                                </span>
                              )}
                            </div>
                            <div className="mt-space-sm pt-space-xs w-full flex flex-col gap-1 text-left sm:text-right">
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                Top Purchase Offer:
                              </span>
                              <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                                {topOffer ? (
                                  <>
                                    {formatUsd(topOffer.amountCents)}{' '}
                                    <span className="text-body-sm font-normal text-outline">by {topOfferName}</span>
                                  </>
                                ) : (
                                  <span className="text-body-sm font-normal text-outline">No offers yet</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-lowest/80 p-space-sm rounded-xl">
                          {[
                            { icon: 'visibility', value: String(listing.viewCount), label: 'Views', tone: undefined },
                            { icon: 'bookmark', value: String(listing.saveCount), label: 'Saves', tone: undefined },
                            {
                              icon: 'forum',
                              value: String(listing.inquiryCount),
                              label: 'Inquiries',
                              tone: 'secondary' as const,
                            },
                            { icon: 'handshake', value: String(offerCount), label: 'Offers', tone: 'primary' as const },
                          ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-space-xs">
                              <Icon
                                name={stat.icon}
                                className={`text-[20px] ${stat.tone ? alertTone[stat.tone] : 'text-outline'}`}
                              />
                              <div>
                                <span
                                  className={`font-label-numeric-md text-label-numeric-md block ${stat.tone ? alertTone[stat.tone] : 'text-on-surface'}`}
                                >
                                  {stat.value}
                                </span>
                                <span className="font-body-sm text-body-sm text-outline">{stat.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                          <div className="flex flex-wrap items-center gap-space-xs">
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-inverse-primary transition-colors">
                              <Icon name="bolt" className="text-[16px]" />
                              Boost Listing
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-label-md transition-colors">
                              <Icon name="tune" className="text-[16px]" />
                              Adjust Price
                            </button>
                          </div>
                          <button
                            onClick={() => navigate(`/listing/${listing.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 font-label-md text-label-md transition-colors"
                          >
                            <Icon name="visibility" className="text-[16px]" />
                            View Listing
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {data?.tradeSubmissions.map(({ submission, offerCount, topOffer, topOfferName }) => (
                    <div
                      key={submission.id}
                      className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md"
                    >
                      <div className="flex flex-col xl:flex-row gap-space-md justify-between items-start">
                        <div className="flex flex-col sm:flex-row gap-space-md w-full xl:w-7/12">
                          <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                            <Icon name="directions_car" className="text-[40px]" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface-container-highest/90 text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                              <Icon name="lock" className="text-[14px]" />
                              {submission.status === 'open' ? 'Open for Bids' : submission.status}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                              {submission.year} {submission.make} {submission.model}
                            </h3>
                            <span className="font-body-sm text-body-sm text-outline font-mono">
                              VIN: {submission.vin}
                            </span>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-surface-container-lowest px-2 py-1 rounded">
                                <span className="font-label-sm text-label-sm text-outline block">Odometer</span>
                                <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                  {submission.mileage.toLocaleString('en-US')} mi
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest px-2 py-1 rounded">
                                <span className="font-label-sm text-label-sm text-outline block">Condition</span>
                                <span className="font-label-numeric-md text-label-numeric-md text-secondary capitalize">
                                  {submission.condition}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end justify-between w-full xl:w-5/12 bg-surface-container-low p-space-sm rounded-xl">
                          <div className="flex flex-col sm:text-right">
                            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">
                              BudgetAI Estimate
                            </span>
                            <div className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
                              {submission.aiRecommendationCents != null
                                ? formatUsd(submission.aiRecommendationCents)
                                : 'Pending'}
                            </div>
                          </div>
                          <div className="mt-space-sm pt-space-xs w-full flex flex-col gap-1 text-left sm:text-right">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              Top Dealer Bid Received:
                            </span>
                            <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                              {topOffer ? (
                                <>
                                  {formatUsd(topOffer.amountCents)}{' '}
                                  <span className="text-body-sm font-normal text-outline">by {topOfferName}</span>
                                </>
                              ) : (
                                <span className="text-body-sm font-normal text-outline">No dealer bids yet</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                        <span className="font-body-sm text-body-sm text-outline">
                          {offerCount} dealer bid{offerCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="forum" className="text-secondary text-[22px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Buyer Inquiries
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    {data?.inquiries.length === 0 && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant py-space-sm">
                        No buyer messages yet.
                      </p>
                    )}
                    {data?.inquiries.map((inquiry) => (
                      <button
                        key={inquiry.conversationId}
                        onClick={() => navigate(`/messages/${inquiry.conversationId}`)}
                        className="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm text-left"
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 font-label-md text-label-md text-primary">
                            {inquiry.buyerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-md text-label-md text-on-surface truncate">
                                {inquiry.buyerName}
                              </span>
                              {inquiry.unread > 0 && (
                                <span className="px-2 py-0.5 rounded font-label-sm text-[10px] bg-secondary-container/20 text-secondary">
                                  {inquiry.unread} New
                                </span>
                              )}
                              <span className="font-body-sm text-body-sm text-outline">
                                {timeAgo(inquiry.lastMessageAt)}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              Re: {inquiry.listingTitle}
                              {inquiry.lastMessagePreview ? ` — ${inquiry.lastMessagePreview}` : ''}
                            </p>
                          </div>
                        </div>
                        <Icon name="chevron_right" className="text-outline text-[18px] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-lg">
                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="verified" className="text-primary text-[22px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">My Documents</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon name={doc.icon} className="text-outline text-[20px]" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-md text-label-md text-on-surface truncate">
                              {doc.label}
                            </span>
                            <span
                              className={`font-body-sm text-body-sm ${doc.noteTone === 'secondary' ? 'text-secondary' : 'text-outline'}`}
                            >
                              {doc.note}
                            </span>
                          </div>
                        </div>
                        {doc.action === 'check' ? (
                          <Icon name="check" className="text-secondary text-[18px]" />
                        ) : (
                          <button
                            className="text-outline hover:text-primary transition-colors"
                            title={doc.action === 'download' ? 'Download Document' : 'View Reports'}
                          >
                            <Icon name={documentIcons[doc.action]} className="text-[18px]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-1">
                    <Icon name="upload_file" className="text-[16px]" />
                    Upload New Document
                  </button>
                </div>

                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="notifications_active" className="text-tertiary text-[22px]" />
                    <h2 className="font-headline-md text-headline-md text-on-surface">Market Alerts</h2>
                  </div>
                  <div className="flex flex-col gap-space-sm">
                    {marketAlerts.map((alert) => (
                      <label
                        key={alert.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface">{alert.label}</span>
                          <span className="font-body-sm text-body-sm text-outline">{alert.note}</span>
                        </div>
                        <input
                          defaultChecked={alert.checked}
                          className="w-5 h-5 rounded bg-surface-container border-none text-primary-container focus:ring-0"
                          type="checkbox"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DesktopFooter />
    </div>
  )
}
