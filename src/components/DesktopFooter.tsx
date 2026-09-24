import Icon from './Icon'

const footerColumns = [
  {
    heading: 'Marketplace',
    links: ['Used Vehicles', 'Certified Pre-Owned', 'EVs & Hybrids', 'Commercial Fleet', 'Deal Analysis Index'],
  },
  {
    heading: 'Financing & Sale',
    links: ['Instant Cash Valuation', 'Competitive Loan Desk', 'Trade-In Calculator', 'Inspection Guarantees', 'Vehicle History Checks'],
  },
  {
    heading: 'Enterprise',
    links: ['Dealer Portal Access', 'Bulk Inventory API', 'Floorplan Integration', 'Compliance & Titles', 'Platform Telemetry'],
  },
]

export default function DesktopFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.3)]">
      <div className="w-full max-w-[1600px] mx-auto px-gutter py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg pb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img alt="BudgetWheels" className="h-7 w-auto object-contain rounded-md" src="/images/logo-brand.jpg" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              A car marketplace for verified buyers and sellers. Private-party and dealer
              listings, side by side, with a vehicle history report and transparent
              price-vs-market comparison on every listing.
            </p>
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
                <Icon name="verified" className="text-[14px]" />
                Verified Buyers &amp; Sellers
              </span>
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                {col.heading}
              </span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <p className="font-body-sm text-body-sm text-outline">
            © 2026 Aloka Systems LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-space-lg font-body-sm text-body-sm text-outline">
            {['Privacy Policy', 'Terms of Service', 'Security Disclosures', 'API Status'].map((link) => (
              <a
                key={link}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-on-surface transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
