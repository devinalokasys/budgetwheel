import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const navItems = [
  { to: '/', label: 'Home', icon: 'directions_car' },
  { to: '/browse', label: 'Browse', icon: 'search' },
  { to: '/sell', label: 'Sell', icon: 'add', isPrimary: true },
  { to: '/dealer/deals', label: 'Deals', icon: 'local_offer' },
  { to: '/dealer', label: 'Dealer', icon: 'storefront' },
]

export default function DealerBottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-xs flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-space-xs min-w-[56px] h-11 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            {item.isPrimary ? (
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_2px_8px_rgba(47,111,235,0.4)]">
                <Icon name={item.icon} className="text-[18px]" />
              </div>
            ) : (
              <Icon name={item.icon} className="text-[20px]" />
            )}
            <span className="font-label-sm text-label-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
