import { useState } from 'react'
import Icon from '../components/Icon'
import BrowseListingCard from '../components/BrowseListingCard'
import { browseListings } from '../data/listings'

const filterChips = [
  { id: 'price', label: 'Under $35,000', removable: true },
  { id: 'clean-title', label: 'Clean Title Only', removable: false },
  { id: 'body', label: 'SUV & Sedan', removable: true, icon: 'directions_car' },
  { id: 'distance', label: '< 50 mi', removable: true, icon: 'near_me' },
]

const viewModes = [
  { id: 'list', icon: 'view_agenda', label: 'List View' },
  { id: 'grid', icon: 'grid_view', label: 'Grid View' },
  { id: 'map', icon: 'map', label: 'Map View' },
] as const

export default function Browse() {
  const [activeChips, setActiveChips] = useState(filterChips.map((c) => c.id))
  const [viewMode, setViewMode] = useState<(typeof viewModes)[number]['id']>('list')

  const removeChip = (id: string) => setActiveChips((chips) => chips.filter((c) => c !== id))

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md pt-space-sm pb-space-xs flex flex-col gap-space-sm">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Icon name="search" className="text-[20px]" />
          </div>
          <input
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:text-primary transition-all"
            placeholder="Search make, model, or body style..."
            defaultValue="SUV, Sedan • Clean Title"
            type="text"
          />
          <button
            aria-label="Clear Search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none -mx-space-md px-space-md">
          {filterChips
            .filter((chip) => activeChips.includes(chip.id))
            .map((chip) =>
              chip.id === 'clean-title' ? (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-label-sm font-label-sm shrink-0 shadow-[0_2px_10px_rgba(47,111,235,0.4)]"
                >
                  <Icon name="verified_user" className="text-[14px]" filled />
                  <span>{chip.label}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-on-primary-container animate-pulse" />
                </div>
              ) : (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-label-sm font-label-sm shrink-0 shadow-sm"
                >
                  {chip.icon && <Icon name={chip.icon} className="text-[14px]" />}
                  <span>{chip.label}</span>
                  {chip.removable && (
                    <button
                      onClick={() => removeChip(chip.id)}
                      className="flex items-center justify-center hover:text-primary transition-colors"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  )}
                </div>
              ),
            )}
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-primary text-label-sm font-label-sm shrink-0 hover:bg-surface-container-high transition-colors">
            <Icon name="tune" className="text-[14px]" />
            <span>All Filters</span>
          </button>
        </div>
      </div>

      <div className="px-space-md py-2.5 flex items-center justify-between bg-surface-container-lowest/70 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-body-sm font-body-sm text-on-surface-variant">
            Showing <strong className="text-on-surface font-semibold">{browseListings.length}</strong>{' '}
            verified cars
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

      <div className="px-space-md py-space-sm flex flex-col gap-space-md">
        {browseListings.map((listing) => (
          <BrowseListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
