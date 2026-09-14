import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calculator, Download, RotateCcw, Save, Share2 } from 'lucide-react'
import { ScenarioCard } from '@/components/comparison/ScenarioCard'
import { ComparisonHero } from '@/components/comparison/ComparisonHero'
import { ComparisonChart } from '@/components/comparison/ComparisonChart'
import { YearlyComparison } from '@/components/comparison/YearlyComparison'
import { SaveComparisonDialog } from '@/components/comparison/SaveComparisonDialog'
import {
  DEFAULT_COMPARISON_STATE,
  calculateComparison,
  decodeComparisonQuery,
  encodeComparisonQuery,
} from '@/lib/comparisonState'
import type { ComparisonOutcome, ComparisonState, ScenarioInput } from '@/lib/types'

const cloneDefaults = (): ComparisonState => ({
  current: { ...DEFAULT_COMPARISON_STATE.current },
  smsf: { ...DEFAULT_COMPARISON_STATE.smsf },
})

export function ComparisonPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initial = useMemo(() => location.search ? decodeComparisonQuery(location.search) : cloneDefaults(), [location.search])
  const [state, setState] = useState<ComparisonState>(initial)
  const [outcome, setOutcome] = useState<ComparisonOutcome | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const setScenario = (side: keyof ComparisonState, scenario: ScenarioInput) => {
    setState((current) => ({ ...current, [side]: scenario }))
  }

  const calculate = () => setOutcome(calculateComparison(state))
  const reset = () => { setState(cloneDefaults()); setOutcome(null); setNotice('') }

  const share = async () => {
    const query = encodeComparisonQuery(state)
    const url = `${window.location.origin}${location.pathname}?${query}`
    window.history.replaceState(null, '', `?${query}`)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Share link copied')
    } catch {
      setNotice('Share link is ready in the address bar')
    }
  }

  const exportCsv = () => {
    const result = outcome ?? calculateComparison(state)
    const rows = ['Year,Current Super,SMSF,Difference']
    for (let year = 0; year <= result.yearsCompared; year += 1) {
      const current = result.current.yearlyData[year]?.balance ?? 0
      const smsf = result.smsf.yearlyData[year]?.balance ?? 0
      rows.push(`${year},${current.toFixed(2)},${smsf.toFixed(2)},${(smsf - current).toFixed(2)}`)
    }
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'smsf-comparison.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><Link to="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-navy/60 hover:text-navy"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><p className="eyebrow">Client comparison</p><h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">SMSF growth comparison</h1><p className="mt-2 text-sm text-slate-500">Shape the assumptions together, then bring the long-term difference into focus.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={reset} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8d0c1] bg-white px-4 text-sm font-semibold text-navy"><RotateCcw className="h-4 w-4" /> Reset to example</button><button type="button" onClick={share} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8d0c1] bg-white px-4 text-sm font-semibold text-navy"><Share2 className="h-4 w-4" /> Share</button><button type="button" onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8d0c1] bg-white px-4 text-sm font-semibold text-navy"><Download className="h-4 w-4" /> CSV</button></div>
      </div>

      <div className="rounded-xl border border-[#ead8a8] bg-[#fff8e7] px-5 py-4 text-sm leading-6 text-[#795d22]"><strong>Illustrative comparison.</strong> Figures exclude tax, fees, insurance, caps, contribution timing nuances and market volatility.</div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ScenarioCard kind="current" scenario={state.current} onChange={(scenario) => setScenario('current', scenario)} />
        <ScenarioCard kind="smsf" scenario={state.smsf} onChange={(scenario) => setScenario('smsf', scenario)} onCopyBalance={() => setScenario('smsf', { ...state.smsf, currentBalance: state.current.currentBalance })} onCopySalary={() => setScenario('smsf', { ...state.smsf, salary: state.current.salary })} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={calculate} className="inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-7 text-sm font-bold uppercase tracking-[0.12em] text-navy shadow-[0_14px_30px_rgba(200,163,79,0.25)] hover:bg-[#b9913c]"><Calculator className="h-4 w-4" /> Calculate</button><button type="button" onClick={() => setSaveOpen(true)} className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-6 text-sm font-bold text-white"><Save className="h-4 w-4" /> Save report</button>{notice && <span role="status" className="text-sm text-[#987426]">{notice}</span>}</div>

      {outcome && <><ComparisonHero outcome={outcome} /><ComparisonChart outcome={outcome} /><YearlyComparison outcome={outcome} /></>}

      <SaveComparisonDialog open={saveOpen} onClose={() => setSaveOpen(false)} onSave={(clientName) => { setSaveOpen(false); setNotice(clientName ? `Ready to save for ${clientName}` : 'Ready to save report') }} />
    </div>
  )
}
