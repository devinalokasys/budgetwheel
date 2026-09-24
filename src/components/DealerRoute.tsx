import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import DealerRegistrationForm from './DealerRegistrationForm'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'
import type { DealerProfile } from '../lib/db/schema'

// Stricter than ProtectedRoute: requires not just a signed-in user but a
// dealer-type profile. This is the UI-side half of dealer/consumer
// segregation — the Firestore rules are the half that actually matters
// (a consumer's auth token can't be trusted to respect this on its own),
// this just keeps the UI honest and gives a clear message instead of a
// confusing permission error deeper in the page.
export default function DealerRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null | undefined>(undefined)

  useEffect(() => {
    if (profile?.type === 'dealer' && user) {
      db.getDealerProfile(user.uid).then(setDealerProfile)
    }
  }, [profile, user])

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (profile?.type !== 'dealer') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface px-space-md">
        <div className="flex flex-col items-center gap-space-sm text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon name="storefront" className="text-[28px]" />
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Dealer accounts only</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            This account isn't registered as a dealer. Sign in through the Dealer Portal to
            register a dealer account.
          </p>
        </div>
      </div>
    )
  }

  if (dealerProfile === undefined) return null
  if (dealerProfile === null) {
    return <DealerRegistrationForm onComplete={setDealerProfile} />
  }

  return <>{children}</>
}
