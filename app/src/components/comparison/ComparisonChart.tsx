import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ComparisonOutcome } from '@/lib/types'

export function ComparisonChart({ outcome }: { outcome: ComparisonOutcome }) {
  const data = outcome.current.yearlyData.slice(0, outcome.yearsCompared + 1).map((current, index) => ({ year: current.year, current: current.balance, smsf: outcome.smsf.yearlyData[index]?.balance ?? 0 }))
  return <div className="premium-card p-5 md:p-7"><div className="mb-5"><p className="eyebrow">Balance projection</p><h2 className="mt-2 font-serif text-2xl text-navy">The comparison story</h2></div><div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}><LineChart data={data}><CartesianGrid stroke="#e8e0d2" strokeDasharray="3 3" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(value))} /><Line type="monotone" dataKey="current" name="Current super" stroke="#71839a" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="smsf" name="SMSF" stroke="#c8a34f" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div></div>
}
