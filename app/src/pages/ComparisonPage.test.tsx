import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ComparisonPage } from './ComparisonPage'

afterEach(cleanup)

describe('ComparisonPage', () => {
  it('shows the complete comparison automatically with contribution detail', () => {
    render(<MemoryRouter><ComparisonPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /projected outcome/i })).toBeInTheDocument()
    expect(screen.getByText('Starting balance')).toBeInTheDocument()
    expect(screen.getByText('Total contributions')).toBeInTheDocument()
    expect(screen.getByText('Total earnings / growth')).toBeInTheDocument()
    expect(screen.getByText('Current super results')).toBeInTheDocument()
    expect(screen.getByText('SMSF results')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Total employer contributions (Current)' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Total salary sacrifice (SMSF)' })).toBeInTheDocument()
  })

  it('preserves the original defaults, copy action, calculation and reset', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ComparisonPage /></MemoryRouter>)

    const currentBalance = screen.getByLabelText('Current super balance')
    const smsfBalance = screen.getByLabelText('SMSF balance')
    expect(currentBalance).toHaveValue('100,000')
    expect(smsfBalance).toHaveValue('100,000')

    await user.clear(currentBalance)
    await user.type(currentBalance, '250000')
    await user.click(screen.getByRole('button', { name: /copy current balance to SMSF/i }))
    expect(smsfBalance).toHaveValue('250,000')

    await user.click(screen.getByRole('button', { name: /^calculate$/i }))
    expect(screen.getByText(/SMSF leads by/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset to example/i }))
    expect(currentBalance).toHaveValue('100,000')
  })
})
