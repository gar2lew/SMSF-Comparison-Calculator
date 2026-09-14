import { describe, expect, it } from 'vitest'
import { STAFF_OPTIONS } from './constants'

describe('staff login options', () => {
  it('keeps a placeholder option before selectable staff names', () => {
    expect(STAFF_OPTIONS[0]).toEqual({ value: '', label: 'Choose your name' })
    expect(STAFF_OPTIONS.length).toBeGreaterThan(1)
    expect(STAFF_OPTIONS.slice(1).every((option) => option.value && option.label)).toBe(true)
  })
})
