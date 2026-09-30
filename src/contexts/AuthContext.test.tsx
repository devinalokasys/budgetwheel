import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext } from './AuthContext'
import { useContext } from 'react'
import type { AuthUser } from '../lib/auth'
import type { User } from '../lib/db/schema'

const { dbMock, authLibMocks } = vi.hoisted(() => ({
  dbMock: { getUser: vi.fn(), putUser: vi.fn() },
  authLibMocks: {
    watchAuth: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
    mapAuthError: vi.fn(() => 'mapped error'),
  },
}))

vi.mock('../lib/db', () => ({ db: dbMock }))
vi.mock('../lib/auth', () => authLibMocks)

function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('no context')
  return ctx
}

function renderAuth() {
  return renderHook(() => useAuthContext(), { wrapper: AuthProvider })
}

function fakeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return { uid: 'uid-1', displayName: 'Marcus', email: 'm@example.com', photoURL: 'https://x/p.png', ...overrides }
}

beforeEach(() => {
  dbMock.getUser.mockReset()
  dbMock.putUser.mockReset().mockResolvedValue(undefined)
  authLibMocks.watchAuth.mockReset()
  authLibMocks.signInWithGoogle.mockReset()
  authLibMocks.signOutUser.mockReset()
  authLibMocks.mapAuthError.mockReset().mockReturnValue('mapped error')
  vi.unstubAllEnvs()
})

describe('initial state', () => {
  it('starts loading with no user, no profile, and no error', () => {
    authLibMocks.watchAuth.mockReturnValue(vi.fn())
    const { result } = renderAuth()
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBe('')
  })
})

describe('sign-out auth state', () => {
  it('clears user and profile and stops loading when the auth callback reports signed out', async () => {
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(null))

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(dbMock.getUser).not.toHaveBeenCalled()
  })
})

describe('signed-in with an existing profile', () => {
  it('uses the existing profile without provisioning a new one', async () => {
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    const existing: User = {
      id: 'uid-1',
      type: 'dealer',
      email: 'm@example.com',
      displayName: 'Marcus',
      photoUrl: null,
      phone: null,
      createdAt: 1,
    }
    dbMock.getUser.mockResolvedValue(existing)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(fakeUser()))

    expect(result.current.user).toEqual(fakeUser())
    expect(result.current.profile).toEqual(existing)
    expect(result.current.loading).toBe(false)
    expect(dbMock.putUser).not.toHaveBeenCalled()
  })
})

describe('first sign-in provisioning', () => {
  it('provisions a consumer profile by default (VITE_APP_ROLE unset)', async () => {
    vi.stubEnv('VITE_APP_ROLE', '')
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    dbMock.getUser.mockResolvedValue(null)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(fakeUser({ uid: 'new-uid' })))

    expect(dbMock.putUser).toHaveBeenCalledTimes(1)
    const saved = dbMock.putUser.mock.calls[0][0]
    expect(saved.type).toBe('consumer')
    expect(saved.id).toBe('new-uid')
    expect(result.current.profile).toEqual(saved)
  })

  it('provisions a dealer profile when VITE_APP_ROLE is "dealer"', async () => {
    vi.stubEnv('VITE_APP_ROLE', 'dealer')
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    dbMock.getUser.mockResolvedValue(null)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(fakeUser()))

    expect(dbMock.putUser.mock.calls[0][0].type).toBe('dealer')
    expect(result.current.profile?.type).toBe('dealer')
  })

  it('falls back to a generic display name and empty email when the Firebase user has neither', async () => {
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    dbMock.getUser.mockResolvedValue(null)
    renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(fakeUser({ displayName: null, email: null, photoURL: null })))

    const saved = dbMock.putUser.mock.calls[0][0]
    expect(saved.displayName).toBe('BudgetWheels User')
    expect(saved.email).toBe('')
    expect(saved.photoUrl).toBeNull()
    expect(saved.phone).toBeNull()
    expect(typeof saved.createdAt).toBe('number')
  })

  it('never provisions twice for the same uid, even if the profile fetch returns null again on a second callback', async () => {
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    dbMock.getUser.mockResolvedValue(null)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => authCallback(fakeUser({ uid: 'repeat-uid' })))
    expect(dbMock.putUser).toHaveBeenCalledTimes(1)

    await act(async () => authCallback(fakeUser({ uid: 'repeat-uid' })))
    expect(dbMock.putUser).toHaveBeenCalledTimes(1)
    expect(result.current.profile).toBeNull()
  })
})

describe('dynamic import failure (no Firebase project configured)', () => {
  it('treats a failed lib/auth import as signed-out rather than hanging in loading forever', async () => {
    authLibMocks.watchAuth.mockImplementation(() => {
      throw new Error('boom')
    })
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})

describe('unmounting before the auth subscription resolves', () => {
  it('never subscribes to auth state when unmounted before the dynamic import resolves', async () => {
    authLibMocks.watchAuth.mockReturnValue(vi.fn())
    // renderHook()/act() flushes the effect synchronously but the dynamic
    // import('../lib/auth') it kicks off still resolves on a later
    // microtask (every other test in this file needs an explicit
    // `waitFor` for exactly this reason) — so unmounting synchronously
    // right here, with no await in between, sets `cancelled = true`
    // before that microtask runs.
    const { unmount } = renderAuth()
    unmount()
    await new Promise((r) => setTimeout(r, 10))
    expect(authLibMocks.watchAuth).not.toHaveBeenCalled()
  })

  it('unsubscribes from watchAuth on unmount', async () => {
    const unsubscribe = vi.fn()
    authLibMocks.watchAuth.mockReturnValue(unsubscribe)
    const { unmount } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('does not throw when a pending profile fetch resolves after unmount', async () => {
    let authCallback: (u: AuthUser | null) => void = () => {}
    authLibMocks.watchAuth.mockImplementation((cb) => {
      authCallback = cb
      return vi.fn()
    })
    let resolveGetUser: (u: User | null) => void = () => {}
    dbMock.getUser.mockReturnValue(
      new Promise<User | null>((resolve) => {
        resolveGetUser = resolve
      }),
    )
    const { unmount } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    let callbackPromise: Promise<void> | undefined
    act(() => {
      callbackPromise = authCallback(fakeUser()) as unknown as Promise<void>
    })
    unmount()
    resolveGetUser({
      id: 'uid-1',
      type: 'consumer',
      email: '',
      displayName: 'x',
      photoUrl: null,
      phone: null,
      createdAt: 1,
    })

    await expect(callbackPromise).resolves.not.toThrow()
  })
})

describe('signIn', () => {
  it('clears any previous error and calls signInWithGoogle on success', async () => {
    authLibMocks.watchAuth.mockReturnValue(vi.fn())
    authLibMocks.signInWithGoogle.mockResolvedValue(undefined)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => result.current.signIn())

    expect(authLibMocks.signInWithGoogle).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('')
  })

  it('maps a signInWithGoogle failure to an error message via mapAuthError', async () => {
    authLibMocks.watchAuth.mockReturnValue(vi.fn())
    const boom = new Error('popup blocked')
    authLibMocks.signInWithGoogle.mockRejectedValue(boom)
    authLibMocks.mapAuthError.mockReturnValue('Sign-in failed. Please try again.')
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => result.current.signIn())

    expect(authLibMocks.mapAuthError).toHaveBeenCalledWith(boom)
    expect(result.current.error).toBe('Sign-in failed. Please try again.')
  })
})

describe('signOut', () => {
  it('delegates to signOutUser', async () => {
    authLibMocks.watchAuth.mockReturnValue(vi.fn())
    authLibMocks.signOutUser.mockResolvedValue(undefined)
    const { result } = renderAuth()
    await waitFor(() => expect(authLibMocks.watchAuth).toHaveBeenCalled())

    await act(async () => result.current.signOut())

    expect(authLibMocks.signOutUser).toHaveBeenCalledTimes(1)
  })
})
