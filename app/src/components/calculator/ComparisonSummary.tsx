import type { ComparisonResult } from '@/lib/types'
import { fmtAUD, fmtPct } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { TrendingUp, DollarSign, Percent } from 'lucide-react'

interface ComparisonSummaryProps {
  comparison: ComparisonResult
}

export function ComparisonSummary({ comparison }: ComparisonSummaryProps) {
  const { scenarioA, scenarioB, winner, deltaFinal, deltaGrowthPct, yearsCompared } = comparison

  const winnerName = winner === 'tie' ? 'Tie' : winner === 'b' ? scenarioB.scenario.name : scenarioA.scenario.name

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {winner === 'tie' ? (
          <Badge variant="default">No difference at final year</Badge>
        ) : (
          <Badge variant={winner === 'b' ? 'success' : 'danger'}>
            {winnerName} leads
          </Badge>
        )}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {winner === 'tie'
            ? 'Both scenarios end at the same balance.'
            : `${winnerName} by ${fmtAUD(Math.abs(deltaFinal))} after ${yearsCompared} years.`}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant={deltaFinal >= 0 ? 'success' : 'danger'}>
          Final: {deltaFinal >= 0 ? '+' : ''}{fmtAUD(deltaFinal)}
        </Badge>
        <Badge variant={deltaGrowthPct >= 0 ? 'success' : 'danger'}>
          Growth: {deltaGrowthPct >= 0 ? '+' : ''}{fmtPct(deltaGrowthPct)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding={true} className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
          <h3 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-400">{scenarioA.scenario.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><DollarSign className="h-3.5 w-3.5" /> Final Balance</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{fmtAUD(scenarioA.result.finalBalance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><TrendingUp className="h-3.5 w-3.5" /> Growth</span>
              <span className="font-bold">{fmtAUD(scenarioA.result.growthAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><Percent className="h-3.5 w-3.5" /> Growth %</span>
              <span className="font-bold">{fmtPct(scenarioA.result.growthPercent)}</span>
            </div>
          </div>
        </Card>

        <Card padding={true} className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
          <h3 className="font-semibold text-sm mb-3 text-emerald-700 dark:text-emerald-400">{scenarioB.scenario.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><DollarSign className="h-3.5 w-3.5" /> Final Balance</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtAUD(scenarioB.result.finalBalance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><TrendingUp className="h-3.5 w-3.5" /> Growth</span>
              <span className="font-bold">{fmtAUD(scenarioB.result.growthAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><Percent className="h-3.5 w-3.5" /> Growth %</span>
              <span className="font-bold">{fmtPct(scenarioB.result.growthPercent)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
