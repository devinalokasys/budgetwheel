import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import FavoriteButton from '../components/FavoriteButton'
import { db } from '../lib/db'
import { toListingDetailView, type ListingDetailView } from '../lib/db/mappers'
import { useAuth } from '../hooks/useAuth'

const badgeTone: Record<ListingDetailView['dealBadge']['tone'], string> = {
  secondary: 'bg-secondary-container text-on-secondary-container',
  primary: 'bg-primary-container text-on-primary-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [listing, setListing] = useState<ListingDetailView | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerSent, setOfferSent] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const raw = await db.getListing(id!)
      if (cancelled) return
      if (!raw) {
        setNotFound(true)
        return
      }
      const view = await toListingDetailView(raw)
      if (!cancelled) setListing(view)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleOfferSubmit(e: FormEvent) {
    e.preventDefault()
    if (!listing) return
    if (!user) {
      navigate('/login')
      return
    }
    setOfferSubmitting(true)
    await db.createOffer({
      id: `offer-${crypto.randomUUID()}`,
      kind: 'purchase_offer',
      listingId: listing.id,
      tradeSubmissionId: null,
      fromUserId: user.uid,
      toUserId: listing.sellerId,
      amountCents: Math.round(Number(offerAmount) * 100),
      status: 'pending',
      message: offerMessage || null,
      createdAt: Date.now(),
      respondedAt: null,
    })
    setOfferSubmitting(false)
    setOfferSent(true)
  }

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[50vh]">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Icon name="directions_car_filled" className="text-[28px]" />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Listing not found</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
          This vehicle may have sold or been removed.
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="mt-space-xs px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-label-md font-semibold"
        >
          Back to Browse
        </button>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-on-surface-variant">
        <Icon name="progress_activity" className="text-[28px] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-space-lg lg:items-start pb-space-xl">
      {/* Gallery */}
      <div className="flex flex-col gap-space-xs">
        <div className="relative w-full aspect-4/3 lg:aspect-16/10 bg-surface-container-highest overflow-hidden lg:rounded-2xl">
          <img
            className="w-full h-full object-cover"
            src={listing.images[activeImage]}
            alt={listing.title}
          />
          <FavoriteButton listingId={listing.id} className="absolute top-3 right-3 shadow-md" />
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-label-sm font-label-sm uppercase tracking-wider shadow-md ${badgeTone[listing.dealBadge.tone]}`}
          >
            <Icon name={listing.dealBadge.icon} className="text-[14px]" />
            {listing.dealBadge.label}
          </span>
        </div>
        {listing.images.length > 1 && (
          <div className="flex gap-space-xs overflow-x-auto px-space-md lg:px-0 scrollbar-none">
            {listing.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeImage ? 'border-primary' : 'border-transparent opacity-70'
                }`}
              >
                <img className="w-full h-full object-cover" src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-space-md px-space-md lg:px-0 pt-space-md lg:pt-0">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface leading-tight">
            {listing.title}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {listing.subtitle}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
            <Icon name="location_on" className="text-[15px]" />
            {listing.location}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-bold tracking-tight">
            {listing.price}
          </span>
          {listing.priceNote && (
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {listing.priceNote}
            </span>
          )}
        </div>
        {listing.monthlyEstimate && (
          <p className="font-body-sm text-body-sm text-secondary -mt-space-sm">
            {listing.monthlyEstimate}
          </p>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-space-xs">
          {listing.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-space-xs"
            >
              <Icon name={spec.icon} className="text-[18px] text-on-surface-variant shrink-0" />
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm text-on-surface-variant">{spec.label}</p>
                <p className="font-label-md text-label-md text-on-surface truncate">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carfax */}
        <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <Icon
              name={listing.carfax.status === 'available' ? 'shield' : 'hourglass_top'}
              className="text-[18px] text-secondary"
              filled
            />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Vehicle History</h2>
          </div>
          {listing.carfax.status === 'available' ? (
            <>
              <div className="grid grid-cols-2 gap-space-xs">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Title</p>
                  <p className="font-label-md text-label-md text-on-surface">{listing.carfax.titleStatus}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Owners</p>
                  <p className="font-label-md text-label-md text-on-surface">{listing.carfax.ownerCount}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Accidents</p>
                  <p className="font-label-md text-label-md text-on-surface">
                    {listing.carfax.accidentCount === 0 ? 'None reported' : listing.carfax.accidentCount}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Service records</p>
                  <p className="font-label-md text-label-md text-on-surface">
                    {listing.carfax.serviceRecordCount}
                    {listing.carfax.lastServiceDate ? ` (last ${listing.carfax.lastServiceDate})` : ''}
                  </p>
                </div>
              </div>
              {listing.carfax.reportUrl && (
                <a
                  href={listing.carfax.reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-label-sm font-label-sm text-primary underline underline-offset-2 self-start"
                >
                  View full report
                </a>
              )}
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Full history report is being prepared for this vehicle.
            </p>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
              Description
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {/* Seller */}
        <div className="rounded-xl bg-surface-container-low p-space-md flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0">
            <Icon name={listing.seller.type === 'dealer' ? 'storefront' : 'person'} className="text-[20px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md text-on-surface truncate">{listing.seller.name}</p>
            <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
              {listing.seller.verifiedLabel}
              {listing.seller.rating != null && (
                <span className="text-tertiary inline-flex items-center gap-0.5 text-on-surface-variant">
                  • <Icon name="star" className="text-[13px]" filled /> {listing.seller.rating}
                </span>
              )}
            </p>
            {listing.seller.address && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">{listing.seller.address}</p>
            )}
          </div>
        </div>

        {/* Make an offer */}
        <div className="rounded-xl border border-outline-variant p-space-md flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Make an Offer</h2>
          {offerSent ? (
            <p className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs">
              <Icon name="check_circle" className="text-[18px]" filled />
              Offer sent — the seller will be notified.
            </p>
          ) : (
            <form onSubmit={handleOfferSubmit} className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-space-xs">
                <label htmlFor="offer-amount" className="font-label-sm text-label-sm text-on-surface-variant">
                  Your offer (USD)
                </label>
                <input
                  id="offer-amount"
                  type="number"
                  required
                  min={0}
                  step={100}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
                  placeholder={String(Math.round(Number(listing.price.replace(/[^0-9.]/g, '')) || 0))}
                />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label htmlFor="offer-message" className="font-label-sm text-label-sm text-on-surface-variant">
                  Message <span className="text-outline">(optional)</span>
                </label>
                <textarea
                  id="offer-message"
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="px-4 py-2.5 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner resize-none"
                  placeholder="Anything the seller should know?"
                />
              </div>
              <button
                type="submit"
                disabled={offerSubmitting}
                className="h-12 bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-lg flex items-center justify-center gap-space-xs shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                <Icon name="local_offer" className="text-[18px]" />
                {offerSubmitting ? 'Sending…' : user ? 'Send Offer' : 'Sign in to make an offer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
