import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import DesktopHeader from '../components/DesktopHeader'
import DesktopFooter from '../components/DesktopFooter'
import { telemetryMetrics, categories } from '../data/homeDesktop'
import { db } from '../lib/db'
import { toShowcaseListingView, type ShowcaseListingView } from '../lib/db/mappers'

const metricTone: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
}

const categoryTone: Record<string, string> = {
  primary: 'bg-primary-container/15 text-primary group-hover:text-primary',
  secondary: 'bg-secondary/15 text-secondary group-hover:text-secondary',
  tertiary: 'bg-tertiary/15 text-tertiary group-hover:text-tertiary',
  'primary-fixed-dim': 'bg-primary/10 text-primary-fixed-dim group-hover:text-primary-fixed-dim',
}

const pillTone: Record<string, string> = {
  secondary: 'text-secondary',
  primary: 'text-primary',
  'on-surface': 'text-on-surface',
}

const sellerTone: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
}

export default function HomeDesktop() {
  const navigate = useNavigate()
  const [budget, setBudget] = useState(35000)
  const [showcaseCards, setShowcaseCards] = useState<ShowcaseListingView[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      await db.seedIfEmpty()
      const listings = await db.listListings({ status: 'active' })
      const views = await Promise.all(listings.slice(0, 4).map(toShowcaseListingView))
      if (!cancelled) setShowcaseCards(views)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-background font-body-md text-body-md text-on-background antialiased min-h-screen">
      <DesktopHeader active="browse" />

      <main className="w-full pt-20 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <section className="relative w-full overflow-hidden bg-surface-container-lowest py-space-xl">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
            <div className="relative w-full max-w-[1600px] mx-auto px-gutter flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low shadow-sm mb-space-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Verified Buyers &amp; Sellers
                </span>
              </div>

              <h1 className="font-display-hero text-display-hero text-on-surface max-w-4xl tracking-tight">
                A Car Marketplace Built on{' '}
                <span className="text-primary">Trust</span>, Not Just Price.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-sm mb-space-xl">
                Verified accounts, transparent vehicle history reports, and direct messaging
                between buyers and sellers — private-party and dealer listings, side by side.
              </p>

              <div className="w-full max-w-5xl rounded-xl bg-surface-container-low p-space-md shadow-2xl">
                <div className="flex items-center gap-2 pb-space-md overflow-x-auto">
                  <button className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center gap-2 shadow-md transition-all">
                    <Icon name="directions_car" className="text-[18px]" />
                    <span>All Inventory</span>
                  </button>
                  <button className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-2 transition-colors">
                    <Icon name="verified" className="text-[18px]" />
                    <span>Certified Pre-Owned</span>
                  </button>
                  <button className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-2 transition-colors">
                    <Icon name="bolt" className="text-[18px]" />
                    <span>EV &amp; Hybrid</span>
                  </button>
                  <button
                    onClick={() => navigate('/browse?priceMaxCents=2000000')}
                    className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-2 transition-colors"
                  >
                    <Icon name="savings" className="text-[18px]" />
                    <span>Under $20,000</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm text-left">
                  <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
                      Make &amp; Model
                    </label>
                    <div className="flex items-center gap-2">
                      <Icon name="manage_search" className="text-primary text-[20px]" />
                      <input
                        className="w-full bg-transparent font-headline-sm text-headline-sm text-on-surface placeholder:text-outline-variant focus:outline-none"
                        placeholder="e.g. BMW, Tesla, Toyota..."
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                        Max Budget
                      </label>
                      <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                        ${budget.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        className="w-full accent-primary bg-surface-container h-1.5 rounded-lg cursor-pointer"
                        max={95000}
                        min={10000}
                        step={2500}
                        type="range"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
                      Body Architecture
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm text-on-surface">Sedan, SUV • (2)</span>
                      <Icon name="keyboard_arrow_down" className="text-outline text-[20px]" />
                    </div>
                  </div>
                  <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
                      Radius • Zip
                    </label>
                    <div className="flex items-center gap-2">
                      <Icon name="near_me" className="text-secondary text-[20px]" />
                      <input
                        className="w-full bg-transparent font-headline-sm text-headline-sm text-on-surface focus:outline-none"
                        type="text"
                        defaultValue="Austin, TX • 50 mi"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-space-md pt-space-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { icon: 'check_circle', tone: 'secondary', label: 'Clean Title Only' },
                      { icon: 'verified_user', tone: 'secondary', label: '1-Owner History' },
                      { icon: 'trending_down', tone: 'tertiary', label: 'Price Drop < 48h' },
                      { icon: 'money_off', tone: 'outline', label: 'Zero Dealer Doc Fees' },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Icon
                          name={chip.icon}
                          className={`text-[16px] ${chip.tone === 'secondary' ? 'text-secondary' : chip.tone === 'tertiary' ? 'text-tertiary' : 'text-outline'}`}
                        />
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/browse?priceMaxCents=${budget * 100}`)}
                    className="w-full md:w-auto px-8 py-3.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center gap-3 shadow-lg shadow-primary-container/25 transition-all"
                  >
                    <Icon name="search" className="text-[22px]" />
                    <span>Search Inventory</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full bg-surface-container-low py-space-md shadow-sm">
            <div className="w-full max-w-[1600px] mx-auto px-gutter">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                {telemetryMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${metricTone[metric.tone]}`}
                    >
                      <Icon name={metric.icon} className="text-[24px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
                        {metric.value}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {metric.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full py-space-xl bg-surface">
            <div className="w-full max-w-[1600px] mx-auto px-gutter">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
                <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-space-lg shadow-md hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm uppercase tracking-wider mb-space-sm">
                      <Icon name="shopping_cart" className="text-[16px]" />
                      <span>Browse &amp; Compare</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                      Browse Real Listings. No Dealer Games.
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Every listing shows a vehicle history report and verified seller details —
                      private-party and dealer inventory side by side, with price-vs-market shown
                      up front instead of buried in a negotiation.
                    </p>
                    <div className="flex flex-col gap-space-sm mb-space-lg">
                      {[
                        'Price-vs-market comparison shown on every listing',
                        'Message sellers directly — no lead reselling to third parties',
                        'Every account signs in with a verified identity',
                      ].map((point) => (
                        <div key={point} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[12px] font-bold shrink-0">
                            ✓
                          </span>
                          <span className="font-body-md text-body-md text-on-surface">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
                    <button
                      onClick={() => navigate('/browse')}
                      className="px-6 py-3 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-headline-sm text-headline-sm flex items-center gap-2 shadow-md transition-all"
                    >
                      <span>Browse Vehicles</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                    <button className="px-5 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2 transition-colors">
                      <Icon name="compare_arrows" className="text-[18px]" />
                      <span>Launch Compare Console</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-space-lg shadow-md hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-space-sm">
                      <Icon name="monetization_on" className="text-[16px]" />
                      <span>Sell Your Car</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                      Certified Dealers Bid on Your Car.
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Submit your car's details once. Certified dealers review it and place cash
                      offers directly — you see every bid and pick the one you want, or list it
                      yourself on the marketplace instead.
                    </p>
                    <div className="p-space-md rounded-lg bg-surface-container mb-space-md">
                      <button
                        onClick={() => navigate('/sell')}
                        className="w-full px-5 py-3 rounded-lg bg-secondary-container hover:bg-secondary text-on-secondary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <Icon name="bolt" className="text-[18px]" />
                        <span>Submit Your Car</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-space-sm">
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center gap-2">
                        <Icon name="gavel" className="text-secondary text-[20px]" />
                        <span className="font-body-sm text-body-sm text-on-surface">
                          Real dealers, real bids — no fine print
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center gap-2">
                        <Icon name="storefront" className="text-primary text-[20px]" />
                        <span className="font-body-sm text-body-sm text-on-surface">
                          Or list it yourself, buyer-to-buyer
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-sm">
                    <button
                      onClick={() => navigate('/sell')}
                      className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors"
                    >
                      <span>See How Selling Works</span>
                      <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-space-xl bg-surface-container-lowest">
            <div className="w-full max-w-[1600px] mx-auto px-gutter">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary block mb-1">
                    Taxonomy Navigation
                  </span>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    Explore by Vehicle Class
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/browse')}
                  className="font-label-md text-label-md text-outline hover:text-on-surface flex items-center gap-1 transition-colors"
                >
                  <span>View All 18 Sub-Categories</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-sm">
                {categories.map((category) => (
                  <button
                    key={category.label}
                    onClick={() => navigate(`/browse?bodyType=${category.bodyType}`)}
                    className="group p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all hover:-translate-y-1 shadow-sm text-left"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-space-md group-hover:scale-110 transition-transform ${categoryTone[category.tone]}`}
                    >
                      <Icon name={category.icon} className="text-[28px]" />
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface transition-colors">
                      {category.label}
                    </h3>
                    <span className="font-label-sm text-label-sm text-outline block mt-1">{category.units}</span>
                    <span className="font-body-sm text-body-sm text-secondary mt-2 inline-block">
                      {category.from}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full py-space-xl bg-surface">
            <div className="w-full max-w-[1600px] mx-auto px-gutter">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-space-lg gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-2">
                    <Icon name="verified" className="text-[16px]" />
                    <span>Priced Below Market</span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    A Few Listings Worth a Look
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Priced below comparable listings, with a clean history and verified seller.
                  </p>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-low self-start lg:self-auto">
                  <button className="px-3.5 py-1.5 rounded-md bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                    Great Deals (&gt;$1.5k Under)
                  </button>
                  <button className="px-3.5 py-1.5 rounded-md text-outline hover:text-on-surface font-label-sm text-label-sm transition-colors">
                    Newly Listed &lt;24h
                  </button>
                  <button className="px-3.5 py-1.5 rounded-md text-outline hover:text-on-surface font-label-sm text-label-sm transition-colors">
                    Electric Priority
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
                {showcaseCards.map((card) => (
                  <div
                    key={card.id}
                    className="group flex flex-col rounded-xl bg-surface-container-low overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative w-full h-56 bg-surface-container-highest overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={card.image}
                        alt={card.title}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm shadow-md">
                        <Icon name={card.dealPill.icon} className="text-[14px]" />
                        <span>{card.dealPill.label}</span>
                      </div>
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-dim/80 backdrop-blur-md text-on-surface hover:text-error flex items-center justify-center transition-colors shadow-sm">
                        <Icon name="favorite" className="text-[18px]" />
                      </button>
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-surface-dim/90 backdrop-blur-md font-label-sm text-label-sm flex items-center gap-1">
                        <Icon name={card.bottomPill.icon} className={`text-[14px] ${pillTone[card.bottomPill.tone]}`} />
                        <span className={pillTone[card.bottomPill.tone]}>{card.bottomPill.label}</span>
                      </div>
                    </div>
                    <div className="p-space-md flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between text-outline font-label-sm text-label-sm mb-1">
                          <span>{card.location}</span>
                          <span className={`font-semibold ${sellerTone[card.sellerTone]}`}>{card.sellerType}</span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{card.subtitle}</p>
                        <div className="grid grid-cols-2 gap-2 my-space-sm">
                          {card.specs.map((spec) => (
                            <div key={spec.label} className="p-2 rounded bg-surface-container">
                              <span className="block font-label-sm text-label-sm text-outline">{spec.label}</span>
                              <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-space-xs">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <span className="font-headline-lg text-headline-lg text-on-surface">{card.price}</span>
                            <span className="font-body-sm text-body-sm text-outline block">{card.priceNote}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-label-numeric-md text-label-numeric-md text-secondary block">
                              {card.monthlyEstimate}
                            </span>
                            <span className="font-body-sm text-body-sm text-outline">{card.term}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors">
                            <Icon name="compare_arrows" className="text-[16px]" />
                            <span>Compare</span>
                          </button>
                          <button
                            onClick={() => navigate(`/listing/${card.id}`)}
                            className="py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-label-md flex items-center justify-center gap-1 transition-colors shadow-sm"
                          >
                            <span>View Details</span>
                            <Icon name="arrow_forward" className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <DesktopFooter />
    </div>
  )
}
