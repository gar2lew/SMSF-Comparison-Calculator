import type { ComparisonReport } from './types'

export type ReportFilterMode = 'mine' | 'all'

export function filterReports(
  reports: ComparisonReport[],
  mode: ReportFilterMode,
  adviserId: string,
): ComparisonReport[] {
  return mode === 'all' ? [...reports] : reports.filter((report) => report.adviserId === adviserId)
}
