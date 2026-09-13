import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { db } from '../lib/db'
import type { AuthUser } from '../lib/auth'

export interface AuthContextValue {
  user: AuthUser | null
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
          setLoading(false)
          if (nextUser && !provisioned.current.has(nextUser.uid)) {
            provisioned.current.add(nextUser.uid)
            const existing = await db.getUser(nextUser.uid)
            if (!existing) {
              await db.putUser({
                id: nextUser.uid,
                type: 'consumer',
                email: nextUser.email ?? '',
                displayName: nextUser.displayName ?? 'BudgetWheels User',
                photoUrl: nextUser.photoURL,
                phone: null,
                createdAt: Date.now(),
              })
            }
          }
        })
      })
      .catch(() => {
        // No Firebase project configured yet (VITE_FIREBASE_* unset) — treat
        // as "definitely signed out" rather than hanging in a loading state
        // forever. Sign-in itself still surfaces a clear error via signIn().
        if (!cancelled) {
          setUser(null)
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
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
