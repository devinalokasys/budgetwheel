import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useTheme } from '../hooks/useTheme'
import { sidebarNav } from '../data/dealerDesktop'

interface DealerDesktopShellProps {
  activeNavId: string
  children: ReactNode
  headerRight?: ReactNode
}

export default function DealerDesktopShell({ activeNavId, children, headerRight }: DealerDesktopShellProps) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between p-space-lg shadow-[1px_0_12px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center gap-space-sm px-space-xs">
            <img alt="BudgetWheels" className="h-8 w-auto object-contain rounded-md" src="/images/logo-brand.jpg" />
          </div>
          <div className="px-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Dealer Terminal
            </span>
            <p className="font-headline-sm text-headline-sm text-on-surface truncate">
              Apex Motor Group
            </p>
          </div>
          <nav className="flex flex-col gap-space-xs">
            {sidebarNav.map((item) => (
              <button
                key={item.id}
                onClick={() => item.to && navigate(item.to)}
                disabled={!item.to}
                title={item.to ? undefined : 'Coming soon'}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-left ${
                  item.id === activeNavId
                    ? 'bg-primary-container text-on-primary-container font-headline-sm'
                    : item.to
                      ? 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      : 'font-label-md text-label-md text-outline-variant cursor-not-allowed'
                }`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-space-md">
          <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-space-xs">
              <Icon name="verified" className="text-[14px]" />
              Tier 1 Certified Dealer
            </span>
            <p className="font-body-sm text-body-sm text-outline">Floorplan cap: $450,000 active</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg font-label-md text-label-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-left"
          >
            <Icon name="arrow_back" className="text-[20px]" />
            Exit to Public Market
          </button>
        </div>
      </aside>

      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] z-40 flex items-center justify-between px-gutter-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center bg-surface-container-low rounded-lg px-space-md py-space-xs gap-space-sm w-96">
              <Icon name="search" className="text-outline text-[18px]" />
              <input
                className="bg-transparent border-none text-on-surface placeholder:text-outline text-body-sm font-body-sm w-full focus:outline-none"
                placeholder="Filter VIN, Stock #, or Customer..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            {headerRight}
            <button
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
              className="p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[22px]" />
            </button>
            <button
              aria-label="Notifications"
              onClick={() => navigate('/messages')}
              className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
            </button>
            <div className="h-6 w-px bg-surface-container-high" />
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="person" className="text-on-primary text-[18px]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-on-surface">Dealer Operator</span>
                <span className="font-body-sm text-body-sm text-outline">Floor Manager</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-20 bg-surface min-h-screen">{children}</main>
      </div>
    </div>
  )
}
