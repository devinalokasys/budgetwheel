import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

function toAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

export function watchAuth(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    callback(user ? toAuthUser(user) : null)
  })
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth()
  await setPersistence(auth, browserLocalPersistence)
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
      return
    }
    throw error
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth())
}

export function mapAuthError(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.'
      case 'auth/network-request-failed':
        return 'Network error — check your connection and try again.'
      case 'auth/cancelled-popup-request':
        return ''
      default:
        return 'Sign-in failed. Please try again.'
    }
  }
  return 'Sign-in failed. Please try again.'
}
