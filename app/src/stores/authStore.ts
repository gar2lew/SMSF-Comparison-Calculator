import { create } from 'zustand'
import type { User } from 'firebase/auth'
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getProfile } from '@/lib/firestore'
import type { Profile } from '@/lib/types'

interface AuthState {
  firebaseUser: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean

  setAuth: (firebaseUser: User | null, profile: Profile | null) => void
  reset: () => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  loading: true,
  initialized: false,

  setAuth: (firebaseUser, profile) => {
    set({
      firebaseUser,
      profile,
      loading: false,
      initialized: true,
    })
  },

  reset: () => {
    set({
      firebaseUser: null,
      profile: null,
      loading: false,
      initialized: true,
    })
  },

  signIn: async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getProfile(cred.user.uid)
      if (!profile) {
        await firebaseSignOut(auth)
        return { error: 'Account not configured. Contact your administrator.' }
      }
      set({
        firebaseUser: cred.user,
        profile,
        loading: false,
        initialized: true,
      })
      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      return { error: message }
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth)
    } finally {
      set({
        firebaseUser: null,
        profile: null,
        loading: false,
        initialized: true,
      })
    }
  },
}))
