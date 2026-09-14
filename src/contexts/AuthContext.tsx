import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { db } from '../lib/db'
import type { AuthUser } from '../lib/auth'
import type { User } from '../lib/db/schema'

export interface AuthContextValue {
  user: AuthUser | null
  // The app-level profile doc (role, etc.) — separate from `user` because
  // Firebase Auth only knows identity (uid/name/email/photo), not app
  // concepts like consumer-vs-dealer. Same loading gate as `user`.
  profile: User | null
  loading: boolean
  error: string
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// firebase/auth is dynamically imported so it never enters the main bundle
// for the (likely common) case of a visitor who never signs in — matches
// the pattern used by the sibling portfolio apps for the same reason.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const provisioned = useRef(new Set<string>())

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    import('../lib/auth')
      .then(({ watchAuth }) => {
        if (cancelled) return
        unsubscribe = watchAuth(async (nextUser) => {
          setUser(nextUser)
          if (!nextUser) {
            setProfile(null)
            setLoading(false)
            return
          }
          let userProfile = await db.getUser(nextUser.uid)
          if (!userProfile && !provisioned.current.has(nextUser.uid)) {
            provisioned.current.add(nextUser.uid)
            userProfile = {
              id: nextUser.uid,
              type: 'consumer',
              email: nextUser.email ?? '',
              displayName: nextUser.displayName ?? 'BudgetWheels User',
              photoUrl: nextUser.photoURL,
              phone: null,
              createdAt: Date.now(),
            }
            await db.putUser(userProfile)
          }
          if (!cancelled) {
            setProfile(userProfile)
            setLoading(false)
          }
        })
      })
      .catch(() => {
        // No Firebase project configured yet (VITE_FIREBASE_* unset) — treat
        // as "definitely signed out" rather than hanging in a loading state
        // forever. Sign-in itself still surfaces a clear error via signIn().
        if (!cancelled) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const signIn = useCallback(async () => {
    setError('')
    try {
      const { signInWithGoogle } = await import('../lib/auth')
      await signInWithGoogle()
    } catch (err) {
      const { mapAuthError } = await import('../lib/auth')
      setError(mapAuthError(err))
    }
  }, [])

  const signOut = useCallback(async () => {
    const { signOutUser } = await import('../lib/auth')
    await signOutUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
