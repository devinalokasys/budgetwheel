import { describe, it, expect, vi, beforeEach } from 'vitest'

const { localProviderMock, firestoreProviderMock } = vi.hoisted(() => ({
  localProviderMock: {
    listListings: vi.fn(async () => 'local-result'),
    getListing: vi.fn(async () => 'local-get-result'),
  },
  firestoreProviderMock: {
    listListings: vi.fn(async () => 'firestore-result'),
    getListing: vi.fn(async () => 'firestore-get-result'),
  },
}))

vi.mock('./localProvider', () => ({ localProvider: localProviderMock }))
vi.mock('./firestoreProvider', () => ({ firestoreProvider: firestoreProviderMock }))

beforeEach(() => {
  localProviderMock.listListings.mockClear()
  localProviderMock.getListing.mockClear()
  firestoreProviderMock.listListings.mockClear()
  firestoreProviderMock.getListing.mockClear()
  vi.resetModules()
})

describe('db proxy provider resolution', () => {
  it('defaults to the local provider when VITE_DATA_PROVIDER is unset', async () => {
    vi.stubEnv('VITE_DATA_PROVIDER', '')
    const { db } = await import('./index')

    const result = await db.listListings()

    expect(result).toBe('local-result')
    expect(localProviderMock.listListings).toHaveBeenCalledTimes(1)
    expect(firestoreProviderMock.listListings).not.toHaveBeenCalled()
  })

  it('defaults to the local provider for any non-"firestore" value', async () => {
    vi.stubEnv('VITE_DATA_PROVIDER', 'something-else')
    const { db } = await import('./index')

    await db.listListings()

    expect(localProviderMock.listListings).toHaveBeenCalledTimes(1)
    expect(firestoreProviderMock.listListings).not.toHaveBeenCalled()
  })

  it('resolves the firestore provider when VITE_DATA_PROVIDER is exactly "firestore"', async () => {
    vi.stubEnv('VITE_DATA_PROVIDER', 'firestore')
    const { db } = await import('./index')

    const result = await db.listListings()

    expect(result).toBe('firestore-result')
    expect(firestoreProviderMock.listListings).toHaveBeenCalledTimes(1)
    expect(localProviderMock.listListings).not.toHaveBeenCalled()
  })

  it('forwards call arguments through to the resolved provider method', async () => {
    vi.stubEnv('VITE_DATA_PROVIDER', '')
    const { db } = await import('./index')

    await db.getListing('listing-42')

    expect(localProviderMock.getListing).toHaveBeenCalledExactlyOnceWith('listing-42')
  })

  it('reuses the same resolved provider across multiple different method calls', async () => {
    vi.stubEnv('VITE_DATA_PROVIDER', '')
    const { db } = await import('./index')

    await db.listListings()
    await db.getListing('x')

    expect(localProviderMock.listListings).toHaveBeenCalledTimes(1)
    expect(localProviderMock.getListing).toHaveBeenCalledTimes(1)
  })
})
