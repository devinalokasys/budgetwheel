import { localProvider } from './localProvider'
import type { DataProvider } from './provider'

// Default is local — an unset VITE_DATA_PROVIDER (the common case, since
// no Firebase project exists for this app yet) must never try to reach a
// nonexistent Firestore project. Firestore is loaded lazily (dynamic
// import) so its SDK isn't even bundled into the local-only dev path.
async function resolveProvider(): Promise<DataProvider> {
  if (import.meta.env.VITE_DATA_PROVIDER === 'firestore') {
    const { firestoreProvider } = await import('./firestoreProvider')
    return firestoreProvider
  }
  return localProvider
}

const providerPromise = resolveProvider()

// Every method is async already, so proxying through the not-yet-resolved
// provider promise is transparent to callers: `await db.listListings()`
// works identically whether the underlying provider was already resolved.
export const db: DataProvider = new Proxy({} as DataProvider, {
  get(_target, prop: keyof DataProvider) {
    return async (...args: unknown[]) => {
      const provider = await providerPromise
      return (provider[prop] as (...a: unknown[]) => unknown)(...args)
    }
  },
})

export type { DataProvider, ListingFilter } from './provider'
export * from './schema'
