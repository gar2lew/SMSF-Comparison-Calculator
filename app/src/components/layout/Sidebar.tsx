import { LayoutDashboard, Plus } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/comparison/new', label: 'New Comparison', icon: Plus },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const location = useLocation()

  return (
    <>
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden bg-navy text-white transition-transform duration-200 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="relative border-b border-white/10 px-7 py-7"><div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border border-gold/20" /><p className="font-serif text-2xl text-gold">ASG</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white/55">Partners</p></div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const active = item.to === '/dashboard' ? location.pathname === item.to : location.pathname.startsWith('/comparison')
            return <NavLink key={item.to} to={item.to} onClick={() => { if (window.innerWidth < 1024) toggleSidebar() }} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition', active ? 'bg-white/10 text-gold shadow-inner' : 'text-white/65 hover:bg-white/5 hover:text-white')}><item.icon className="h-4 w-4" />{item.label}</NavLink>
          })}
        </nav>
        <div className="border-t border-white/10 px-7 py-6 text-[10px] leading-5 text-white/40">Private adviser workspace<br />ASG Partners</div>
      </aside>
      {sidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-navy/50 lg:hidden" onClick={toggleSidebar} aria-label="Close navigation" />}
    </>
  )
}
