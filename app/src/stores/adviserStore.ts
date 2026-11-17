import { create } from 'zustand'
import { STAFF_OPTIONS } from '@/lib/constants'
import {
  clearAdviserSession,
  readAdviserSession,
  writeAdviserSession,
  type AdviserSession,
} from '@/lib/adviserSession'

interface AdviserState {
  adviser: AdviserSession | null
  selectAdviser: (id: string) => boolean
  signOut: () => void
}

export const useAdviserStore = create<AdviserState>((set) => ({
  adviser: readAdviserSession(),
  selectAdviser: (id) => {
    const option = STAFF_OPTIONS.find((staff) => staff.value === id)
    if (!option || !option.value) return false
    const adviser = { id: option.value, name: option.label }
    writeAdviserSession(adviser)
    set({ adviser })
    return true
  },
  signOut: () => {
    clearAdviserSession()
    set({ adviser: null })
  },
}))
