// Feature callouts, not live metrics — the app has no real inventory scale,
// KBB integration, sale-turnaround tracking, or escrow service to report
// real numbers for, so this doesn't pretend to be a telemetry ticker.
export const telemetryMetrics = [
  {
    icon: 'verified_user',
    tone: 'primary' as const,
    value: 'Verified Sign-In',
    label: 'Every account authenticated, not anonymous',
  },
  {
    icon: 'forum',
    tone: 'secondary' as const,
    value: 'Direct Messaging',
    label: 'Talk to the actual buyer or seller',
  },
  {
    icon: 'price_check',
    tone: 'tertiary' as const,
    value: 'Price Transparency',
    label: 'See price-vs-market on every listing',
  },
  {
    icon: 'storefront',
    tone: 'primary' as const,
    value: 'Private-Party + Dealer',
    label: 'Both sides of the market, one place',
  },
]

export const categories = [
  { label: 'SUVs & Crossovers', units: 'Browse Listings', from: 'From $14,900', icon: 'directions_car', tone: 'primary' as const, bodyType: 'suv' as const },
  { label: 'Sedans & Coupes', units: 'Browse Listings', from: 'From $11,500', icon: 'directions_car', tone: 'secondary' as const, bodyType: 'sedan' as const },
  { label: 'EV & Clean Fuel', units: 'Browse Listings', from: 'From $19,400', icon: 'bolt', tone: 'tertiary' as const, bodyType: 'ev' as const },
  { label: 'Trucks & Work', units: 'Browse Listings', from: 'From $18,200', icon: 'local_shipping', tone: 'primary' as const, bodyType: 'truck' as const },
  { label: 'Performance & GT', units: 'Browse Listings', from: 'From $29,990', icon: 'sports_score', tone: 'primary-fixed-dim' as const, bodyType: 'other' as const },
]

export interface ShowcaseCard {
  id: string
  image: string
  dealPill: { icon: string; label: string }
  bottomPill: { icon: string; label: string; tone: 'secondary' | 'primary' | 'on-surface' }
  location: string
  sellerType: string
  sellerTone: 'primary' | 'secondary'
  title: string
  subtitle: string
  specs: [{ label: string; value: string }, { label: string; value: string }]
  price: string
  priceNote: string
  monthlyEstimate: string
  apr: string
}

export const showcaseCards: ShowcaseCard[] = [
  {
    id: 'bmw-330i',
    image: '/images/bmw-330i-showcase.jpg',
    dealPill: { icon: 'trending_down', label: '$1,450 Below Market' },
    bottomPill: { icon: 'shield', label: 'Clean Title • 1-Owner', tone: 'secondary' },
    location: 'San Jose, CA • 12 mi away',
    sellerType: 'Franchise Dealer',
    sellerTone: 'primary',
    title: '2022 BMW 330i xDrive',
    subtitle: 'M Sport Package • Live Cockpit Pro',
    specs: [
      { label: 'Odometer', value: '28,100 mi' },
      { label: 'Drivetrain', value: 'AWD Turbo' },
    ],
    price: '$33,800',
    priceNote: 'No dealer doc fees',
    monthlyEstimate: 'Est. $540/mo',
    apr: '60 mo • 5.9% APR',
  },
  {
    id: 'tesla-model-3',
    image: '/images/tesla-model-3-showcase.jpg',
    dealPill: { icon: 'bolt', label: '$2,400 Below Avg' },
    bottomPill: { icon: 'battery_charging_full', label: '98% Battery Health', tone: 'secondary' },
    location: 'Austin, TX • Private Party',
    sellerType: 'Private Seller',
    sellerTone: 'secondary',
    title: '2022 Tesla Model 3 Long Range',
    subtitle: 'Dual Motor AWD • HW3 • 358mi Range',
    specs: [
      { label: 'Odometer', value: '24,180 mi' },
      { label: 'Acceleration', value: '4.2s 0-60' },
    ],
    price: '$31,450',
    priceNote: '$4,000 Tax Credit Ready',
    monthlyEstimate: 'Est. $482/mo',
    apr: '60 mo • 4.9% APR',
  },
  {
    id: 'toyota-rav4-hybrid',
    image: '/images/toyota-rav4-showcase.jpg',
    dealPill: { icon: 'eco', label: '40 MPG • Fair Deal' },
    bottomPill: { icon: 'check', label: 'Zero Accidents Reported', tone: 'on-surface' },
    location: 'Austin, TX • 5 mi away',
    sellerType: 'BudgetWheels Fleet',
    sellerTone: 'primary',
    title: '2020 Toyota RAV4 Hybrid XSE',
    subtitle: 'Electronic On-Demand AWD • Audio Plus',
    specs: [
      { label: 'Odometer', value: '41,600 mi' },
      { label: 'Fuel Economy', value: '41/38 MPG' },
    ],
    price: '$27,650',
    priceNote: 'Pre-inspected 160-pts',
    monthlyEstimate: 'Est. $435/mo',
    apr: '60 mo • 6.2% APR',
  },
  {
    id: 'audi-a5',
    image: '/images/audi-a5-showcase.jpg',
    dealPill: { icon: 'trending_down', label: '$1,900 Below Market' },
    bottomPill: { icon: 'verified', label: 'CPO 2-Yr Unlimited Mi', tone: 'primary' },
    location: 'San Jose, CA • 8 mi away',
    sellerType: 'Certified Dealer',
    sellerTone: 'primary',
    title: '2021 Audi A5 Sportback 45 TFSI',
    subtitle: 'Quattro AWD • 2.0T I4',
    specs: [
      { label: 'Odometer', value: '33,520 mi' },
      { label: 'Drivetrain', value: 'Quattro AWD' },
    ],
    price: '$34,500',
    priceNote: 'CPO warranty included',
    monthlyEstimate: 'Est. $556/mo',
    apr: '60 mo • 5.4% APR',
  },
]
