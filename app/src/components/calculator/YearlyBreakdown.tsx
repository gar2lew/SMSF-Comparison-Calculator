import type { ComparisonResult } from '@/lib/types'
import { fmtAUD } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface YearlyBreakdownProps {
  comparison: ComparisonResult
}

export function YearlyBreakdown({ comparison }: YearlyBreakdownProps) {
  const [open, setOpen] = useState(false)
  const { scenarioA, scenarioB, yearsCompared } = comparison
  const dataA = scenarioA.result.yearlyData
  const dataB = scenarioB.result.yearlyData

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm"
      >
        <span>Year-by-Year Breakdown</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="sticky left-0 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-left font-semibold">Year</th>
                <th className="px-3 py-2 text-right font-semibold">{scenarioA.scenario.name}</th>
                <th className="px-3 py-2 text-right font-semibold">{scenarioB.scenario.name}</th>
                <th className="px-3 py-2 text-right font-semibold">Difference</th>
                <th className="px-3 py-2 text-right font-semibold">Emp Contrib (A)</th>
                <th className="px-3 py-2 text-right font-semibold">SS Contrib (A)</th>
                <th className="px-3 py-2 text-right font-semibold">Emp Contrib (B)</th>
                <th className="px-3 py-2 text-right font-semibold">SS Contrib (B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: yearsCompared + 1 }, (_, i) => {
                const la = dataA[i]
                const lb = dataB[i]
                if (!la || !lb) return null
                const diff = lb.balance - la.balance
                const diffClass = i === 0 ? '' : diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'

                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="sticky left-0 bg-white dark:bg-gray-900 px-3 py-1.5 font-medium">
                      {i === 0 ? 'Start' : `Year ${i}`}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmtAUD(la.balance)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmtAUD(lb.balance)}</td>
                    <td className={`px-3 py-1.5 text-right tabular-nums font-semibold ${diffClass}`}>
                      {i === 0 ? '—' : `${diff >= 0 ? '+' : ''}${fmtAUD(diff)}`}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                      {i === 0 ? '—' : fmtAUD(la.employerContribution)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                      {i === 0 ? '—' : la.salarySacrificeContribution > 0 ? fmtAUD(la.salarySacrificeContribution) : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                      {i === 0 ? '—' : fmtAUD(lb.employerContribution)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                      {i === 0 ? '—' : lb.salarySacrificeContribution > 0 ? fmtAUD(lb.salarySacrificeContribution) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
