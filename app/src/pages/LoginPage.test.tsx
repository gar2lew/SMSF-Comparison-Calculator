import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { ADVISER_SESSION_KEY } from '@/lib/adviserSession'
import { useAdviserStore } from '@/stores/adviserStore'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Adviser dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useAdviserStore.setState({ adviser: null })
  })

  it('activates the entry button and opens the dashboard after adviser selection', async () => {
    const user = userEvent.setup()
    renderLogin()

    expect(screen.getByRole('heading', { name: 'SMSF Growth Comparison' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Start Your Comparison' })).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /enter workspace/i })
    expect(button).toBeDisabled()

    await user.selectOptions(screen.getByLabelText(/adviser name/i), 'mike-enderby')
    expect(button).toBeEnabled()

    await user.click(button)

    expect(screen.getByText('Adviser dashboard')).toBeInTheDocument()
    expect(useAdviserStore.getState().adviser).toEqual({
      id: 'mike-enderby',
      name: 'Mike Enderby',
    })
    expect(sessionStorage.getItem(ADVISER_SESSION_KEY)).toBe(
      JSON.stringify({ id: 'mike-enderby', name: 'Mike Enderby' }),
    )
  })
})
