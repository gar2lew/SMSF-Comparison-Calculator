import { Copy, Minus, Plus } from 'lucide-react'
import type { ScenarioInput } from '@/lib/types'
import {
  CURRENT_GROWTH_OPTIONS,
  EMPLOYER_RATE_OPTIONS,
  SMSF_GROWTH_OPTIONS,
  YEAR_OPTIONS,
} from '@/lib/constants'

interface ScenarioCardProps {
  kind: 'current' | 'smsf'
  scenario: ScenarioInput
  onChange: (scenario: ScenarioInput) => void
  onCopyBalance?: () => void
  onCopySalary?: () => void
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 }).format(value)
const parseNumber = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0

export function ScenarioCard({ kind, scenario, onChange, onCopyBalance, onCopySalary }: ScenarioCardProps) {
  const smsf = kind === 'smsf'
  const update = <K extends keyof ScenarioInput>(key: K, value: ScenarioInput[K]) => onChange({ ...scenario, [key]: value })
  const growthOptions = smsf ? SMSF_GROWTH_OPTIONS : CURRENT_GROWTH_OPTIONS

  const moneyControl = (label: string, key: 'currentBalance' | 'salary', copy?: () => void) => (
    <div>
      <label htmlFor={`${kind}-${key}`} className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-navy/70">{label}</label>
      <div className="flex gap-2">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => update(key, Math.max(0, scenario[key] - 1000))} className="h-11 w-11 rounded-xl border border-[#ddd4c3] text-navy hover:border-gold"><Minus className="mx-auto h-4 w-4" /></button>
        <input id={`${kind}-${key}`} aria-label={label} value={formatNumber(scenario[key])} onChange={(event) => update(key, parseNumber(event.target.value))} inputMode="decimal" className="premium-control min-w-0 flex-1 font-semibold" />
        <button type="button" aria-label={`Increase ${label}`} onClick={() => update(key, scenario[key] + 1000)} className="h-11 w-11 rounded-xl border border-[#ddd4c3] text-navy hover:border-gold"><Plus className="mx-auto h-4 w-4" /></button>
        {copy && <button type="button" aria-label={`Copy current ${key === 'currentBalance' ? 'balance' : 'salary'} to SMSF`} onClick={copy} className="h-11 rounded-xl border border-[#ddd4c3] px-3 text-xs font-semibold text-navy hover:border-gold"><Copy className="h-4 w-4" /></button>}
      </div>
    </div>
  )

  return (
    <section className={`premium-card overflow-hidden ${smsf ? 'ring-1 ring-gold/40' : ''}`}>
      <div className={`px-6 py-5 ${smsf ? 'bg-navy text-white' : 'border-b border-[#e6dece] bg-white'}`}>
        <p className={smsf ? 'eyebrow text-[#dfbd70]' : 'eyebrow'}>{smsf ? 'ASG strategy' : 'Existing position'}</p>
        <h2 className="mt-2 font-serif text-2xl">{smsf ? 'SMSF with ASG + Partners' : 'Current superannuation'}</h2>
      </div>
      <div className="space-y-5 p-6">
        {moneyControl(smsf ? 'SMSF balance' : 'Current super balance', 'currentBalance', onCopyBalance)}
        {moneyControl(smsf ? 'SMSF annual salary' : 'Current annual salary', 'salary', onCopySalary)}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-navy/70">Employer rate<select aria-label={`${smsf ? 'SMSF' : 'Current'} employer rate`} value={scenario.employerRate} onChange={(event) => update('employerRate', Number(event.target.value))} className="premium-control mt-2 normal-case tracking-normal">{EMPLOYER_RATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-navy/70">Growth<select aria-label={`${smsf ? 'SMSF' : 'Current'} growth rate`} value={scenario.growthRate} onChange={(event) => update('growthRate', Number(event.target.value))} className="premium-control mt-2 normal-case tracking-normal">{growthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </div>
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-navy/70">Years of performance<select aria-label={`${smsf ? 'SMSF' : 'Current'} years`} value={scenario.projectionYears} onChange={(event) => update('projectionYears', Number(event.target.value))} className="premium-control mt-2 normal-case tracking-normal">{YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year} years</option>)}</select></label>
        <div className="rounded-xl border border-[#e2dacb] bg-[#faf7f1] p-4">
          <label className="flex items-center justify-between text-sm font-semibold"><span>Salary sacrifice</span><input aria-label={`${smsf ? 'SMSF' : 'Current'} salary sacrifice`} type="checkbox" checked={scenario.salarySacrificeEnabled} onChange={(event) => update('salarySacrificeEnabled', event.target.checked)} className="h-5 w-5 accent-[#c8a34f]" /></label>
          {scenario.salarySacrificeEnabled && <label className="mt-3 block text-xs text-navy/65">Percentage<input aria-label={`${smsf ? 'SMSF' : 'Current'} salary sacrifice percentage`} value={scenario.salarySacrificePercent} onChange={(event) => update('salarySacrificePercent', Math.min(100, parseNumber(event.target.value)))} className="premium-control mt-2" /></label>}
        </div>
      </div>
    </section>
  )
}
