import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'

export function AppLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-ivory text-ink">
        <Sidebar />
        <div className="lg:pl-60">
          <Header />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}
