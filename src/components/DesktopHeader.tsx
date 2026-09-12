import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

interface DesktopHeaderProps {
  active?: 'browse' | 'saved' | 'dealer' | 'messages' | 'account'
}

const navItems = [
  { key: 'browse', label: 'Browse Inventory', to: '/browse' },
  { key: 'compare', label: 'Compare Vehicles', to: null },
  { key: 'saved', label: 'Saved (4)', to: '/saved' },
  { key: 'dealer', label: 'Dealer Portal', to: '/dealer' },
  { key: 'messages', label: 'Messages', to: '/messages' },
] as const

export default function DesktopHeader({ active }: DesktopHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full max-w-[1600px] mx-auto px-gutter flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-lg shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-space-sm group">
            <img
              alt="BudgetWheels"
              className="h-8 w-auto object-contain rounded-md"
              src="/images/logo-brand.jpg"
            />
          </button>
          <div className="hidden xl:flex items-center bg-surface-container-low px-space-md py-1.5 rounded-lg gap-space-sm">
            <Icon name="search" className="text-outline text-[18px]" />
            <input
              className="bg-transparent text-on-surface placeholder:text-outline text-body-sm font-body-sm focus:outline-none w-52"
              placeholder="Search make, model, or VIN..."
              type="text"
            />
            <div className="flex items-center gap-1.5">
              {['Under $20k', 'EV / Hybrid', 'SUVs'].map((chip) => (
                <button
                  key={chip}
                  className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface text-label-sm font-label-sm uppercase transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-space-sm">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => item.to && navigate(item.to)}
              className={`px-3 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 ${
                active === item.key
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-space-md shrink-0">
          <button
            onClick={() => navigate('/sell')}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary hover:text-on-primary shadow-[0_4px_14px_rgba(47,111,235,0.35)] transition-all"
          >
            Sell Your Car
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="relative flex items-center justify-center p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="notifications" className="text-[22px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
          </button>
          <button
            onClick={() => navigate('/account')}
            className={`flex items-center gap-space-sm pl-space-xs rounded-lg transition-colors ${
              active === 'account' ? 'text-primary' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="text-label-md font-label-md text-on-surface leading-tight">
                Garage Profile
              </span>
              <span className="text-label-sm font-label-sm text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Verified Account
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
