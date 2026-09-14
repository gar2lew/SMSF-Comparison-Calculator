import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADVISER_SESSION_KEY,
  clearAdviserSession,
  readAdviserSession,
  writeAdviserSession,
} from './adviserSession'

describe('adviser session', () => {
  beforeEach(() => sessionStorage.clear())

  it('returns null when no adviser is stored', () => {
    expect(readAdviserSession()).toBeNull()
  })

  it('writes and reads a valid adviser', () => {
    writeAdviserSession({ id: 'mike-enderby', name: 'Mike Enderby' })
    expect(readAdviserSession()).toEqual({ id: 'mike-enderby', name: 'Mike Enderby' })
  })

  it('rejects malformed stored data', () => {
    sessionStorage.setItem(ADVISER_SESSION_KEY, '{not-json')
    expect(readAdviserSession()).toBeNull()
    expect(sessionStorage.getItem(ADVISER_SESSION_KEY)).toBeNull()
  })

  it('rejects unknown adviser IDs', () => {
    sessionStorage.setItem(
      ADVISER_SESSION_KEY,
      JSON.stringify({ id: 'unknown-adviser', name: 'Unknown Adviser' }),
    )
    expect(readAdviserSession()).toBeNull()
  })

  it('uses the configured name instead of trusting stored display text', () => {
    sessionStorage.setItem(
      ADVISER_SESSION_KEY,
      JSON.stringify({ id: 'mike-enderby', name: 'Someone Else' }),
    )
    expect(readAdviserSession()).toEqual({ id: 'mike-enderby', name: 'Mike Enderby' })
  })

  it('clears the current adviser', () => {
    writeAdviserSession({ id: 'mike-enderby', name: 'Mike Enderby' })
    clearAdviserSession()
    expect(readAdviserSession()).toBeNull()
  })
})
