import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import BrowseListingCard from '../components/BrowseListingCard'
import { db } from '../lib/db'
import { toBrowseListingView } from '../lib/db/mappers'
import { CURRENT_CONSUMER_ID } from '../lib/currentUser'
import type { BrowseListing } from '../data/listings'

export default function Saved() {
  const [listings, setListings] = useState<BrowseListing[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const saved = await db.listSavedListings(CURRENT_CONSUMER_ID)
      const vehicles = await Promise.all(
        saved.map(async (row) => {
          const listing = await db.getListing(row.listingId)
          return listing ? toBrowseListingView(listing) : null
        }),
      )
      if (!cancelled) {
        setListings(vehicles.filter((v): v is BrowseListing => v !== null))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (listings === null) {
    return null
  }

  if (listings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Icon name="favorite" className="text-[28px]" />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No saved vehicles yet</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
          Tap the heart on any listing in Browse to save it here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md pt-space-md pb-space-xs">
        <span className="text-body-sm font-body-sm text-on-surface-variant">
          {listings.length} saved {listings.length === 1 ? 'vehicle' : 'vehicles'}
        </span>
      </div>
      <div className="px-space-md py-space-sm flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {listings.map((listing) => (
          <BrowseListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
