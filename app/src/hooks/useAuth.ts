import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getProfile } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getProfile(firebaseUser.uid)
          store.setAuth(firebaseUser, profile)
        } catch {
          store.setAuth(firebaseUser, null)
        }
      } else {
        store.reset()
      }
    })

    return unsubscribe
  }, [])

  return store
}
