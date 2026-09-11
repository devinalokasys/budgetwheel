import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/browse', label: 'Browse', icon: 'search' },
  { to: '/sell', label: 'Sell', icon: 'add_circle' },
  { to: '/saved', label: 'Saved', icon: 'favorite' },
  { to: '/account', label: 'Account', icon: 'account_circle' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-around h-16 px-space-xs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-12 transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className="text-[22px]" filled={isActive} />
                <span className="font-label-sm text-label-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
