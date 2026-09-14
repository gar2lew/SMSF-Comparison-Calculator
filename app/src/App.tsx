import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdviserRoute } from '@/components/routing/AdviserRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientDetailPage } from '@/pages/ClientDetailPage'
import { ProjectionsPage } from '@/pages/ProjectionsPage'
import { ProjectionWorkspace } from '@/pages/ProjectionWorkspace'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ComparisonPage } from '@/pages/ComparisonPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdviserRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/projections" element={<ProjectionsPage />} />
            <Route path="/projections/:id" element={<ProjectionWorkspace />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/comparison/new" element={<ComparisonPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
