import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'

export function AppLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="lg:pl-56">
          <Header />
          <main className="p-4 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}
