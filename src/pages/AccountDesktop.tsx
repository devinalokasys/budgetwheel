import Icon from '../components/Icon'
import DesktopHeader from '../components/DesktopHeader'
import DesktopFooter from '../components/DesktopFooter'
import {
  telemetryStats,
  garageVehicles,
  escrowStatus,
  inquiries,
  documents,
  marketAlerts,
} from '../data/accountDesktop'

const statTone: Record<string, string> = {
  'on-surface': 'text-on-surface',
  primary: 'text-primary',
  secondary: 'text-secondary',
}

const tagTone: Record<string, string> = {
  primary: 'bg-surface-container text-primary',
  neutral: 'bg-surface-container text-on-surface-variant',
}

const badgeTone: Record<string, string> = {
  primary: 'bg-surface-container-highest text-on-surface-variant',
  secondary: 'bg-secondary-container/20 text-secondary',
}

const initialsTone: Record<string, string> = {
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
  const { listed, stored } = garageVehicles

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
              <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-outline">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-label-sm font-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  Telemetry Synced
                </span>
                <span>Last refresh: Just now</span>
              </div>
            </div>

            <div className="relative w-full rounded-2xl bg-surface-container p-space-lg lg:p-space-xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-primary-container/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-md p-1">
                      <img
                        alt="Garage profile avatar"
                        className="w-full h-full object-cover rounded-xl"
                        src="/images/garage-avatar.png"
                      />
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 bg-secondary-container text-on-secondary-container rounded-full p-1 shadow-sm flex items-center justify-center"
                      title="KYC Identity Verified"
                    >
                      <Icon name="verified" className="text-[16px]" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                        Marcus Sterling
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm uppercase">
                        Verified Trader
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                        Private Seller
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-outline flex items-center gap-2 flex-wrap">
                      <span>Account ID: #BW-94821</span>
                      <span>•</span>
                      <span>Member since Oct 2022</span>
                      <span>•</span>
                      <span className="text-secondary flex items-center gap-1 font-label-sm text-label-sm">
                        <Icon name="shield" className="text-[14px]" />
                        Level 3 Certified
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                  <button className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-inverse-primary transition-all font-label-md text-label-md shadow-md">
                    <Icon name="add_circle" className="text-[18px]" />
                    Add Vehicle to Garage
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-label-md text-label-md">
                    <Icon name="edit_note" className="text-[18px]" />
                    Edit Profile
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-label-md text-label-md">
                    <Icon name="security" className="text-[18px]" />
                    Security &amp; KYC
                  </button>
                </div>
              </div>

              <div className="mt-space-lg pt-space-md grid grid-cols-2 md:grid-cols-5 gap-space-sm">
                {telemetryStats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`bg-surface-container-lowest/70 p-space-sm rounded-lg flex flex-col ${
                      i === telemetryStats.length - 1 ? 'col-span-2 md:col-span-1' : ''
                    }`}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="garage" className="text-primary text-[24px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">My Garage Fleet</h2>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm ml-2">
                        2 Vehicles
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                    <div className="flex flex-col xl:flex-row gap-space-md justify-between items-start">
                      <div className="flex flex-col sm:flex-row gap-space-md w-full xl:w-7/12">
                        <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest">
                          <img className="w-full h-full object-cover" src={listed.image} alt={listed.title} />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container animate-ping" />
                            {listed.status}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                            {listed.title}
                          </h3>
                          <span className="font-body-sm text-body-sm text-outline font-mono">
                            VIN: {listed.vin}
                          </span>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-surface-container-lowest px-2 py-1 rounded">
                              <span className="font-label-sm text-label-sm text-outline block">Odometer</span>
                              <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                {listed.odometer}
                              </span>
                            </div>
                            <div className="bg-surface-container-lowest px-2 py-1 rounded">
                              <span className="font-label-sm text-label-sm text-outline block">Drivetrain</span>
                              <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                {listed.drivetrain}
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
                            {listed.listingPrice}
                          </div>
                          <span className="font-body-sm text-body-sm text-secondary flex items-center sm:justify-end gap-1">
                            <Icon name="trending_up" className="text-[14px]" />
                            {listed.priceNote}
                          </span>
                        </div>
                        <div className="mt-space-sm pt-space-xs w-full flex flex-col gap-1 text-left sm:text-right">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Top Dealer Cash Buyout:
                          </span>
                          <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                            {listed.topBuyout.amount}{' '}
                            <span className="text-body-sm font-normal text-outline">
                              by {listed.topBuyout.by}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-lowest/80 p-space-sm rounded-xl">
                      {listed.stats.map((stat) => (
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
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-label-md transition-colors">
                          <Icon name="mail" className="text-[16px]" />
                          View Inquiries (6)
                        </button>
                      </div>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 font-label-md text-label-md transition-colors">
                        <Icon name="request_quote" className="text-[16px]" />
                        Review Cash Offers
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                    <div className="flex flex-col xl:flex-row gap-space-md justify-between items-start">
                      <div className="flex flex-col sm:flex-row gap-space-md w-full xl:w-7/12">
                        <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest">
                          <img className="w-full h-full object-cover" src={stored.image} alt={stored.title} />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface-container-highest/90 text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                            <Icon name="lock" className="text-[14px]" />
                            {stored.status}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                            {stored.title}
                          </h3>
                          <span className="font-body-sm text-body-sm text-outline font-mono">
                            VIN: {stored.vin}
                          </span>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-surface-container-lowest px-2 py-1 rounded">
                              <span className="font-label-sm text-label-sm text-outline block">Odometer</span>
                              <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                                {stored.odometer}
                              </span>
                            </div>
                            <div className="bg-surface-container-lowest px-2 py-1 rounded">
                              <span className="font-label-sm text-label-sm text-outline block">Health Check</span>
                              <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                                {stored.healthCheck}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end justify-between w-full xl:w-5/12 bg-surface-container-low p-space-sm rounded-xl">
                        <div className="flex flex-col sm:text-right">
                          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">
                            Estimated Private Value
                          </span>
                          <div className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
                            {stored.estimatedValue}
                          </div>
                          <span className="font-body-sm text-body-sm text-outline">
                            Market range: {stored.marketRange}
                          </span>
                        </div>
                        <div className="mt-space-sm pt-space-xs w-full flex flex-col gap-1 text-left sm:text-right">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Instant Dealer Buyout Guarantee:
                          </span>
                          <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                            {stored.buyoutGuarantee.amount}{' '}
                            <span className="text-body-sm font-normal text-outline">
                              ({stored.buyoutGuarantee.validity})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-lowest/80 p-space-sm rounded-xl">
                      {stored.alerts.map((alert) => (
                        <div key={alert.label} className="flex items-center gap-space-xs">
                          <Icon name={alert.icon} className={`text-[20px] ${alertTone[alert.tone]}`} />
                          <div>
                            <span className="font-label-md text-label-md text-on-surface block">{alert.label}</span>
                            <span className={`font-body-sm text-body-sm ${alertTone[alert.tone]}`}>{alert.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors">
                          <Icon name="storefront" className="text-[16px]" />
                          List For Sale in 2 Clicks
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-label-md transition-colors">
                          <Icon name="calendar_month" className="text-[16px]" />
                          Schedule Maintenance
                        </button>
                      </div>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 font-label-md text-label-md transition-colors">
                        <Icon name="price_check" className="text-[16px]" />
                        Request Dealer Buyout
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="swap_horizontal_circle" className="text-secondary text-[22px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Active Inquiries &amp; Escrow
                      </h2>
                    </div>
                    <button className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1">
                      Open Message Center
                      <Icon name="arrow_forward" className="text-[16px]" />
                    </button>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div className="flex items-start gap-space-sm">
                      <div className="p-2.5 rounded-lg bg-secondary-container/20 text-secondary shrink-0">
                        <Icon name="account_balance" className="text-[24px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface">
                            Escrow Deposit Confirmed: {escrowStatus.amount}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-sm text-label-sm">
                            Secured
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-outline mt-0.5">
                          {escrowStatus.vehicle} Deal ID {escrowStatus.dealId} — Earnest funds held by
                          BudgetWheels Trust Bank N.A.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0">
                      <button className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors">
                        View Escrow Vault
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-inverse-primary font-label-md text-label-md transition-colors">
                        Authorize Release
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    {inquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm"
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 font-label-md text-label-md ${initialsTone[inquiry.tone]}`}
                          >
                            {inquiry.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-md text-label-md text-on-surface truncate">
                                {inquiry.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] ${badgeTone[inquiry.tone]}`}>
                                {inquiry.badge}
                              </span>
                              <span className="font-body-sm text-body-sm text-outline">{inquiry.timeAgo}</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              {inquiry.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className={`px-2 py-1 rounded font-label-sm text-label-sm ${tagTone[inquiry.tagTone]}`}>
                            {inquiry.tag}
                          </span>
                          <button className="px-3 py-1 rounded-lg bg-surface-bright hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md transition-colors">
                            {inquiry.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-lg">
                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="account_balance_wallet" className="text-secondary text-[22px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">Buying Power Vault</h2>
                    </div>
                    <Icon name="info" className="text-outline cursor-pointer hover:text-on-surface text-[18px]" />
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-low via-surface-container-high to-surface-container-lowest p-space-md shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Pre-Approval Status
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm flex items-center gap-1">
                        <Icon name="check_circle" className="text-[14px]" />
                        Active (28d left)
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-display-hero-mobile text-display-hero-mobile text-on-surface tracking-tight leading-none">
                        $65,000
                      </div>
                      <div className="font-label-md text-label-md text-secondary mt-1">
                        Tier 1 Prime @ 5.9% APR Guaranteed
                      </div>
                    </div>
                    <div className="mt-space-md flex flex-col gap-1.5">
                      <div className="flex justify-between text-body-sm font-body-sm text-outline">
                        <span>Credit Profile: 840 (Soft Pull)</span>
                        <span className="text-on-surface font-semibold">Zero Impact</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-sm">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Instant Payment Simulator
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-body-md text-body-md text-on-surface-variant">Est. Monthly Payment</span>
                      <span className="font-label-numeric-md text-label-numeric-md text-primary">
                        $682 <span className="font-body-sm text-body-sm text-outline">/ mo</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-body-sm font-body-sm text-outline">
                      <span>Terms: 60 mos @ $5,000 down</span>
                      <span className="text-secondary">Pre-locked</span>
                    </div>
                    <button className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors">
                      <Icon name="file_download" className="text-[16px]" />
                      Download Pre-Approval PDF
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="verified" className="text-primary text-[22px]" />
                      <h2 className="font-headline-md text-headline-md text-on-surface">KYC &amp; Vault Docs</h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
                      100% Verified
                    </span>
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
