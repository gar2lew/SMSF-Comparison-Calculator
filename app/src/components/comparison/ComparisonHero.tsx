import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { fmtAUD, fmtPct } from '@/lib/utils'
import type { ComparisonOutcome } from '@/lib/types'

export function ComparisonHero({ outcome }: { outcome: ComparisonOutcome }) {
  const winner = outcome.winner === 'smsf' ? 'SMSF' : outcome.winner === 'current' ? 'Current super' : 'Neither scenario'
  return (
    <section className="overflow-hidden rounded-2xl bg-navy text-white shadow-[0_24px_60px_rgba(16,35,61,0.22)]">
      <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_.8fr] md:p-9">
        <div><p className="eyebrow text-[#dfbd70]">Projected advantage</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">{winner} leads by {fmtAUD(Math.abs(outcome.deltaFinal))}</h2><p className="mt-3 text-sm text-white/65">After {outcome.yearsCompared} years, based on the assumptions above.</p></div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-4"><TrendingUp className="mb-3 h-4 w-4 text-[#dfbd70]" /><p className="text-xs text-white/55">SMSF final balance</p><p className="mt-1 text-xl font-bold">{fmtAUD(outcome.smsf.finalBalance)}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-4"><ArrowUpRight className="mb-3 h-4 w-4 text-[#dfbd70]" /><p className="text-xs text-white/55">Growth difference</p><p className="mt-1 text-xl font-bold">{fmtPct(outcome.deltaGrowthPct)}</p></div></div>
      </div>
    </section>
  )
}
