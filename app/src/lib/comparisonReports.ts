import type { ComparisonOutcome, ComparisonReport, ComparisonState } from './types'

export const COMPARISON_REPORTS_KEY = 'asg-smsf-comparison-reports-v1'

interface SaveComparisonReportInput {
  adviserId: string
  adviserName: string
  clientName: string
  state: ComparisonState
  outcome: ComparisonOutcome
  id?: string
}

function isReport(value: unknown): value is ComparisonReport {
  if (!value || typeof value !== 'object') return false
  const report = value as Partial<ComparisonReport>
  return typeof report.id === 'string'
    && typeof report.adviserId === 'string'
    && typeof report.adviserName === 'string'
    && typeof report.clientName === 'string'
    && typeof report.createdAt === 'string'
    && typeof report.updatedAt === 'string'
    && Boolean(report.state?.current && report.state.smsf && report.outcomeSummary)
}

export function listComparisonReports(): ComparisonReport[] {
  const stored = localStorage.getItem(COMPARISON_REPORTS_KEY)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) throw new Error('Invalid report list')
    return parsed.filter(isReport).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    localStorage.removeItem(COMPARISON_REPORTS_KEY)
    return []
  }
}

export function getComparisonReport(id: string): ComparisonReport | null {
  return listComparisonReports().find((report) => report.id === id) ?? null
}

export function saveComparisonReport(input: SaveComparisonReportInput): ComparisonReport {
  const reports = listComparisonReports()
  const existing = input.id ? reports.find((report) => report.id === input.id) : undefined
  const now = new Date().toISOString()
  const report: ComparisonReport = {
    id: existing?.id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    adviserId: input.adviserId,
    adviserName: input.adviserName,
    clientName: input.clientName,
    state: input.state,
    outcomeSummary: {
      currentFinal: input.outcome.current.finalBalance,
      smsfFinal: input.outcome.smsf.finalBalance,
      deltaFinal: input.outcome.deltaFinal,
      deltaGrowthPct: input.outcome.deltaGrowthPct,
      yearsCompared: input.outcome.yearsCompared,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const next = [report, ...reports.filter((item) => item.id !== report.id)]
  localStorage.setItem(COMPARISON_REPORTS_KEY, JSON.stringify(next))
  return report
}

export function deleteComparisonReport(id: string): void {
  const next = listComparisonReports().filter((report) => report.id !== id)
  localStorage.setItem(COMPARISON_REPORTS_KEY, JSON.stringify(next))
}
