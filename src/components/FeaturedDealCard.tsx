import Icon from './Icon'
import FavoriteButton from './FavoriteButton'
import type { Listing } from '../data/listings'

const toneText: Record<Listing['dealBadge']['tone'], string> = {
  secondary: 'text-secondary',
  primary: 'text-primary',
  tertiary: 'text-tertiary',
}

export default function FeaturedDealCard({ listing }: { listing: Listing }) {
  return (
    <div className="w-[82vw] max-w-[340px] flex-shrink-0 snap-center bg-surface-container rounded-xl overflow-hidden shadow-xl flex flex-col">
      <div className="relative w-full h-44 bg-surface-container-highest">
        <img className="w-full h-full object-cover" src={listing.image} alt={listing.title} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          <div
            className={`bg-surface-container-lowest/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 ${toneText[listing.dealBadge.tone]}`}
          >
            <Icon name={listing.dealBadge.icon} className="text-[14px]" />
            <span className="font-label-sm text-label-sm font-bold">
              {listing.dealBadge.label}
            </span>
          </div>
        </div>
        <FavoriteButton listingId={listing.id} className="absolute top-3 right-3" />
        <div className="absolute bottom-2 left-2 bg-surface-container-lowest/80 backdrop-blur-sm px-2 py-0.5 rounded text-on-surface-variant font-label-sm text-label-sm">
          {listing.location}
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm flex-1 justify-between">
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface truncate">
            {listing.title}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {listing.subtitle}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-xs bg-surface-container-lowest p-space-xs rounded-lg">
          {listing.specs.map((spec) => (
            <div key={spec.label} className="flex flex-col px-2 py-1">
              <span className="font-label-sm text-label-sm text-outline">{spec.label}</span>
              <span className="font-label-numeric-md text-label-numeric-md text-on-surface flex items-center gap-1">
                {spec.icon ? (
                  <>
                    <Icon name={spec.icon} className="text-[16px] text-secondary" />
                    <span className="text-secondary">{spec.value}</span>
                  </>
                ) : (
                  spec.value
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between pt-space-xs">
          <div className="flex flex-col">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {listing.price}
            </span>
            <span className="font-body-sm text-body-sm text-outline">{listing.priceNote}</span>
          </div>
          <button className="h-10 px-4 bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all">
            View Deal
          </button>
        </div>
      </div>
    </div>
  )
}
