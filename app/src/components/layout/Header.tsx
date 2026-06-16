import { useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { profile, signOut } = useAuthStore()
  const { theme, resolvedTheme, setTheme } = useUIStore()
  const navigate = useNavigate()

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        SMSF Projection Workspace
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          aria-label="Toggle theme"
        >
          {resolvedTheme() === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {profile && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              {profile.fullName}
            </span>
            <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                {profile.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
