export const sidebarNav = [
  { id: 'dealer-portal', label: 'Inventory Desk', icon: 'speed' },
  { id: 'inventory-management', label: 'Vehicle Stock', icon: 'directions_car' },
  { id: 'leads-inquiries', label: 'Buyer Inquiries', icon: 'contact_page' },
  { id: 'market-analytics', label: 'Pricing Analytics', icon: 'monitoring' },
  { id: 'dealer-settings', label: 'Store Configuration', icon: 'settings' },
]

export interface DesktopKpi {
  label: string
  icon: string
  iconTone: 'primary' | 'secondary' | 'tertiary' | 'primary-fixed'
  value: string
  unit?: string
}

export const desktopKpis: DesktopKpi[] = [
  { label: 'Inventory In Floor', icon: 'garage_home', iconTone: 'primary', value: '42' },
  { label: '30-Day Gross Realized', icon: 'payments', iconTone: 'secondary', value: '$1.28M' },
  { label: 'Lead Conversion Index', icon: 'bolt', iconTone: 'primary-fixed', value: '18.4%' },
  { label: 'Turn Velocity', icon: 'avg_pace', iconTone: 'tertiary', value: '8.5', unit: 'days' },
]

export interface AcquisitionCard {
  id: string
  image: string
  title: string
  badge: string
  mileage: string
  seller: string
  location: string
  valuationId: string
  ask: string
  kbb: string
  algoTarget: string
  margin: string
  marginPct: string
  note: { icon: string; text: string; tone: 'secondary' | 'tertiary' }
  counterAmount: string
  offerAmount: string
}

export const acquisitionQueue: AcquisitionCard[] = [
  {
    id: 'camry-se-desktop',
    image: '/images/toyota-camry-se-2.jpg',
    title: '2021 Toyota Camry SE',
    badge: 'Clean Title',
    mileage: '41,200 mi',
    seller: 'Marcus Chen',
    location: 'Portland, OR',
    valuationId: 'TK-982',
    ask: '$25,900',
    kbb: '$24,800',
    algoTarget: '$24,500',
    margin: '+$2,400',
    marginPct: '10.2%',
    note: { icon: 'verified_user', text: 'AutoCheck Score: 93 (0 Accidents)', tone: 'secondary' },
    counterAmount: '$24,250',
    offerAmount: '$24,500',
  },
  {
    id: 'accord-sport-desktop',
    image: '/images/honda-accord-sport.jpg',
    title: '2020 Honda Accord Sport 1.5T',
    badge: '1-Owner',
    mileage: '52,800 mi',
    seller: 'Sarah Vance',
    location: 'Beaverton, OR',
    valuationId: 'HD-341',
    ask: '$22,200',
    kbb: '$22,000',
    algoTarget: '$21,300',
    margin: '+$1,950',
    marginPct: '8.8%',
    note: { icon: 'warning', text: 'Tires at 4/32 (Requires $320 Reconditioning)', tone: 'tertiary' },
    counterAmount: '$20,950',
    offerAmount: '$21,300',
  },
]

export interface InventoryRow {
  id: string
  image: string
  title: string
  vin: string
  mileage: string
  daysListed: number
  daysTone: 'secondary' | 'neutral' | 'error'
  views: number
  interested: string
  interestedTone: 'secondary' | 'error'
  price: string
  priceNote: string
  priceNoteTone: 'secondary' | 'tertiary' | 'error'
  action: 'boost-edit' | 'auto-discount'
  autoDiscountLabel?: string
}

export const floorInventoryTable: InventoryRow[] = [
  {
    id: 'tesla-model-3-table',
    image: '/images/tesla-model-3-table.jpg',
    title: '2022 Tesla Model 3 LR',
    vin: '5YJ3E1EB...',
    mileage: '19k mi',
    daysListed: 4,
    daysTone: 'secondary',
    views: 342,
    interested: '14 buyers interested',
    interestedTone: 'secondary',
    price: '$31,450',
    priceNote: 'Great Deal (-$1,100 mkt)',
    priceNoteTone: 'secondary',
    action: 'boost-edit',
  },
  {
    id: 'bmw-330i-table',
    image: '/images/bmw-330i-table.jpg',
    title: '2021 BMW 330i xDrive',
    vin: 'WBA5R7C0...',
    mileage: '33k mi',
    daysListed: 12,
    daysTone: 'neutral',
    views: 198,
    interested: '6 buyers interested',
    interestedTone: 'secondary',
    price: '$27,990',
    priceNote: 'Fair Market (At avg)',
    priceNoteTone: 'tertiary',
    action: 'boost-edit',
  },
  {
    id: 'subaru-outback-table',
    image: '/images/subaru-outback.jpg',
    title: '2019 Subaru Outback Touring',
    vin: '4S4BSANC...',
    mileage: '64k mi',
    daysListed: 28,
    daysTone: 'error',
    views: 88,
    interested: 'Low velocity',
    interestedTone: 'error',
    price: '$19,450',
    priceNote: '+$650 above comps',
    priceNoteTone: 'error',
    action: 'auto-discount',
    autoDiscountLabel: 'Auto-Discount -$500',
  },
]

export interface BuyerInquiry {
  id: string
  initials: string
  initialsTone: 'primary' | 'secondary'
  name: string
  timeAgo: string
  tag: string
  tagTone: 'primary' | 'secondary'
  message: string
  actions: { label: string; primary?: boolean; icon?: string }[]
}

export const buyerInquiries: BuyerInquiry[] = [
  {
    id: 'david-ross',
    initials: 'DR',
    initialsTone: 'primary',
    name: 'David Ross',
    timeAgo: '4m ago',
    tag: 'Test Drive Request',
    tagTone: 'primary',
    message: '"Can I see the 2022 Tesla Model 3 today at 4:30 PM? Have pre-approved financing with BECU."',
    actions: [
      { label: 'Confirm 4:30 PM' },
      { label: 'Send Digital Key Link' },
      { label: '', icon: 'call' },
    ],
  },
  {
    id: 'elena-lopez',
    initials: 'EL',
    initialsTone: 'secondary',
    name: 'Elena Lopez',
    timeAgo: '19m ago',
    tag: 'Cash Offer',
    tagTone: 'secondary',
    message: '"Offering $26,500 all-in cash on the 2021 BMW 330i. Can wire deposit immediately."',
    actions: [{ label: 'Counter: $27,200' }, { label: 'Accept Wire Deposit', primary: true }],
  },
]

export const quickTools = [
  {
    label: 'VIN Mobile Scan',
    note: 'Instant onboard specs',
    icon: 'barcode_scanner',
    tone: 'primary' as const,
  },
  {
    label: 'Trade Appraisal',
    note: 'Live auction clearing',
    icon: 'calculate',
    tone: 'secondary' as const,
  },
  {
    label: 'Transport Carrier',
    note: '1-click dispatch booking',
    icon: 'local_shipping',
    tone: 'tertiary' as const,
  },
  {
    label: 'Pricing Rules',
    note: 'Manage auto-markups',
    icon: 'rule',
    tone: 'outline' as const,
  },
]
