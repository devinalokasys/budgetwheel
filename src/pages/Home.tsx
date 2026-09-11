import Icon from '../components/Icon'
import FeaturedDealCard from '../components/FeaturedDealCard'
import { featuredDeals } from '../data/listings'

const categories = [
  { label: 'SUVs', icon: 'directions_car' },
  { label: 'Sedans', icon: 'directions_car' },
  { label: 'Trucks', icon: 'local_shipping' },
  { label: 'Electric / EV', icon: 'electric_car' },
  { label: 'Luxury', icon: 'workspace_premium' },
  { label: 'Hatchback', icon: 'directions_car' },
]

const stats = [
  { value: '150k+', label: 'Cars Sold', tone: 'text-on-surface' },
  { value: 'Verified', label: 'Dealers Only', tone: 'text-primary' },
  { value: 'Free', label: 'Carfax Reports', tone: 'text-secondary' },
  { value: '100%', label: 'Escrow Wire', tone: 'text-on-surface' },
]

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md pt-space-md pb-space-lg flex flex-col gap-space-lg">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-xl flex flex-col gap-space-md">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-space-xs relative z-10">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                Precision Market Engine
              </span>
            </div>
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight leading-tight">
              Find your machine.
              <br />
              <span className="text-primary">Under market value.</span>
            </h2>
          </div>
          <form
            className="flex flex-col gap-space-sm relative z-10"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex items-center">
              <Icon
                name="directions_car"
                className="absolute left-3 text-on-surface-variant text-[20px]"
              />
              <input
                className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
                placeholder="Make, Model, or Keyword"
                type="text"
              />
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="relative flex items-center">
                <Icon
                  name="payments"
                  className="absolute left-3 text-on-surface-variant text-[20px]"
                />
                <select
                  defaultValue=""
                  className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container shadow-inner appearance-none cursor-pointer"
                >
                  <option value="">Max Price</option>
                  <option value="15000">Under $15,000</option>
                  <option value="25000">Under $25,000</option>
                  <option value="35000">Under $35,000</option>
                  <option value="50000">Under $50,000</option>
                  <option value="75000">Under $75,000</option>
                </select>
                <Icon
                  name="expand_more"
                  className="absolute right-3 pointer-events-none text-on-surface-variant text-[18px]"
                />
              </div>
              <div className="relative flex items-center">
                <Icon
                  name="location_on"
                  className="absolute left-3 text-on-surface-variant text-[20px]"
                />
                <input
                  className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
                  placeholder="Zip + Radius"
                  type="text"
                />
              </div>
            </div>
            <button
              className="w-full h-12 mt-space-xs bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-lg flex items-center justify-center gap-space-xs shadow-lg hover:brightness-110 active:scale-[0.99] transition-all"
              type="submit"
            >
              <Icon name="search" className="text-[20px]" />
              <span>Search 45,820 Vehicles</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="relative overflow-hidden bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center mb-space-sm">
              <Icon name="directions_car" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Buy a Car</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                Browse 45,000+ verified listings
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1 text-primary font-label-sm text-label-sm">
              <span>Explore inventory</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </div>
          </div>
          <div className="relative overflow-hidden bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center mb-space-sm">
              <Icon name="sell" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Sell Your Car
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                Instant Carfax valuation &amp; cash offer
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1 text-secondary font-label-sm text-label-sm">
              <span>Get cash estimate</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-sm overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between min-w-[390px] px-space-xs gap-space-sm text-center">
            {stats.map((stat, i) => (
              <div key={stat.label} className="contents">
                {i > 0 && <div className="w-px h-6 bg-surface-variant" />}
                <div className="flex flex-col items-center flex-1">
                  <span className={`font-headline-sm text-headline-sm ${stat.tone}`}>
                    {stat.value}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Browse by Category
            </h3>
            <span className="font-label-sm text-label-sm text-primary cursor-pointer">
              View All
            </span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs">
            {categories.map((category) => (
              <button
                key={category.label}
                className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all text-on-surface group"
              >
                <Icon
                  name={category.icon}
                  className="text-[28px] text-on-surface-variant group-hover:text-primary transition-colors"
                />
                <span className="font-label-md text-label-md mt-1">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="local_fire_department" className="text-secondary text-[20px]" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Featured Deals
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-outline">Austin • 50 mi</span>
          </div>
          <div className="flex gap-space-md overflow-x-auto pb-space-xs snap-x snap-mandatory scrollbar-none">
            {featuredDeals.map((listing) => (
              <FeaturedDealCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-surface-container-low to-surface-container p-space-md rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center">
              <Icon name="verified" className="text-[24px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Free Instant Carfax
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Included on every single listing
              </span>
            </div>
          </div>
          <Icon name="chevron_right" className="text-outline text-[20px]" />
        </div>
      </div>
    </div>
  )
}
