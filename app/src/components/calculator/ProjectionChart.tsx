import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ComparisonResult } from '@/lib/types'
import { fmtAUD, fmtAUDCompact } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'
import { useUIStore } from '@/stores/uiStore'
import { useMemo } from 'react'

interface ProjectionChartProps {
  comparison: ComparisonResult
}

export function ProjectionChart({ comparison }: ProjectionChartProps) {
  const isDark = useUIStore().resolvedTheme() === 'dark'

  const chartData = useMemo(() => {
    const years = comparison.yearsCompared
    const left = comparison.scenarioA.result.yearlyData
    const right = comparison.scenarioB.result.yearlyData

    return Array.from({ length: years + 1 }, (_, i) => ({
      year: `Year ${i}`,
      [comparison.scenarioA.scenario.name]: left[i]?.balance ?? 0,
      [comparison.scenarioB.scenario.name]: right[i]?.balance ?? 0,
    }))
  }, [comparison])

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="year" fontSize={12} stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis
            fontSize={12}
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tickFormatter={(v: number) => fmtAUDCompact(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [fmtAUD(value)]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={comparison.scenarioA.scenario.name}
            stroke={CHART_COLORS.current}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey={comparison.scenarioB.scenario.name}
            stroke={CHART_COLORS.smsf}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
