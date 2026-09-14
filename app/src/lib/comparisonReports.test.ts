import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_COMPARISON_STATE, calculateComparison } from './comparisonState'
import {
  COMPARISON_REPORTS_KEY,
  deleteComparisonReport,
  getComparisonReport,
  listComparisonReports,
  saveComparisonReport,
} from './comparisonReports'

describe('comparison report storage', () => {
  beforeEach(() => localStorage.clear())

  it('saves, lists, reads and deletes a report', () => {
    const outcome = calculateComparison(DEFAULT_COMPARISON_STATE)
    const report = saveComparisonReport({ adviserId: 'mike-enderby', adviserName: 'Mike Enderby', clientName: 'Taylor Client', state: DEFAULT_COMPARISON_STATE, outcome })
    expect(listComparisonReports()).toHaveLength(1)
    expect(getComparisonReport(report.id)?.clientName).toBe('Taylor Client')
    deleteComparisonReport(report.id)
    expect(listComparisonReports()).toEqual([])
  })

  it('returns an empty list and clears malformed storage', () => {
    localStorage.setItem(COMPARISON_REPORTS_KEY, '{broken')
    expect(listComparisonReports()).toEqual([])
    expect(localStorage.getItem(COMPARISON_REPORTS_KEY)).toBeNull()
  })
})
