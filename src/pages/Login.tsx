import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, loading, error, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as { from?: Location })?.from
      navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true })
    }
  }, [user, loading, location.state, navigate])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-space-md">
      <div className="w-full max-w-sm flex flex-col items-center gap-space-lg text-center">
        <img
          alt="BudgetWheels"
          className="h-10 w-auto object-contain rounded-md"
          src="/images/logo-brand.jpg"
        />
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Welcome back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {import.meta.env.VITE_APP_ROLE === 'dealer'
              ? 'Sign in to manage your inventory, trade-in bids, and buyer leads.'
              : 'Sign in to save listings, sell your car, and message dealers.'}
          </p>
        </div>

        {error && (
          <div className="w-full px-space-md py-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
            {error}
          </div>
        )}

        <button
          onClick={signIn}
          className="w-full h-12 flex items-center justify-center gap-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm transition-colors"
        >
          <Icon name="account_circle" className="text-[20px]" />
          Continue with Google
        </button>

        <p className="font-body-sm text-body-sm text-outline max-w-xs">
          By continuing, you agree to BudgetWheels' Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
