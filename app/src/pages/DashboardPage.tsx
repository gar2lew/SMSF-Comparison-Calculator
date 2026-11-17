import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, FileText, Plus, Sparkles, Trash2, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAdviserStore } from '@/stores/adviserStore'
import { deleteComparisonReport, listComparisonReports } from '@/lib/comparisonReports'
import { filterReports, type ReportFilterMode } from '@/lib/reportFilters'
import { fmtAUD } from '@/lib/utils'

const formatDate = (value: string) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))

interface DashboardStat {
  label: string
  value: string | number
  icon: LucideIcon
}

export function DashboardPage() {
  const adviser = useAdviserStore((state) => state.adviser)
  const [mode, setMode] = useState<ReportFilterMode>('mine')
  const [reports, setReports] = useState(() => listComparisonReports())
  const [error, setError] = useState('')
  const visible = useMemo(() => filterReports(reports, mode, adviser?.id ?? ''), [reports, mode, adviser?.id])
  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: visible.length,
      month: visible.filter((report) => { const date = new Date(report.createdAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() }).length,
      clients: new Set(visible.map((report) => report.clientName).filter(Boolean)).size,
      advantage: Math.max(0, ...visible.map((report) => report.outcomeSummary.deltaFinal)),
    }
  }, [visible])
  const statCards: DashboardStat[] = [
    { label: 'Comparisons', value: stats.total, icon: FileText },
    { label: 'This month', value: stats.month, icon: CalendarDays },
    { label: 'Clients', value: stats.clients, icon: UserRound },
    { label: 'Strongest advantage', value: fmtAUD(stats.advantage), icon: Sparkles },
  ]

  const remove = (id: string) => {
    if (!window.confirm('Remove this saved comparison?')) return
    try { deleteComparisonReport(id); setReports(listComparisonReports()) }
    catch { setError('The report could not be removed. Check browser storage and try again.') }
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-navy px-7 py-8 text-white shadow-[0_24px_60px_rgba(16,35,61,0.2)] md:px-10 md:py-10">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-gold/30" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div><p className="eyebrow text-[#dfbd70]">Adviser workspace</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">Welcome back, {adviser?.name.split(' ')[0]}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Your comparison history and client outcomes, kept clear and ready for the next conversation.</p></div>
          <Link to="/comparison/new" className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-gold px-6 text-sm font-bold uppercase tracking-[0.12em] text-navy shadow-lg transition hover:-translate-y-0.5 hover:bg-[#d6b566]"><Plus className="h-4 w-4" /> New Comparison</Link>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => <div key={label} className="premium-card p-5"><Icon className="mb-5 h-5 w-5 text-[#a47c2c]" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-2 font-serif text-2xl text-navy md:text-3xl">{value}</p></div>)}
      </section>
      <section className="premium-card overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e8e0d2] px-6 py-5 sm:flex-row sm:items-center"><div><p className="eyebrow">Report history</p><h2 className="mt-1 font-serif text-2xl text-navy">Saved comparisons</h2></div><div className="inline-flex rounded-xl bg-[#f2ece1] p-1" aria-label="Report visibility">{(['mine', 'all'] as const).map((value) => <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === value ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}>{value === 'mine' ? 'My Reports' : 'All Reports'}</button>)}</div></div>
        {error && <p className="mx-6 mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {visible.length === 0 ? <div className="px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ead7] text-[#a47c2c]"><FileText className="h-6 w-6" /></div><h3 className="mt-5 font-serif text-2xl text-navy">No comparisons yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Create the first comparison for this adviser and it will appear here automatically.</p><Link to="/comparison/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Create Your First Comparison <ArrowRight className="h-4 w-4" /></Link></div> : <div className="divide-y divide-[#eee7db]">{visible.map((report) => <article key={report.id} className="grid gap-4 px-6 py-5 transition hover:bg-[#fdfaf5] md:grid-cols-[1.2fr_.8fr_.7fr_auto] md:items-center"><div><p className="font-serif text-xl text-navy">{report.clientName || 'Unnamed client'}</p><p className="mt-1 text-xs text-slate-400">Prepared by {report.adviserName}</p></div><div><p className="text-xs uppercase tracking-wider text-slate-400">Projected advantage</p><p className="mt-1 font-semibold text-[#987426]">{fmtAUD(report.outcomeSummary.deltaFinal)}</p></div><div><p className="text-xs uppercase tracking-wider text-slate-400">Saved</p><p className="mt-1 text-sm text-navy">{formatDate(report.updatedAt)}</p></div><div className="flex items-center gap-2"><Link to={`/comparison/${report.id}`} className="rounded-lg border border-[#d9d1c2] px-3 py-2 text-sm font-semibold text-navy">Open</Link><button type="button" aria-label={`Remove ${report.clientName || 'report'}`} onClick={() => remove(report.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}
      </section>
    </div>
  )
}
