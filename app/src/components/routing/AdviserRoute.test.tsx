import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AdviserRoute } from './AdviserRoute'
import { useAdviserStore } from '@/stores/adviserStore'

function renderRoutes() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<AdviserRoute />}>
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdviserRoute', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useAdviserStore.setState({ adviser: null })
  })

  it('redirects to login without an adviser session', () => {
    renderRoutes()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders protected content for a selected adviser', () => {
    useAdviserStore.setState({ adviser: { id: 'mike-enderby', name: 'Mike Enderby' } })
    renderRoutes()
    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })
})
