import { describe, expect, it } from 'vitest'
import {
  DEFAULT_COMPARISON_STATE,
  calculateComparison,
  decodeComparisonQuery,
  encodeComparisonQuery,
  getMilestoneYears,
} from './comparisonState'

describe('comparison state', () => {
  it('uses the original calculator defaults', () => {
    expect(DEFAULT_COMPARISON_STATE.current).toMatchObject({ currentBalance: 100000, salary: 40000, growthRate: 0.05 })
    expect(DEFAULT_COMPARISON_STATE.smsf).toMatchObject({ currentBalance: 100000, salary: 40000, growthRate: 0.1 })
  })

  it('calculates the winner and deltas', () => {
    const outcome = calculateComparison(DEFAULT_COMPARISON_STATE)
    expect(outcome.winner).toBe('smsf')
    expect(outcome.deltaFinal).toBeCloseTo(117241.81, 2)
    expect(outcome.yearsCompared).toBe(10)
  })

  it('round trips the original share query format', () => {
    const encoded = encodeComparisonQuery(DEFAULT_COMPARISON_STATE)
    expect(encoded).toContain('lb=100000')
    expect(encoded).toContain('rg=0.1')
    expect(decodeComparisonQuery(`?${encoded}`)).toEqual(DEFAULT_COMPARISON_STATE)
  })

  it('falls back safely for invalid query values', () => {
    expect(decodeComparisonQuery('?lb=not-a-number&ry=999')).toEqual(DEFAULT_COMPARISON_STATE)
  })

  it('returns concise milestone years unless expanded', () => {
    expect(getMilestoneYears(20)).toEqual([0, 1, 5, 10, 15, 20])
    expect(getMilestoneYears(5, true)).toEqual([0, 1, 2, 3, 4, 5])
  })
})
