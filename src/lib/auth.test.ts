import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, firebaseAuthMocks } = vi.hoisted(() => ({
  authMock: { __brand: 'fake-auth-instance' },
  firebaseAuthMocks: {
    onAuthStateChanged: vi.fn(),
    setPersistence: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    browserLocalPersistence: { __brand: 'fake-persistence' },
  },
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: firebaseAuthMocks.onAuthStateChanged,
  setPersistence: firebaseAuthMocks.setPersistence,
  signInWithPopup: firebaseAuthMocks.signInWithPopup,
  signInWithRedirect: firebaseAuthMocks.signInWithRedirect,
  signOut: firebaseAuthMocks.signOut,
  GoogleAuthProvider: firebaseAuthMocks.GoogleAuthProvider,
  browserLocalPersistence: firebaseAuthMocks.browserLocalPersistence,
}))

vi.mock('./firebase', () => ({
  getFirebaseAuth: vi.fn(() => authMock),
}))

const { watchAuth, signInWithGoogle, signOutUser, mapAuthError } = await import('./auth')

beforeEach(() => {
  firebaseAuthMocks.onAuthStateChanged.mockReset()
  firebaseAuthMocks.setPersistence.mockReset().mockResolvedValue(undefined)
  firebaseAuthMocks.signInWithPopup.mockReset()
  firebaseAuthMocks.signInWithRedirect.mockReset().mockResolvedValue(undefined)
  firebaseAuthMocks.signOut.mockReset().mockResolvedValue(undefined)
})

function firebaseErrorLike(code: string): Error & { code: string } {
  const err = new Error(`firebase error ${code}`) as Error & { code: string }
  err.code = code
  return err
}

describe('watchAuth', () => {
  it('subscribes via onAuthStateChanged against the shared auth instance and returns its unsubscribe fn', () => {
    const unsubscribe = vi.fn()
    firebaseAuthMocks.onAuthStateChanged.mockReturnValue(unsubscribe)
    const cb = vi.fn()

    const returned = watchAuth(cb)

    expect(firebaseAuthMocks.onAuthStateChanged).toHaveBeenCalledTimes(1)
    expect(firebaseAuthMocks.onAuthStateChanged.mock.calls[0][0]).toBe(authMock)
    expect(returned).toBe(unsubscribe)
  })

  it('maps a signed-in Firebase user to the exact AuthUser shape', () => {
    let innerCallback: (user: unknown) => void = () => {}
    firebaseAuthMocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      innerCallback = callback
      return vi.fn()
    })
    const cb = vi.fn()
    watchAuth(cb)

    innerCallback({
      uid: 'uid-123',
      displayName: 'Marcus Sterling',
      email: 'marcus@example.com',
      photoURL: 'https://example.com/p.png',
    })

    expect(cb).toHaveBeenCalledExactlyOnceWith({
      uid: 'uid-123',
      displayName: 'Marcus Sterling',
      email: 'marcus@example.com',
      photoURL: 'https://example.com/p.png',
    })
  })

  it('forwards null straight through for a signed-out state, without mapping', () => {
    let innerCallback: (user: unknown) => void = () => {}
    firebaseAuthMocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      innerCallback = callback
      return vi.fn()
    })
    const cb = vi.fn()
    watchAuth(cb)

    innerCallback(null)

    expect(cb).toHaveBeenCalledExactlyOnceWith(null)
  })
})

describe('signInWithGoogle', () => {
  it('sets local persistence and resolves on a successful popup sign-in, without ever redirecting', async () => {
    firebaseAuthMocks.signInWithPopup.mockResolvedValue(undefined)

    await signInWithGoogle()

    expect(firebaseAuthMocks.setPersistence).toHaveBeenCalledExactlyOnceWith(
      authMock,
      firebaseAuthMocks.browserLocalPersistence,
    )
    expect(firebaseAuthMocks.signInWithPopup).toHaveBeenCalledTimes(1)
    expect(firebaseAuthMocks.signInWithPopup.mock.calls[0][0]).toBe(authMock)
    expect(firebaseAuthMocks.signInWithRedirect).not.toHaveBeenCalled()
  })

  it('falls back to signInWithRedirect specifically on auth/popup-blocked, and resolves', async () => {
    firebaseAuthMocks.signInWithPopup.mockRejectedValue(firebaseErrorLike('auth/popup-blocked'))

    await expect(signInWithGoogle()).resolves.toBeUndefined()

    expect(firebaseAuthMocks.signInWithRedirect).toHaveBeenCalledTimes(1)
    expect(firebaseAuthMocks.signInWithRedirect.mock.calls[0][0]).toBe(authMock)
  })

  it('re-throws any other Error-with-code without falling back to redirect', async () => {
    const err = firebaseErrorLike('auth/popup-closed-by-user')
    firebaseAuthMocks.signInWithPopup.mockRejectedValue(err)

    await expect(signInWithGoogle()).rejects.toBe(err)
    expect(firebaseAuthMocks.signInWithRedirect).not.toHaveBeenCalled()
  })

  it('re-throws an Error that has no .code property at all', async () => {
    const err = new Error('generic failure')
    firebaseAuthMocks.signInWithPopup.mockRejectedValue(err)

    await expect(signInWithGoogle()).rejects.toBe(err)
    expect(firebaseAuthMocks.signInWithRedirect).not.toHaveBeenCalled()
  })

  it('re-throws a rejection that is not an Error instance at all', async () => {
    firebaseAuthMocks.signInWithPopup.mockRejectedValue('just a string')

    await expect(signInWithGoogle()).rejects.toBe('just a string')
    expect(firebaseAuthMocks.signInWithRedirect).not.toHaveBeenCalled()
  })
})

describe('signOutUser', () => {
  it('signs out against the shared auth instance', async () => {
    await signOutUser()
    expect(firebaseAuthMocks.signOut).toHaveBeenCalledExactlyOnceWith(authMock)
  })
})

describe('mapAuthError', () => {
  it.each([
    ['auth/popup-closed-by-user', 'Sign-in was cancelled.'],
    ['auth/network-request-failed', 'Network error — check your connection and try again.'],
    ['auth/cancelled-popup-request', ''],
    ['auth/some-unrecognized-code', 'Sign-in failed. Please try again.'],
  ])('maps code %s to exactly %j', (code, expected) => {
    expect(mapAuthError(firebaseErrorLike(code))).toBe(expected)
  })

  it('falls back to the generic message for an Error without a .code property', () => {
    expect(mapAuthError(new Error('no code here'))).toBe('Sign-in failed. Please try again.')
  })

  it('falls back to the generic message for a non-Error value', () => {
    expect(mapAuthError('not an error')).toBe('Sign-in failed. Please try again.')
    expect(mapAuthError(undefined)).toBe('Sign-in failed. Please try again.')
    expect(mapAuthError({ code: 'auth/network-request-failed' })).toBe(
      'Sign-in failed. Please try again.',
    )
  })
})
