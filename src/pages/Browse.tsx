import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import BrowseListingCard from '../components/BrowseListingCard'
import { db } from '../lib/db'
import { toBrowseListingView } from '../lib/db/mappers'
import type { BrowseListing } from '../data/listings'
import type { VehicleListing } from '../lib/db/schema'

const viewModes = [
  { id: 'list', icon: 'view_agenda', label: 'List View' },
  { id: 'grid', icon: 'grid_view', label: 'Grid View' },
  { id: 'map', icon: 'map', label: 'Map View' },
] as const

const bodyTypeLabels: Record<VehicleListing['bodyType'], string> = {
  suv: 'SUV',
  sedan: 'Sedan',
  truck: 'Truck',
  coupe: 'Coupe',
  hatchback: 'Hatchback',
  ev: 'Electric / EV',
  other: 'Luxury',
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<(typeof viewModes)[number]['id']>('list')
  const [browseListings, setBrowseListings] = useState<BrowseListing[]>([])
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  const bodyType = searchParams.get('bodyType') as VehicleListing['bodyType'] | null
  const priceMaxCents = searchParams.get('priceMaxCents')
  const query = searchParams.get('q')

  useEffect(() => {
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const listings = await db.listListings({
        status: 'active',
        ...(bodyType ? { bodyType } : {}),
        ...(priceMaxCents ? { priceMaxCents: Number(priceMaxCents) } : {}),
      })
      let views = await Promise.all(listings.map(toBrowseListingView))
      if (query) {
        const q = query.toLowerCase()
        views = views.filter((v) => v.title.toLowerCase().includes(q))
      }
      if (!cancelled) setBrowseListings(views)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [bodyType, priceMaxCents, query])

  function removeParam(key: string) {
    const next = new URLSearchParams(searchParams)
    next.delete(key)
    setSearchParams(next)
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput) next.set('q', searchInput)
    else next.delete('q')
    setSearchParams(next)
  }

  function clearSearch() {
    setSearchInput('')
    removeParam('q')
  }

  const chips: { key: string; label: string; icon?: string }[] = []
  if (bodyType) chips.push({ key: 'bodyType', label: bodyTypeLabels[bodyType], icon: 'directions_car' })
  if (priceMaxCents) {
    chips.push({
      key: 'priceMaxCents',
      label: `Under ${(Number(priceMaxCents) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`,
    })
  }

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md pt-space-sm pb-space-xs flex flex-col gap-space-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Icon name="search" className="text-[20px]" />
          </div>
          <input
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:text-primary transition-all"
            placeholder="Search make, model, or body style..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Clear Search"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          )}
        </form>

        {chips.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none -mx-space-md px-space-md">
            {chips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-label-sm font-label-sm shrink-0 shadow-sm"
              >
                {chip.icon && <Icon name={chip.icon} className="text-[14px]" />}
                <span>{chip.label}</span>
                <button
                  onClick={() => removeParam(chip.key)}
                  className="flex items-center justify-center hover:text-primary transition-colors"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-space-md py-2.5 flex items-center justify-between bg-surface-container-lowest/70 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-body-sm font-body-sm text-on-surface-variant">
            Showing <strong className="text-on-surface font-semibold">{browseListings.length}</strong>{' '}
            verified {browseListings.length === 1 ? 'car' : 'cars'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center bg-surface-container px-2.5 py-1 rounded-lg text-label-sm font-label-sm text-on-surface">
            <span className="text-on-surface-variant mr-1">Sort:</span>
            <select
              defaultValue="match"
              className="bg-transparent text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer"
            >
              <option className="bg-surface-container text-on-surface" value="match">
                Best Match
              </option>
              <option className="bg-surface-container text-on-surface" value="price_low">
                Lowest Price
              </option>
              <option className="bg-surface-container text-on-surface" value="mileage">
                Lowest Mileage
              </option>
              <option className="bg-surface-container text-on-surface" value="distance">
                Nearest First
              </option>
            </select>
            <Icon
              name="expand_more"
              className="absolute right-1 pointer-events-none text-[16px] text-on-surface-variant"
            />
          </div>
          <div className="flex items-center bg-surface-container p-0.5 rounded-lg">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                title={mode.label}
                onClick={() => setViewMode(mode.id)}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  viewMode === mode.id
                    ? 'bg-surface-container-highest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name={mode.icon} className="text-[16px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {browseListings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[40vh]">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon name="search_off" className="text-[28px]" />
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">No matches</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Try clearing a filter or searching a different make or model.
          </p>
        </div>
      ) : (
        <div className="px-space-md py-space-sm flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {browseListings.map((listing) => (
            <BrowseListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
