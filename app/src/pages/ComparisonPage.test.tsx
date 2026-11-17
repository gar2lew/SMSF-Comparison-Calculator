import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ComparisonPage } from './ComparisonPage'

describe('ComparisonPage', () => {
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
