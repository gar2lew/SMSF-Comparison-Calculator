import { STAFF_OPTIONS } from './constants'

export interface AdviserSession {
  id: string
  name: string
}

export const ADVISER_SESSION_KEY = 'asg-smsf-adviser-session-v1'

const advisers = new Map(
  STAFF_OPTIONS.filter((option) => option.value).map((option) => [option.value, option.label]),
)

export function readAdviserSession(): AdviserSession | null {
  const stored = sessionStorage.getItem(ADVISER_SESSION_KEY)
  if (!stored) return null

  try {
    const value = JSON.parse(stored) as Partial<AdviserSession>
    const name = typeof value.id === 'string' ? advisers.get(value.id) : undefined
    if (!name) {
      sessionStorage.removeItem(ADVISER_SESSION_KEY)
      return null
    }
    return { id: value.id as string, name }
  } catch {
    sessionStorage.removeItem(ADVISER_SESSION_KEY)
    return null
  }
}

export function writeAdviserSession(adviser: AdviserSession): void {
  const name = advisers.get(adviser.id)
  if (!name) throw new Error('Unknown adviser')
  sessionStorage.setItem(ADVISER_SESSION_KEY, JSON.stringify({ id: adviser.id, name }))
}

export function clearAdviserSession(): void {
  sessionStorage.removeItem(ADVISER_SESSION_KEY)
}
