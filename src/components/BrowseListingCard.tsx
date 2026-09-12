import Icon from './Icon'
import FavoriteButton from './FavoriteButton'
import type { BrowseListing } from '../data/listings'

const toneClasses: Record<BrowseListing['dealBadge']['tone'], string> = {
  secondary: 'bg-secondary-container/90 text-on-secondary-container',
  tertiary: 'bg-tertiary-container/90 text-on-tertiary-container',
}

export default function BrowseListingCard({ listing }: { listing: BrowseListing }) {
  return (
    <article className="w-full flex flex-col rounded-2xl bg-surface-container-low overflow-hidden shadow-lg transition-transform active:scale-[0.99] duration-150">
      <div className="relative w-full aspect-16/9 bg-surface-container-highest overflow-hidden">
        <img className="w-full h-full object-cover" src={listing.image} alt={listing.title} />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-label-sm font-label-sm uppercase tracking-wider shadow-md ${toneClasses[listing.dealBadge.tone]}`}
          >
            <Icon name={listing.dealBadge.icon} className="text-[14px]" />
            {listing.dealBadge.label}
          </span>
          <FavoriteButton listingId={listing.id} className="pointer-events-auto shadow-md" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/85 backdrop-blur-md text-primary text-label-sm font-label-sm">
          <Icon name={listing.historyPill.icon} className="text-[13px]" filled />
          <span>{listing.historyPill.label}</span>
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface leading-snug">
              {listing.title}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span>{listing.seller}</span>
              {listing.rating && (
                <span className="inline-flex items-center text-tertiary">
                  <Icon name="star" className="text-[14px]" filled />
                  <span className="font-semibold text-label-sm ml-0.5">{listing.rating}</span>
                </span>
              )}
              <span>•</span>
              <span className="text-secondary font-medium">{listing.verifiedLabel}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-end gap-0.5">
              <Icon name="location_on" className="text-[13px]" />
              {listing.distance}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 py-1">
          {listing.specs.map((spec) => (
            <div
              key={spec.label}
              className="bg-surface-container rounded-lg p-2 flex flex-col items-center justify-center text-center"
            >
              <span className="text-on-surface-variant font-label-sm text-label-sm">
                {spec.label}
              </span>
              <span className="text-on-surface font-label-numeric-md text-label-numeric-md">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                {listing.price}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                {listing.priceNote}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {listing.monthlyEstimate}
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-label-md font-semibold shadow-md hover:bg-primary transition-all flex items-center gap-1">
            <span>View Deal</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>
    </article>
  )
}
