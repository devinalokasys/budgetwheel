import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuth } from '../hooks/useAuth'
import { db } from '../lib/db'

interface DesktopHeaderProps {
  active?: 'browse' | 'saved' | 'dealer' | 'messages' | 'account'
}

// Dealer Portal now lives on its own deployed app (see src/DealerApp.tsx),
// not a route in this one — a dealer account viewing the consumer
// marketplace still gets a link back to it, just a cross-origin one.
const dealerAppUrl = import.meta.env.VITE_DEALER_APP_URL ?? 'https://budgetwheel-dealer.web.app'

const navItems = [
  { key: 'browse', label: 'Browse Inventory', to: '/browse' },
  { key: 'saved', label: 'Saved', to: '/saved' },
  { key: 'dealer', label: 'Dealer Portal', to: dealerAppUrl, dealerOnly: true },
  { key: 'messages', label: 'Messages', to: '/messages' },
] as const

export default function DesktopHeader({ active }: DesktopHeaderProps) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [savedCount, setSavedCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setSavedCount(null)
      return
    }
    let cancelled = false
    db.listSavedListings(user.uid).then((rows) => {
      if (!cancelled) setSavedCount(rows.length)
    })
    return () => {
      cancelled = true
    }
  }, [user])

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
          {navItems
            .filter((item) => !('dealerOnly' in item) || profile?.type === 'dealer')
            .map((item) => (
            <button
              key={item.key}
              onClick={() =>
                item.to.startsWith('http') ? (window.location.href = item.to) : navigate(item.to)
              }
              className={`px-3 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 ${
                active === item.key
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {item.label}
              {item.key === 'saved' && savedCount !== null && savedCount > 0 && (
                <span className="text-outline">({savedCount})</span>
              )}
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
          {user ? (
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => navigate('/account')}
                className={`flex items-center gap-space-sm pl-space-xs rounded-lg transition-colors ${
                  active === 'account' ? 'text-primary' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="person" className="text-on-primary text-[18px]" />
                  )}
                </div>
                <div className="hidden 2xl:flex flex-col text-left">
                  <span className="text-label-md font-label-md text-on-surface leading-tight">
                    {user.displayName ?? 'Garage Profile'}
                  </span>
                  <span className="text-label-sm font-label-sm text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Verified Account
                  </span>
                </div>
              </button>
              <button
                aria-label="Sign out"
                title="Sign out"
                onClick={signOut}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="logout" className="text-[20px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-4 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
