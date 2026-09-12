import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { useTheme } from '../hooks/useTheme'
import {
  sidebarNav,
  desktopKpis,
  acquisitionQueue,
  floorInventoryTable,
  buyerInquiries,
  quickTools,
} from '../data/dealerDesktop'

const kpiIconTone: Record<(typeof desktopKpis)[number]['iconTone'], string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  'primary-fixed': 'text-primary-fixed',
}

const daysTone: Record<(typeof floorInventoryTable)[number]['daysTone'], string> = {
  secondary: 'bg-secondary-container/20 text-secondary',
  neutral: 'bg-surface-container text-on-surface',
  error: 'bg-error-container/20 text-error',
}

const interestedTone: Record<(typeof floorInventoryTable)[number]['interestedTone'], string> = {
  secondary: 'text-secondary',
  error: 'text-error',
}

const priceNoteTone: Record<(typeof floorInventoryTable)[number]['priceNoteTone'], string> = {
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  error: 'text-error',
}

const initialsTone: Record<(typeof buyerInquiries)[number]['initialsTone'], string> = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary/20 text-secondary',
}

const tagTone: Record<(typeof buyerInquiries)[number]['tagTone'], string> = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
}

const toolTone: Record<(typeof quickTools)[number]['tone'], string> = {
  primary: 'text-primary group-hover:text-on-primary group-hover:bg-primary',
  secondary: 'text-secondary group-hover:text-on-secondary group-hover:bg-secondary',
  tertiary: 'text-tertiary group-hover:text-on-tertiary group-hover:bg-tertiary',
  outline: 'text-outline group-hover:text-on-surface group-hover:bg-surface-bright',
}

export default function DealerConsoleDesktop() {
  const { message, trigger } = useToast()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between p-space-lg shadow-[1px_0_12px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center gap-space-sm px-space-xs">
            <img alt="BudgetWheels" className="h-8 w-auto object-contain rounded-md" src="/images/logo-brand.jpg" />
          </div>
          <div className="px-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Dealer Terminal
            </span>
            <p className="font-headline-sm text-headline-sm text-on-surface truncate">
              Apex Motor Group
            </p>
          </div>
          <nav className="flex flex-col gap-space-xs">
            {sidebarNav.map((item, i) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors ${
                  i === 0
                    ? 'bg-primary-container text-on-primary-container font-headline-sm'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-space-md">
          <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-space-xs">
              <Icon name="verified" className="text-[14px]" />
              Tier 1 Certified Dealer
            </span>
            <p className="font-body-sm text-body-sm text-outline">Floorplan cap: $450,000 active</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg font-label-md text-label-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-left"
          >
            <Icon name="arrow_back" className="text-[20px]" />
            Exit to Public Market
          </button>
        </div>
      </aside>

      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] z-40 flex items-center justify-between px-gutter-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center bg-surface-container-low rounded-lg px-space-md py-space-xs gap-space-sm w-96">
              <Icon name="search" className="text-outline text-[18px]" />
              <input
                className="bg-transparent border-none text-on-surface placeholder:text-outline text-body-sm font-body-sm w-full focus:outline-none"
                placeholder="Filter VIN, Stock #, or Customer..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <button
              onClick={() => trigger('Add Vehicle wizard opened')}
              className="bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-label-md px-space-md py-space-sm rounded-lg transition-colors flex items-center gap-space-xs"
            >
              <Icon name="add" className="text-[18px]" />
              Add Vehicle
            </button>
            <button
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
              className="p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[22px]" />
            </button>
            <button
              aria-label="Notifications"
              onClick={() => navigate('/messages')}
              className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
            </button>
            <div className="h-6 w-px bg-surface-container-high" />
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="person" className="text-on-primary text-[18px]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-on-surface">Dealer Operator</span>
                <span className="font-body-sm text-body-sm text-outline">Floor Manager</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-20 bg-surface min-h-screen">
          <div className="relative w-full px-gutter-lg py-space-lg flex flex-col gap-space-lg max-w-[1600px] mx-auto">
            <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary-container/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-48 right-1/4 w-80 h-80 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm">
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="terminal" className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Apex Motors</span>
                    <span className="font-label-sm text-label-sm uppercase px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary flex items-center gap-1">
                      <Icon name="verified" className="text-[14px]" />
                      Premier Partner #8492
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-outline truncate">
                    Automated Trading Desk • Regional Distribution Zone US-West-4
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-sm text-label-sm text-on-surface">Live Market Stream</span>
                </div>
                <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container text-on-surface-variant">
                  <Icon name="sync_alt" className="text-secondary text-[16px]" />
                  <span className="font-label-sm text-label-sm text-on-surface">
                    CDK / DealerSocket: <span className="text-secondary font-bold">Synchronized</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">(2m ago)</span>
                </div>
                <button
                  onClick={() => trigger('Audit export generated')}
                  className="bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md px-space-md py-1.5 rounded-lg transition-colors flex items-center gap-space-xs"
                >
                  <Icon name="download" className="text-[18px]" />
                  Export Audit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md relative z-10">
              <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      {desktopKpis[0].label}
                    </span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-display-hero text-display-hero text-on-surface">42</span>
                      <span className="font-label-md text-label-md text-secondary">+4 net wk</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${kpiIconTone[desktopKpis[0].iconTone]}`}>
                    <Icon name={desktopKpis[0].icon} className="text-[22px]" />
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="flex justify-between text-label-sm font-label-sm text-outline mb-1.5">
                    <span>Aging Spread</span>
                    <span className="text-on-surface">88% Under 20 Days</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div className="h-full bg-secondary" style={{ width: '72%' }} />
                    <div className="h-full bg-tertiary" style={{ width: '18%' }} />
                    <div className="h-full bg-error" style={{ width: '10%' }} />
                  </div>
                  <div className="flex items-center gap-space-md mt-2 text-body-sm font-body-sm text-outline">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />31 Prime
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />8 Fair
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />3 Watch
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      {desktopKpis[1].label}
                    </span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-display-hero text-display-hero text-on-surface">$1.28M</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${kpiIconTone[desktopKpis[1].iconTone]}`}>
                    <Icon name={desktopKpis[1].icon} className="text-[22px]" />
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs flex items-center justify-between">
                  <div className="flex items-center gap-1 text-secondary font-label-md text-label-md">
                    <Icon name="trending_up" className="text-[16px]" />
                    <span>+14.2%</span>
                    <span className="text-outline font-body-sm text-body-sm">vs Target ($1.12M)</span>
                  </div>
                  <svg className="w-20 h-6 text-secondary" fill="none" viewBox="0 0 80 24">
                    <path
                      d="M1 20L15 17L30 21L45 11L60 14L79 3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      {desktopKpis[2].label}
                    </span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-display-hero text-display-hero text-on-surface">18.4%</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${kpiIconTone[desktopKpis[2].iconTone]}`}>
                    <Icon name={desktopKpis[2].icon} className="text-[22px]" />
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-primary">Top 5% in Pacific NW</span>
                    <span className="font-body-sm text-body-sm text-outline">Avg reply: 11 mins</span>
                  </div>
                  <div className="flex items-center px-2 py-1 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm">
                    Fast Response
                  </div>
                </div>
              </div>

              <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      {desktopKpis[3].label}
                    </span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-display-hero text-display-hero text-on-surface">8.5</span>
                      <span className="font-label-numeric-md text-label-numeric-md text-outline">days</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${kpiIconTone[desktopKpis[3].iconTone]}`}>
                    <Icon name={desktopKpis[3].icon} className="text-[22px]" />
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs flex items-center justify-between">
                  <div className="flex items-center gap-1 text-secondary font-label-md text-label-md">
                    <Icon name="speed" className="text-[16px]" />
                    <span>2.1x faster</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-outline">Benchmark: 17.8d</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg relative z-10">
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-3 h-3 rounded-full bg-tertiary animate-ping" />
                      <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Private Seller Acquisitions Queue
                        </h2>
                        <p className="font-body-sm text-body-sm text-outline">
                          Direct consumer trades seeking immediate dealer cash buyout
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase px-2 py-1 rounded bg-surface-container text-on-surface">
                      {acquisitionQueue.length} Actionable Pending
                    </span>
                  </div>

                  {acquisitionQueue.map((card) => (
                    <div
                      key={card.id}
                      className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-sm transition-all hover:bg-surface-container-high"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-space-md">
                        <div className="flex items-center gap-space-md min-w-0">
                          <div className="w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-container-lowest">
                            <img className="w-full h-full object-cover" src={card.image} alt={card.title} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-space-xs flex-wrap">
                              <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                                {card.title}
                              </span>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                                {card.badge}
                              </span>
                              <span className="font-label-sm text-label-sm text-outline">{card.mileage}</span>
                            </div>
                            <span className="font-body-sm text-body-sm text-outline">
                              Seller: {card.seller} • {card.location} • Instant Valuation ID #{card.valuationId}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-label-sm text-label-sm uppercase text-outline">Customer Ask</span>
                          <p className="font-label-numeric-lg text-label-numeric-lg text-on-surface">{card.ask}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-space-xs p-space-xs rounded bg-surface-container-lowest text-center">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-outline">KBB Fair Value</span>
                          <span className="font-label-md text-label-md text-on-surface">{card.kbb}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-outline">Algo Target Buy</span>
                          <span className="font-label-md text-label-md text-primary">{card.algoTarget}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-secondary">Est. Gross Margin</span>
                          <span className="font-label-md text-label-md text-secondary">
                            {card.margin} ({card.marginPct})
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                        <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-outline">
                          <Icon
                            name={card.note.icon}
                            className={`text-[16px] ${card.note.tone === 'secondary' ? 'text-secondary' : 'text-tertiary'}`}
                          />
                          <span>{card.note.text}</span>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <button
                            onClick={() => trigger(`Countered at ${card.counterAmount} for ${card.title}`)}
                            className="bg-surface-container-lowest hover:bg-surface-bright text-on-surface font-label-md text-label-md px-space-md py-1.5 rounded-lg transition-colors"
                          >
                            Counter ({card.counterAmount})
                          </button>
                          <button
                            onClick={() => trigger(`Binding offer of ${card.offerAmount} submitted for ${card.title}`)}
                            className="bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-label-md px-space-md py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Icon name="gavel" className="text-[16px]" />
                            Submit Binding Offer ({card.offerAmount})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Live Floor Inventory Desk
                      </h2>
                      <p className="font-body-sm text-body-sm text-outline">
                        42 active vehicles • Sorted by aging risk
                      </p>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() => trigger('Inventory filter panel opened')}
                        title="Filter Inventory"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface transition-colors"
                      >
                        <Icon name="tune" className="text-[18px]" />
                      </button>
                      <button
                        onClick={() => trigger('Batch pricing adjust opened')}
                        title="Batch Pricing Adjust"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface transition-colors"
                      >
                        <Icon name="price_change" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[620px]">
                      <thead>
                        <tr className="text-label-sm font-label-sm uppercase text-outline bg-surface-container-lowest/60">
                          <th className="py-2.5 px-3 rounded-l-lg">Unit &amp; VIN</th>
                          <th className="py-2.5 px-3">Days</th>
                          <th className="py-2.5 px-3">Traffic</th>
                          <th className="py-2.5 px-3">Price Status</th>
                          <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {floorInventoryTable.map((row) => (
                          <tr key={row.id} className="hover:bg-surface-container/70 transition-colors group">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-space-sm">
                                <div className="w-12 h-9 rounded overflow-hidden flex-shrink-0 bg-surface-container">
                                  <img className="w-full h-full object-cover" src={row.image} alt={row.title} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-headline-sm text-body-md font-semibold text-on-surface truncate">
                                    {row.title}
                                  </span>
                                  <span className="font-body-sm text-body-sm text-outline">
                                    VIN: {row.vin} • {row.mileage}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm ${daysTone[row.daysTone]}`}
                              >
                                {row.daysListed} days{row.daysTone === 'error' ? ' !' : ''}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col">
                                <span className="font-label-numeric-md text-body-md text-on-surface">
                                  {row.views} views
                                </span>
                                <span className={`font-body-sm text-body-sm ${interestedTone[row.interestedTone]}`}>
                                  {row.interested}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col">
                                <span className="font-headline-sm text-body-md font-bold text-on-surface">
                                  {row.price}
                                </span>
                                <span className={`font-label-sm text-label-sm ${priceNoteTone[row.priceNoteTone]}`}>
                                  {row.priceNote}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {row.action === 'boost-edit' ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => trigger(`Boosted ${row.title}`)}
                                    title="Boost Marketplace Rank"
                                    className="p-1 rounded hover:bg-surface-bright text-outline hover:text-on-surface transition-colors"
                                  >
                                    <Icon name="rocket_launch" className="text-[18px]" />
                                  </button>
                                  <button
                                    onClick={() => trigger(`Editing price for ${row.title}`)}
                                    title="Quick Reprice"
                                    className="p-1 rounded hover:bg-surface-bright text-outline hover:text-on-surface transition-colors"
                                  >
                                    <Icon name="edit" className="text-[18px]" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => trigger(`${row.autoDiscountLabel} applied to ${row.title}`)}
                                    className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2.5 py-1 rounded transition-colors hover:bg-inverse-primary"
                                  >
                                    {row.autoDiscountLabel}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="forum" className="text-secondary text-[20px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">Live Buyer Inquiries</h2>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
                  </div>

                  {buyerInquiries.map((lead) => (
                    <div key={lead.id} className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-label-sm ${initialsTone[lead.initialsTone]}`}
                          >
                            {lead.initials}
                          </div>
                          <span className="font-headline-sm text-body-md font-semibold text-on-surface">
                            {lead.name}
                          </span>
                          <span className="font-label-sm text-label-sm text-outline">• {lead.timeAgo}</span>
                        </div>
                        <span
                          className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${tagTone[lead.tagTone]}`}
                        >
                          {lead.tag}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{lead.message}</p>
                      <div className="flex items-center gap-space-xs pt-1 flex-wrap">
                        {lead.actions.map((action) =>
                          action.icon ? (
                            <button
                              key={action.icon}
                              onClick={() => trigger(`Calling ${lead.name}`)}
                              title="Direct Phone Connect"
                              className="p-1 rounded bg-surface-container-lowest text-primary hover:bg-surface-bright transition-colors"
                            >
                              <Icon name={action.icon} className="text-[16px]" />
                            </button>
                          ) : (
                            <button
                              key={action.label}
                              onClick={() => trigger(`${action.label} — ${lead.name}`)}
                              className={`font-label-sm text-label-sm px-space-sm py-1 rounded transition-colors ${
                                action.primary
                                  ? 'bg-primary-container text-on-primary-container hover:bg-inverse-primary'
                                  : 'bg-surface-container-lowest hover:bg-surface-bright text-on-surface'
                              }`}
                            >
                              {action.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Floorplan &amp; Capital Velocity
                    </h2>
                    <span className="font-label-numeric-md text-label-numeric-md text-secondary">82% Healthy</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase">Active Cap Deployed</span>
                      <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface mt-1">
                        $368,400
                      </span>
                      <span className="font-body-sm text-body-sm text-outline mt-0.5">Floor limit: $450,000</span>
                    </div>
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase">Holding Interest Run</span>
                      <span className="font-label-numeric-lg text-label-numeric-lg text-tertiary mt-1">$42/day</span>
                      <span className="font-body-sm text-body-sm text-secondary mt-0.5">-38% below cap ceiling</span>
                    </div>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container flex items-start gap-space-sm">
                    <Icon name="auto_graph" className="text-primary text-[20px] mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-md font-semibold text-on-surface">
                        Algorithmic Advisory
                      </span>
                      <p className="font-body-sm text-body-sm text-outline">
                        High regional demand detected for mid-size EV/Hybrid crossovers under $28,000. Recommend
                        acquiring 3 additional RAV4 or Model Y units this week.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Terminal Quick Tools</h2>
                  <div className="grid grid-cols-2 gap-space-sm">
                    {quickTools.map((tool) => (
                      <button
                        key={tool.label}
                        onClick={() => trigger(`${tool.label} opened`)}
                        className="p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-left flex flex-col gap-space-xs transition-all group"
                      >
                        <div
                          className={`w-8 h-8 rounded-md bg-surface-container-lowest flex items-center justify-center transition-colors ${toolTone[tool.tone]}`}
                        >
                          <Icon name={tool.icon} className="text-[18px]" />
                        </div>
                        <span className="font-label-md text-label-md text-on-surface">{tool.label}</span>
                        <span className="font-body-sm text-body-sm text-outline">{tool.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toast message={message} />
    </div>
  )
}
