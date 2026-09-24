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

