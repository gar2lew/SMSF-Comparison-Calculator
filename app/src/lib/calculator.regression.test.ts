import { describe, expect, it } from 'vitest'
import { projectYearlySeries } from './calculator'
import type { ScenarioInput } from './types'

const base: ScenarioInput = {
  currentBalance: 100000,
  salary: 40000,
  employerRate: 0.12,
  growthRate: 0.05,
  projectionYears: 10,
  salarySacrificeEnabled: false,
  salarySacrificePercent: 5,
  fundType: 'current',
}

describe('original calculator regression fixtures', () => {
  it.each([
    ['baseline current super', base, 226282.04],
    ['baseline SMSF', { ...base, fundType: 'smsf' as const, growthRate: 0.1 }, 343523.85],
    ['SMSF with 5% salary sacrifice', { ...base, fundType: 'smsf' as const, growthRate: 0.1, salarySacrificeEnabled: true }, 378586.18],
    ['zero starting balance', { ...base, currentBalance: 0 }, 63392.58],
    ['thirty-year SMSF', { ...base, fundType: 'smsf' as const, growthRate: 0.1, projectionYears: 30 }, 2613468.67],
  ])('preserves %s output', (_name, input, expected) => {
    expect(projectYearlySeries(input).finalBalance).toBeCloseTo(expected as number, 2)
  })
})
