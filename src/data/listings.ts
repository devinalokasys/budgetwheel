export interface Listing {
  id: string
  title: string
  subtitle: string
  image: string
  location: string
  dealBadge: { label: string; icon: string; tone: 'secondary' | 'primary' | 'tertiary' }
  historyPill: { label: string; icon: string }
  price: string
  priceNote: string
  monthlyEstimate: string
  seller: string
  rating?: string
  verified?: string
  distance: string
  specs: { label: string; value: string }[]
}

export const featuredDeals: Listing[] = [
  {
    id: 'tesla-model-3',
    title: '2022 Tesla Model 3',
    subtitle: 'Long Range Dual Motor AWD',
    image: '/images/tesla-model-3.jpg',
    location: 'Austin, TX • Private Seller',
    dealBadge: { label: 'GREAT DEAL -$2.4K', icon: 'verified', tone: 'secondary' },
    historyPill: { label: 'Clean Title', icon: 'check_circle' },
    price: '$31,450',
    priceNote: 'Est. $482/mo • 60 mo',
    monthlyEstimate: '24,180 mi',
    seller: 'Private Seller',
    distance: 'Austin, TX',
    verified: 'Clean Title',
    specs: [
      { label: 'MILEAGE', value: '24,180 mi' },
      { label: 'CARFAX', value: 'Clean Title' },
    ],
  },
  {
    id: 'porsche-macan',
    title: '2021 Porsche Macan S',
    subtitle: '3.0L Turbo V6 • PDK',
    image: '/images/porsche-macan.jpg',
    location: 'Dallas, TX • Dealer Verified',
    dealBadge: { label: 'GOOD DEAL', icon: 'thumb_up', tone: 'primary' },
    historyPill: { label: '1-Owner', icon: 'verified_user' },
    price: '$48,900',
    priceNote: 'Est. $720/mo • 72 mo',
    monthlyEstimate: '31,540 mi',
    seller: 'Dealer Verified',
    distance: 'Dallas, TX',
    specs: [
      { label: 'MILEAGE', value: '31,540 mi' },
      { label: 'HISTORY', value: '1-Owner' },
    ],
  },
  {
    id: 'ford-f150-lightning',
    title: '2023 Ford F-150 Lightning',
    subtitle: 'XLT Extended Range 4WD',
    image: '/images/ford-f150-lightning.jpg',
    location: 'Houston, TX • Private Verified',
    dealBadge: { label: 'GREAT DEAL -$3.1K', icon: 'local_offer', tone: 'secondary' },
    historyPill: { label: '0 Accidents', icon: 'shield' },
    price: '$42,800',
    priceNote: 'Est. $610/mo • 72 mo',
    monthlyEstimate: '18,220 mi',
    seller: 'Private Verified',
    distance: 'Houston, TX',
    specs: [
      { label: 'MILEAGE', value: '18,220 mi' },
      { label: 'RECORD', value: '0 Accidents' },
    ],
  },
]

export interface BrowseListing {
  id: string
  title: string
  seller: string
  rating?: string
  verifiedLabel: string
  image: string
  dealBadge: { label: string; icon: string; tone: 'secondary' | 'tertiary' }
  historyPill: { label: string; icon: string }
  distance: string
  price: string
  priceNote: string
  monthlyEstimate: string
  specs: { label: string; value: string }[]
}

export const browseListings: BrowseListing[] = [
  {
    id: 'bmw-330i',
    title: '2022 BMW 330i xDrive',
    seller: 'Apex Motors',
    rating: '4.9',
    verifiedLabel: 'Verified Dealer',
    image: '/images/bmw-330i.jpg',
    dealBadge: { label: 'Great Deal', icon: 'trending_down', tone: 'secondary' },
    historyPill: { label: 'Clean Carfax • 0 Accidents', icon: 'shield' },
    distance: '4 mi away',
    price: '$33,800',
    priceNote: '$1,450 below avg',
    monthlyEstimate: 'Est. $540/mo (72 mos, $3k down)',
    specs: [
      { label: 'Mileage', value: '28.1k' },
      { label: 'Drivetrain', value: 'AWD' },
      { label: '0-60 mph', value: '5.3s' },
      { label: 'Engine', value: '2.0T I4' },
    ],
  },
  {
    id: 'toyota-rav4-hybrid',
    title: '2020 Toyota RAV4 Hybrid XSE',
    seller: 'Private Seller',
    verifiedLabel: 'ID Verified',
    image: '/images/toyota-rav4-hybrid.jpg',
    dealBadge: { label: 'Fair Price', icon: 'balance', tone: 'tertiary' },
    historyPill: { label: 'Carfax 1-Owner • Hybrid eAWD', icon: 'check_circle' },
    distance: '9 mi away',
    price: '$27,650',
    priceNote: 'Priced at market',
    monthlyEstimate: 'Est. $445/mo (72 mos, $2k down)',
    specs: [
      { label: 'Mileage', value: '41.6k' },
      { label: 'Drivetrain', value: 'eAWD' },
      { label: '0-60 mph', value: '7.8s' },
      { label: 'Engine', value: '2.5L Hybrid' },
    ],
  },
  {
    id: 'tesla-model-3-browse',
    title: '2022 Tesla Model 3 Long Range',
    seller: 'Private Seller',
    verifiedLabel: 'ID Verified',
    image: '/images/tesla-model-3.jpg',
    dealBadge: { label: 'Great Deal', icon: 'trending_down', tone: 'secondary' },
    historyPill: { label: 'Clean Title • 0 Accidents', icon: 'shield' },
    distance: '12 mi away',
    price: '$31,450',
    priceNote: '$2,400 below avg',
    monthlyEstimate: 'Est. $482/mo (60 mos, $3k down)',
    specs: [
      { label: 'Mileage', value: '24.2k' },
      { label: 'Drivetrain', value: 'AWD' },
      { label: '0-60 mph', value: '4.2s' },
      { label: 'Engine', value: 'Dual Motor' },
    ],
  },
  {
    id: 'ford-f150-lightning-browse',
    title: '2023 Ford F-150 Lightning XLT',
    seller: 'Private Verified',
    verifiedLabel: 'ID Verified',
    image: '/images/ford-f150-lightning.jpg',
    dealBadge: { label: 'Great Deal', icon: 'trending_down', tone: 'secondary' },
    historyPill: { label: '0 Accidents • 1-Owner', icon: 'shield' },
    distance: '18 mi away',
    price: '$42,800',
    priceNote: '$3,100 below avg',
    monthlyEstimate: 'Est. $610/mo (72 mos, $4k down)',
    specs: [
      { label: 'Mileage', value: '18.2k' },
      { label: 'Drivetrain', value: '4WD' },
      { label: '0-60 mph', value: '4.0s' },
      { label: 'Engine', value: 'Extended Range' },
    ],
  },
]
