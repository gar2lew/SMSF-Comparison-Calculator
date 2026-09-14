import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fmtAUD } from '@/lib/utils'
import { getMilestoneYears } from '@/lib/comparisonState'
import type { ComparisonOutcome } from '@/lib/types'

export function YearlyComparison({ outcome }: { outcome: ComparisonOutcome }) {
  const [expanded, setExpanded] = useState(false)
  const years = getMilestoneYears(outcome.yearsCompared, expanded)
  return <section className="premium-card overflow-hidden"><div className="flex items-center justify-between border-b border-[#e6dece] px-6 py-5"><div><p className="eyebrow">Yearly comparison</p><h2 className="mt-1 font-serif text-2xl text-navy">Milestone balances</h2></div><button type="button" onClick={() => setExpanded((value) => !value)} className="flex items-center gap-2 text-sm font-semibold text-navy">{expanded ? 'Show milestones' : 'Show every year'}{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#faf7f1] text-left text-xs uppercase tracking-wider text-navy/55"><tr><th className="px-6 py-3">Year</th><th className="px-6 py-3">Current super</th><th className="px-6 py-3">SMSF</th><th className="px-6 py-3">Difference</th></tr></thead><tbody>{years.map((year) => { const current = outcome.current.yearlyData[year]?.balance ?? 0; const smsf = outcome.smsf.yearlyData[year]?.balance ?? 0; return <tr key={year} className="border-t border-[#eee7db]"><td className="px-6 py-4 font-semibold">{year === 0 ? 'Start' : `Year ${year}`}</td><td className="px-6 py-4">{fmtAUD(current)}</td><td className="px-6 py-4 font-semibold text-[#987426]">{fmtAUD(smsf)}</td><td className="px-6 py-4">{year === 0 ? '—' : fmtAUD(smsf - current)}</td></tr> })}</tbody></table></div></section>
}
