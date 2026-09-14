import { projectYearlySeries } from './calculator'
import { MAX_BALANCE, MAX_SALARY } from './constants'
import type { ComparisonOutcome, ComparisonState, ScenarioInput } from './types'

export const DEFAULT_COMPARISON_STATE: ComparisonState = {
  current: {
    currentBalance: 100000,
    salary: 40000,
    employerRate: 0.12,
    growthRate: 0.05,
    projectionYears: 10,
    salarySacrificeEnabled: false,
    salarySacrificePercent: 5,
    fundType: 'current',
  },
  smsf: {
    currentBalance: 100000,
    salary: 40000,
    employerRate: 0.12,
    growthRate: 0.1,
    projectionYears: 10,
    salarySacrificeEnabled: false,
    salarySacrificePercent: 0,
    fundType: 'smsf',
  },
}

const queryKeys = {
  current: { balance: 'lb', salary: 'ls', employer: 'le', growth: 'lg', years: 'ly', sacrificeOn: 'lsOn', sacrifice: 'lss' },
  smsf: { balance: 'rb', salary: 'rs', employer: 're', growth: 'rg', years: 'ry', sacrificeOn: 'rsOn', sacrifice: 'rss' },
} as const

export function calculateComparison(state: ComparisonState): ComparisonOutcome {
  const current = projectYearlySeries(state.current)
  const smsf = projectYearlySeries(state.smsf)
  const winner = current.finalBalance === smsf.finalBalance
    ? 'tie'
    : smsf.finalBalance > current.finalBalance ? 'smsf' : 'current'

  return {
    current,
    smsf,
    winner,
    deltaFinal: smsf.finalBalance - current.finalBalance,
    deltaGrowthPct: smsf.growthPercent - current.growthPercent,
    yearsCompared: Math.min(state.current.projectionYears, state.smsf.projectionYears),
  }
}

export function encodeComparisonQuery(state: ComparisonState): string {
  const params = new URLSearchParams()
  for (const [side, input] of Object.entries(state) as [keyof ComparisonState, ScenarioInput][]) {
    const keys = queryKeys[side]
    params.set(keys.balance, String(input.currentBalance))
    params.set(keys.salary, String(input.salary))
    params.set(keys.employer, String(input.employerRate))
    params.set(keys.growth, String(input.growthRate))
    params.set(keys.years, String(input.projectionYears))
    params.set(keys.sacrificeOn, input.salarySacrificeEnabled ? '1' : '0')
    params.set(keys.sacrifice, String(input.salarySacrificePercent))
  }
  return params.toString()
}

function parseScenario(params: URLSearchParams, side: keyof ComparisonState): ScenarioInput | null {
  const defaults = DEFAULT_COMPARISON_STATE[side]
  const keys = queryKeys[side]
  const hasAny = Object.values(keys).some((key) => params.has(key))
  if (!hasAny) return { ...defaults }

  const number = (key: string, fallback: number) => params.has(key) ? Number(params.get(key)) : fallback
  const currentBalance = number(keys.balance, defaults.currentBalance)
  const salary = number(keys.salary, defaults.salary)
  const employerRate = number(keys.employer, defaults.employerRate)
  const growthRate = number(keys.growth, defaults.growthRate)
  const projectionYears = number(keys.years, defaults.projectionYears)
  const salarySacrificePercent = number(keys.sacrifice, defaults.salarySacrificePercent)
  const sacrificeValue = params.get(keys.sacrificeOn)

  const valid = [currentBalance, salary, employerRate, growthRate, projectionYears, salarySacrificePercent].every(Number.isFinite)
    && currentBalance >= 0 && currentBalance <= MAX_BALANCE
    && salary >= 0 && salary <= MAX_SALARY
    && employerRate >= 0 && employerRate <= 1
    && growthRate >= 0 && growthRate <= 1
    && Number.isInteger(projectionYears) && projectionYears >= 1 && projectionYears <= 30
    && salarySacrificePercent >= 0 && salarySacrificePercent <= 100
    && (sacrificeValue === null || sacrificeValue === '0' || sacrificeValue === '1')

  if (!valid) return null
  return {
    currentBalance,
    salary,
    employerRate,
    growthRate,
    projectionYears,
    salarySacrificeEnabled: sacrificeValue === null ? defaults.salarySacrificeEnabled : sacrificeValue === '1',
    salarySacrificePercent,
    fundType: defaults.fundType,
  }
}

export function decodeComparisonQuery(search: string): ComparisonState {
  const params = new URLSearchParams(search)
  const current = parseScenario(params, 'current')
  const smsf = parseScenario(params, 'smsf')
  return current && smsf ? { current, smsf } : {
    current: { ...DEFAULT_COMPARISON_STATE.current },
    smsf: { ...DEFAULT_COMPARISON_STATE.smsf },
  }
}

export function getMilestoneYears(years: number, expanded = false): number[] {
  if (expanded) return Array.from({ length: years + 1 }, (_, year) => year)
  return [...new Set([0, 1, 5, 10, 15, 20, years].filter((year) => year >= 0 && year <= years))]
    .sort((a, b) => a - b)
}
