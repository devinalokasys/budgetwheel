import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAuth, type Auth } from 'firebase/auth'

// No Firebase project exists for budgetwheel yet (unlike every sibling
// repo, which hardcodes a real projectId/apiKey — those are public client
// identifiers, not secrets, safe to commit once a project exists). Until
// then this reads from env vars so an empty/missing config fails loudly at
// the one call site that needs it instead of shipping a fake placeholder
// project id that looks real but isn't. Auth uses this regardless of
// VITE_DATA_PROVIDER (sign-in works even with the local IndexedDB data
// backend) — only Firestore/Storage access is gated by that switch.
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

let app: FirebaseApp | null = null
let firestoreDb: Firestore | null = null
let storage: FirebaseStorage | null = null
let auth: Auth | null = null

function ensureApp(): FirebaseApp {
  if (!firebaseConfig.projectId) {
    throw new Error(
      'A Firebase feature was used but VITE_FIREBASE_* env vars are not set. ' +
        'See .env.example — a Firebase project for budgetwheel does not exist yet.',
    )
  }
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) firestoreDb = getFirestore(ensureApp())
  return firestoreDb
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(ensureApp())
  return storage
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(ensureApp())
  return auth
}
