export interface StatTile {
  label: string
  icon: string
  iconTone: 'primary' | 'secondary' | 'tertiary'
  value: string
  unit?: string
  trend: string
  trendIcon?: string
  trendTone: 'secondary' | 'outline'
}

export const statTiles: StatTile[] = [
  {
    label: 'Active Stock',
    icon: 'directions_car',
    iconTone: 'primary',
    value: '42',
    unit: 'units',
    trend: '+4 this week',
    trendIcon: 'trending_up',
    trendTone: 'secondary',
  },
  {
    label: '30D Volume',
    icon: 'payments',
    iconTone: 'tertiary',
    value: '$1.28M',
    trend: '+14.2% vs target',
    trendIcon: 'north_east',
    trendTone: 'secondary',
  },
  {
    label: 'Lead Conv.',
    icon: 'bolt',
    iconTone: 'secondary',
    value: '18.4%',
    trend: 'Top 5% in Region',
    trendTone: 'outline',
  },
  {
    label: 'Turn Velocity',
    icon: 'speed',
    iconTone: 'primary',
    value: '8.5',
    unit: 'days',
    trend: '2.1x faster avg',
    trendTone: 'secondary',
  },
]

export interface TradeBid {
  id: string
  title: string
  meta: string
  asking: string
  tags: { label: string; tone: 'secondary' | 'primary' | 'neutral'; icon?: string }[]
  kbb?: string
  aiRec?: string
  margin?: string
  algoTarget?: string
  primaryLabel: string
  primaryIcon?: string
  secondaryLabel?: string
}

export const tradeBids: TradeBid[] = [
  {
    id: 'camry-se',
    title: '2021 Toyota Camry SE',
    meta: '32,150 mi • Pearl White • Portland, OR',
    asking: '$25,900',
    tags: [
      { label: 'Carfax 0 Acc', tone: 'secondary', icon: 'verified' },
      { label: '14h remaining', tone: 'neutral' },
    ],
    kbb: '$24,800',
    aiRec: '$24,500',
    margin: '+$2,400',
    primaryLabel: 'Offer $24,500',
    primaryIcon: 'send',
    secondaryLabel: 'Counter',
  },
  {
    id: 'accord-sport',
    title: '2020 Honda Accord Sport',
    meta: '52,800 mi • Modern Steel • Beaverton, OR',
    asking: '$22,200',
    tags: [
      { label: 'Clean 1-Owner', tone: 'primary' },
      { label: 'AI Inspection 96%', tone: 'neutral' },
    ],
    algoTarget: '$21,300',
    primaryLabel: 'Instant Bid',
    primaryIcon: 'arrow_forward',
  },
]

export const inventoryTabs = [
  { id: 'all', label: 'All (42)' },
  { id: 'alerts', label: 'Price Alert (5)' },
  { id: 'boosted', label: 'Boosted (12)' },
  { id: 'review', label: 'In Review (3)' },
]

export interface DealerInventoryItem {
  id: string
  image: string
  badge: { label: string; icon: string }
  dayListed: string
  views: number
  saves: number
  inquiries: number
  title: string
  vin: string
  mileage: string
  price: string
  priceNote: string
  specs: { label: string; value: string; tone?: 'secondary' }[]
  actions: { label: string; icon: string; primary?: boolean }[]
}

export const dealerInventory: DealerInventoryItem[] = [
  {
    id: 'bmw-330i-dealer',
    image: '/images/bmw-330i-dealer.jpg',
    badge: { label: 'Hot Deal', icon: 'local_fire_department' },
    dayListed: 'Day 4 Listed',
    views: 412,
    saves: 84,
    inquiries: 14,
    title: '2022 BMW 330i xDrive',
    vin: 'WBA5R7C09NF****',
    mileage: '28,100 mi',
    price: '$33,800',
    priceNote: '$1,450 below market',
    specs: [
      { label: 'Drivetrain', value: 'AWD 2.0T' },
      { label: 'Title', value: 'Clean 1-Owner', tone: 'secondary' },
      { label: 'Floor Cost', value: '$29,400' },
    ],
    actions: [
      { label: 'Boost Listing', icon: 'rocket_launch', primary: true },
      { label: 'Edit Pricing', icon: 'edit' },
    ],
  },
  {
    id: 'audi-a5',
    image: '/images/audi-a5-sportback.jpg',
    badge: { label: 'Value Pick', icon: 'price_check' },
    dayListed: 'Day 7 Listed',
    views: 328,
    saves: 61,
    inquiries: 9,
    title: '2021 Audi A5 Sportback 45',
    vin: 'WAUR8AF44MA****',
    mileage: '33,520 mi',
    price: '$34,500',
    priceNote: 'Under Market Value',
    specs: [
      { label: 'Drivetrain', value: 'Quattro AWD' },
      { label: 'Transmission', value: '7-Speed S-Tronic' },
      { label: 'Floor Cost', value: '$31,100' },
    ],
    actions: [
      { label: 'Manage Leads (9)', icon: 'forum' },
      { label: 'Mark Sold', icon: 'check_circle' },
    ],
  },
]
