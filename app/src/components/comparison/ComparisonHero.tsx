import { ArrowUpRight, Landmark, TrendingUp, WalletCards } from 'lucide-react'
import { fmtAUD, fmtPct } from '@/lib/utils'
import type { ComparisonOutcome } from '@/lib/types'

export function ComparisonHero({ outcome }: { outcome: ComparisonOutcome }) {
  const winner = outcome.winner === 'smsf' ? 'SMSF' : outcome.winner === 'current' ? 'Current super' : 'Neither scenario'
  const finalSmsfYear = outcome.smsf.yearlyData[outcome.yearsCompared]
  const totalContributions = (finalSmsfYear?.totalEmployerContributions ?? 0)
    + (finalSmsfYear?.totalSalarySacrificeContributions ?? 0)
  const summary = [
    { label: 'Starting balance', value: fmtAUD(outcome.smsf.input.currentBalance) },
    { label: 'Final projected balance', value: fmtAUD(outcome.smsf.finalBalance), accent: true },
    { label: 'Total contributions', value: fmtAUD(totalContributions) },
    { label: 'Total earnings / growth', value: fmtAUD(outcome.smsf.growthAmount) },
    { label: 'Projected years', value: `${outcome.yearsCompared} years` },
  ]

  const scenarioResults = [
    { label: 'Current super results', result: outcome.current, tone: 'text-slate-200' },
    { label: 'SMSF results', result: outcome.smsf, tone: 'text-[#dfbd70]' },
  ]

  return (
    <section aria-labelledby="projected-outcome-title" className="overflow-hidden rounded-2xl bg-navy text-white shadow-[0_24px_60px_rgba(16,35,61,0.22)]">
      <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_.8fr] md:p-9">
        <div><p className="eyebrow text-[#dfbd70]">Projected advantage</p><h2 id="projected-outcome-title" className="mt-3 font-serif text-3xl md:text-4xl">Projected outcome</h2><p className="mt-3 text-xl font-semibold">{winner} leads by {fmtAUD(Math.abs(outcome.deltaFinal))}</p><p className="mt-2 text-sm text-white/65">After {outcome.yearsCompared} years, based on the assumptions above.</p></div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-4"><TrendingUp className="mb-3 h-4 w-4 text-[#dfbd70]" /><p className="text-xs text-white/55">SMSF final balance</p><p className="mt-1 text-xl font-bold">{fmtAUD(outcome.smsf.finalBalance)}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-4"><ArrowUpRight className="mb-3 h-4 w-4 text-[#dfbd70]" /><p className="text-xs text-white/55">Growth difference</p><p className="mt-1 text-xl font-bold">{fmtPct(outcome.deltaGrowthPct)}</p></div></div>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((item) => <div key={item.label} className="border-white/10 p-5 sm:border-r last:border-r-0"><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/50">{item.label}</p><p className={`mt-2 text-lg font-bold ${item.accent ? 'text-[#dfbd70]' : ''}`}>{item.value}</p></div>)}
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-2">
        {scenarioResults.map(({ label, result, tone }) => <article key={label} className="bg-navy p-6 md:p-7"><div className="flex items-center gap-2"><WalletCards className={`h-4 w-4 ${tone}`} /><h3 className="font-serif text-xl">{label}</h3></div><dl className="mt-5 grid grid-cols-3 gap-3 text-sm"><div><dt className="text-white/50">Final balance</dt><dd className={`mt-1 font-bold ${tone}`}>{fmtAUD(result.finalBalance)}</dd></div><div><dt className="text-white/50">Growth</dt><dd className="mt-1 font-bold">{fmtAUD(result.growthAmount)}</dd></div><div><dt className="text-white/50">Growth %</dt><dd className="mt-1 font-bold">{fmtPct(result.growthPercent)}</dd></div></dl></article>)}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-7 py-4 text-xs text-white/55"><Landmark className="h-4 w-4 text-[#dfbd70]" /> Contributions are included in projected balances and shown in detail below.</div>
    </section>
  )
}
