import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'
import { useAdviserStore } from '@/stores/adviserStore'
import { saveComparisonReport } from '@/lib/comparisonReports'
import { calculateComparison, DEFAULT_COMPARISON_STATE } from '@/lib/comparisonState'

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
    useAdviserStore.setState({ adviser: { id: 'mike-enderby', name: 'Mike Enderby' } })
    const outcome = calculateComparison(DEFAULT_COMPARISON_STATE)
    saveComparisonReport({ adviserId: 'mike-enderby', adviserName: 'Mike Enderby', clientName: 'Mine Client', state: DEFAULT_COMPARISON_STATE, outcome })
    saveComparisonReport({ adviserId: 'sam-roberts', adviserName: 'Sam Roberts', clientName: 'Other Client', state: DEFAULT_COMPARISON_STATE, outcome })
  })

  it('defaults to the selected adviser and can reveal all local reports', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)

    expect(screen.getByText(/Welcome back, Mike/i)).toBeInTheDocument()
    expect(screen.getByText('Mine Client')).toBeInTheDocument()
    expect(screen.queryByText('Other Client')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /new comparison/i })).toHaveAttribute('href', '/comparison/new')

    await user.click(screen.getByRole('button', { name: /all reports/i }))
    expect(screen.getByText('Other Client')).toBeInTheDocument()
  })
})
