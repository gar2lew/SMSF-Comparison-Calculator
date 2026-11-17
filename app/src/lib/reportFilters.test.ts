import { describe, expect, it } from 'vitest'
import { filterReports } from './reportFilters'
import type { ComparisonReport } from './types'

const reports = [
  { id: '1', adviserId: 'mike-enderby', createdAt: '2026-09-14T10:00:00Z' },
  { id: '2', adviserId: 'sam-roberts', createdAt: '2026-09-14T11:00:00Z' },
] as ComparisonReport[]

describe('report filters', () => {
  it('shows only the selected adviser in mine mode', () => {
    expect(filterReports(reports, 'mine', 'mike-enderby').map((report) => report.id)).toEqual(['1'])
  })

  it('shows all reports without mutating or reordering them', () => {
    const original = [...reports]
    expect(filterReports(reports, 'all', 'mike-enderby')).toEqual(reports)
    expect(reports).toEqual(original)
  })
})
