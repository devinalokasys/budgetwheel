import { describe, it, expect, vi, beforeEach } from 'vitest'

const { appMocks } = vi.hoisted(() => ({
  appMocks: {
    initializeApp: vi.fn(),
    getFirestore: vi.fn(),
    getStorage: vi.fn(),
    getAuth: vi.fn(),
  },
}))

vi.mock('firebase/app', () => ({ initializeApp: appMocks.initializeApp }))
vi.mock('firebase/firestore', () => ({ getFirestore: appMocks.getFirestore }))
vi.mock('firebase/storage', () => ({ getStorage: appMocks.getStorage }))
vi.mock('firebase/auth', () => ({ getAuth: appMocks.getAuth }))

const REAL_ENV = {
  VITE_FIREBASE_PROJECT_ID: 'budgetwheel-test',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
  VITE_FIREBASE_STORAGE_BUCKET: 'budgetwheel-test.appspot.com',
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'budgetwheel-test.firebaseapp.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456',
}

function stubEmptyEnv() {
  for (const key of Object.keys(REAL_ENV)) vi.stubEnv(key, '')
}

function stubRealEnv() {
  for (const [key, value] of Object.entries(REAL_ENV)) vi.stubEnv(key, value)
}

beforeEach(() => {
  appMocks.initializeApp.mockReset()
  appMocks.getFirestore.mockReset()
  appMocks.getStorage.mockReset()
  appMocks.getAuth.mockReset()
  vi.resetModules()
})

describe('when VITE_FIREBASE_PROJECT_ID is unset', () => {
  const expectedMessage =
    'A Firebase feature was used but VITE_FIREBASE_* env vars are not set. ' +
    'See .env.example — a Firebase project for budgetwheel does not exist yet.'

  it('getFirestoreDb throws instead of calling initializeApp', async () => {
    stubEmptyEnv()
    const { getFirestoreDb } = await import('./firebase')
    expect(() => getFirestoreDb()).toThrowError(expectedMessage)
    expect(appMocks.initializeApp).not.toHaveBeenCalled()
  })

  it('getFirebaseStorage throws instead of calling initializeApp', async () => {
    stubEmptyEnv()
    const { getFirebaseStorage } = await import('./firebase')
    expect(() => getFirebaseStorage()).toThrowError(expectedMessage)
    expect(appMocks.initializeApp).not.toHaveBeenCalled()
  })

  it('getFirebaseAuth throws instead of calling initializeApp', async () => {
    stubEmptyEnv()
    const { getFirebaseAuth } = await import('./firebase')
    expect(() => getFirebaseAuth()).toThrowError(expectedMessage)
    expect(appMocks.initializeApp).not.toHaveBeenCalled()
  })
})

describe('when VITE_FIREBASE_* env vars are set', () => {
  it('getFirestoreDb initializes the app once and returns the Firestore instance', async () => {
    stubRealEnv()
    const fakeApp = { __brand: 'app' }
    const fakeDb = { __brand: 'firestore' }
    appMocks.initializeApp.mockReturnValue(fakeApp)
    appMocks.getFirestore.mockReturnValue(fakeDb)

    const { getFirestoreDb } = await import('./firebase')
    const result = getFirestoreDb()

    expect(result).toBe(fakeDb)
    expect(appMocks.initializeApp).toHaveBeenCalledExactlyOnceWith(REAL_ENV_AS_CONFIG())
    expect(appMocks.getFirestore).toHaveBeenCalledExactlyOnceWith(fakeApp)
  })

  it('reuses the cached Firestore instance on a second call, without re-initializing anything', async () => {
    stubRealEnv()
    appMocks.initializeApp.mockReturnValue({ __brand: 'app' })
    appMocks.getFirestore.mockReturnValue({ __brand: 'firestore' })

    const { getFirestoreDb } = await import('./firebase')
    getFirestoreDb()
    getFirestoreDb()

    expect(appMocks.initializeApp).toHaveBeenCalledTimes(1)
    expect(appMocks.getFirestore).toHaveBeenCalledTimes(1)
  })

  it('getFirebaseStorage initializes the app once and returns the Storage instance', async () => {
    stubRealEnv()
    const fakeApp = { __brand: 'app' }
    const fakeStorage = { __brand: 'storage' }
    appMocks.initializeApp.mockReturnValue(fakeApp)
    appMocks.getStorage.mockReturnValue(fakeStorage)

    const { getFirebaseStorage } = await import('./firebase')
    const result = getFirebaseStorage()

    expect(result).toBe(fakeStorage)
    expect(appMocks.getStorage).toHaveBeenCalledExactlyOnceWith(fakeApp)
  })

  it('reuses the cached Storage instance on a second call', async () => {
    stubRealEnv()
    appMocks.initializeApp.mockReturnValue({ __brand: 'app' })
    appMocks.getStorage.mockReturnValue({ __brand: 'storage' })

    const { getFirebaseStorage } = await import('./firebase')
    getFirebaseStorage()
    getFirebaseStorage()

    expect(appMocks.initializeApp).toHaveBeenCalledTimes(1)
    expect(appMocks.getStorage).toHaveBeenCalledTimes(1)
  })

  it('getFirebaseAuth initializes the app once and returns the Auth instance', async () => {
    stubRealEnv()
    const fakeApp = { __brand: 'app' }
    const fakeAuth = { __brand: 'auth' }
    appMocks.initializeApp.mockReturnValue(fakeApp)
    appMocks.getAuth.mockReturnValue(fakeAuth)

    const { getFirebaseAuth } = await import('./firebase')
    const result = getFirebaseAuth()

    expect(result).toBe(fakeAuth)
    expect(appMocks.getAuth).toHaveBeenCalledExactlyOnceWith(fakeApp)
  })

  it('reuses the cached Auth instance on a second call', async () => {
    stubRealEnv()
    appMocks.initializeApp.mockReturnValue({ __brand: 'app' })
    appMocks.getAuth.mockReturnValue({ __brand: 'auth' })

    const { getFirebaseAuth } = await import('./firebase')
    getFirebaseAuth()
    getFirebaseAuth()

    expect(appMocks.initializeApp).toHaveBeenCalledTimes(1)
    expect(appMocks.getAuth).toHaveBeenCalledTimes(1)
  })

  it('shares one initializeApp call across different service getters', async () => {
    stubRealEnv()
    appMocks.initializeApp.mockReturnValue({ __brand: 'app' })
    appMocks.getFirestore.mockReturnValue({ __brand: 'firestore' })
    appMocks.getAuth.mockReturnValue({ __brand: 'auth' })

    const { getFirestoreDb, getFirebaseAuth } = await import('./firebase')
    getFirestoreDb()
    getFirebaseAuth()

    expect(appMocks.initializeApp).toHaveBeenCalledTimes(1)
  })
})

function REAL_ENV_AS_CONFIG() {
  return {
    projectId: REAL_ENV.VITE_FIREBASE_PROJECT_ID,
    appId: REAL_ENV.VITE_FIREBASE_APP_ID,
    storageBucket: REAL_ENV.VITE_FIREBASE_STORAGE_BUCKET,
    apiKey: REAL_ENV.VITE_FIREBASE_API_KEY,
    authDomain: REAL_ENV.VITE_FIREBASE_AUTH_DOMAIN,
    messagingSenderId: REAL_ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
  }
}
