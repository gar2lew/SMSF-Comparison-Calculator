export const MAX_BALANCE = 1_000_000_000
export const MAX_SALARY = 5_000_000
export const CALCULATION_DEBOUNCE_MS = 500

export const EMPLOYER_RATE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 0.12, label: '12%' },
  { value: 0.13, label: '13%' },
  { value: 0.14, label: '14%' },
  { value: 0.15, label: '15%' },
] as const

export const CURRENT_GROWTH_OPTIONS = [
  { value: 0.05, label: '5%' },
  { value: 0.075, label: '7.5%' },
  { value: 0.1, label: '10%' },
  { value: 0.125, label: '12.5%' },
] as const

export const SMSF_GROWTH_OPTIONS = [
  { value: 0.1, label: '10%' },
  { value: 0.125, label: '12.5%' },
  { value: 0.15, label: '15%' },
  { value: 0.175, label: '17.5%' },
] as const

export const YEAR_OPTIONS = [5, 10, 15, 20, 25, 30] as const

export const FUND_TYPE_LABELS: Record<string, string> = {
  current: 'Current Superannuation',
  smsf: 'SMSF with ASG + Partners',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  created: 'Projection Created',
  updated: 'Projection Updated',
  shared: 'Projection Shared',
  exported: 'Report Exported',
  presented: 'Projection Presented',
  archived: 'Projection Archived',
  duplicated: 'Projection Duplicated',
  scenario_added: 'Scenario Added',
  note_added: 'Note Added',
}

export const CHART_COLORS = {
  current: '#3498db',
  currentBg: 'rgba(52, 152, 219, 0.1)',
  smsf: '#10b981',
  smsfBg: 'rgba(16, 185, 129, 0.1)',
} as const

export const DEFAULT_DISCLAIMER =
  'This report is illustrative only and does not constitute financial advice. ' +
  'All figures are estimates and exclude tax, fees, insurance, and market volatility.'
