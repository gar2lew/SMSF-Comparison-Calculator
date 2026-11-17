import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdviserStore } from '@/stores/adviserStore'
import { useUIStore } from '@/stores/uiStore'

export function Header() {
  const adviser = useAdviserStore((state) => state.adviser)
  const signOut = useAdviserStore((state) => state.signOut)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e7dfd1] bg-[#fbf8f1]/90 px-4 backdrop-blur lg:px-8">
      <button type="button" onClick={toggleSidebar} className="rounded-lg p-2 text-navy hover:bg-[#eee6d8] lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
      <p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[#9a7730] sm:block">SMSF Comparison Workspace</p>
      <div className="flex items-center gap-3">
        {adviser && <div className="flex items-center gap-3 border-r border-[#ddd4c5] pr-3"><span className="hidden text-sm font-semibold text-navy sm:inline">{adviser.name}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">{adviser.name.charAt(0)}</span></div>}
        <button type="button" onClick={handleSignOut} className="rounded-lg p-2 text-slate-500 transition hover:bg-[#eee6d8] hover:text-navy" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
      </div>
    </header>
  )
}
