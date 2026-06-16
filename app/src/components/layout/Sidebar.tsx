import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/projections', label: 'Projections', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-200',
          sidebarOpen ? 'w-56 translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:w-56',
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-lg text-brand-600 dark:text-brand-400">ASG</span>
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
