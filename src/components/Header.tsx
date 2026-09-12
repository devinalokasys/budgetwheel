import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useTheme } from '../hooks/useTheme'

interface HeaderProps {
  title: string
  showBack?: boolean
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
      <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0 flex-1">
          {showBack && (
            <button
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-highest transition-colors shrink-0"
            >
              <Icon name="arrow_back_ios_new" className="text-[20px]" />
            </button>
          )}
          <img
            alt="BudgetWheels"
            className="h-8 w-auto object-contain shrink-0 rounded-md"
            src="/images/logo-brand.jpg"
          />
          <span className="font-headline-sm text-headline-sm text-on-surface truncate tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[22px]" />
          </button>
          <button
            aria-label="Notifications"
            onClick={() => navigate('/messages')}
            className="w-11 h-11 relative flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="notifications" className="text-[22px]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  )
}
