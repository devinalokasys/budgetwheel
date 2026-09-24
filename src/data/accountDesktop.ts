export const telemetryStats = [
  { label: 'Garage Fleet', value: '2', unit: 'Units', tone: 'on-surface' as const },
  { label: 'Active Listings', value: '1', unit: '($25,900 ask)', tone: 'primary' as const },
  { label: 'Buyer Inquiries', value: '6', unit: 'New (24h)', tone: 'secondary' as const },
  { label: 'Saved Alerts', value: '4', unit: 'Searches', tone: 'on-surface' as const },
]

export const garageVehicles = {
  listed: {
    id: 'camry-se-garage',
    status: 'Live Listing' as const,
    image: '/images/toyota-camry-se-3.jpg',
    title: '2021 Toyota Camry SE',
    vin: '4T1G11AK5MU498213',
    odometer: '32,150 mi',
    drivetrain: 'FWD 2.5L',
    listingPrice: '$25,900',
    priceNote: '+$1,400 above top dealer bid',
    topBuyout: { amount: '$24,500', by: 'Metro Auto Group' },
    stats: [
      { icon: 'visibility', value: '342', label: 'Unique Views' },
      { icon: 'bookmark', value: '28', label: 'Watchlists' },
      { icon: 'forum', value: '6 Active', label: 'Inquiries', tone: 'secondary' as const },
      { icon: 'handshake', value: '2', label: 'Cash Offers', tone: 'primary' as const },
    ],
  },
  stored: {
    id: 'porsche-macan-garage',
    status: 'Stored in Garage' as const,
    image: '/images/porsche-macan-2.jpg',
    title: '2019 Porsche Macan S',
    vin: 'WP1AA2A54KL091411',
    odometer: '41,200 mi',
    healthCheck: 'Clean Title',
    estimatedValue: '$38,400',
    marketRange: '$37.1k – $39.8k',
    buyoutGuarantee: { amount: '$36,200', validity: 'Valid 5 days' },
    alerts: [
      { icon: 'build', label: 'Oil & Brake Fluid', note: 'Due in 2,400 mi', tone: 'tertiary' as const },
      { icon: 'verified_user', label: '1-Owner History', note: 'Verified', tone: 'secondary' as const },
      { icon: 'query_stats', label: 'High Buyer Demand', note: '+14% Local Search Spike', tone: 'primary' as const },
    ],
  },
}

export const inquiries = [
  {
    id: 'jason-k',
    initials: 'JK',
    name: 'Jason K.',
    tone: 'primary' as const,
    badge: 'Verified Buyer',
    timeAgo: '18m ago',
    message: '"Is the California title clean and free of liens for the 2021 Camry SE? Ready to sign via digital bill."',
    tag: 'Camry SE',
    tagTone: 'primary' as const,
    action: 'Reply',
  },
  {
    id: 'apex-rep',
    initials: 'AM',
    name: 'Apex Motors Dealer Rep',
    tone: 'secondary' as const,
    badge: 'Partner Dealer',
    timeAgo: '2h ago',
    message: '"Test drive appointment confirmed for your saved 2022 BMW 330i xDrive tomorrow at 11:30 AM."',
    tag: 'Saved Fleet',
    tagTone: 'neutral' as const,
    action: 'Details',
  },
]

export const documents = [
  {
    id: 'state-id',
    icon: 'badge',
    label: 'State ID / Passport',
    note: 'Uploaded by you',
    noteTone: 'secondary' as const,
    action: 'check' as const,
  },
  {
    id: 'title',
    icon: 'description',
    label: '2021 Camry Title (PDF)',
    note: 'Digital Clean Title Ready',
    noteTone: 'outline' as const,
    action: 'download' as const,
  },
  {
    id: 'carfax',
    icon: 'history_edu',
    label: '2 Vehicle History Reports',
    note: 'Refreshed 24 hours ago',
    noteTone: 'outline' as const,
    action: 'open_in_new' as const,
  },
  {
    id: 'bill-of-sale',
    icon: 'draw',
    label: 'Digital Bill of Sale Template',
    note: 'Standard DMV-Compliant',
    noteTone: 'outline' as const,
    action: 'download' as const,
  },
]

export const marketAlerts = [
  { id: 'buyout-offers', label: 'Dealer Buyout Offers', note: 'Alert on new dealer bids', checked: true },
  { id: 'price-drops', label: 'Price Drop Triggers', note: 'SMS for saved inventory (-$250+)', checked: true },
  { id: 'buyer-chat', label: 'Buyer Chat Inquiries', note: 'Instant relay via Email & App', checked: true },
]
