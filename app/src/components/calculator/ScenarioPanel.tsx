import { useState } from 'react'
import type { Scenario, FundType } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  EMPLOYER_RATE_OPTIONS,
  CURRENT_GROWTH_OPTIONS,
  SMSF_GROWTH_OPTIONS,
  YEAR_OPTIONS,
  FUND_TYPE_LABELS,
} from '@/lib/constants'
import { formatCurrencyInput, fmtAUD } from '@/lib/utils'

interface ScenarioPanelProps {
  scenario: Scenario | null
  scenarios: Scenario[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<Scenario>) => void
  label: string
}

export function ScenarioPanel({ scenario, scenarios, selectedId, onSelect, onUpdate, label }: ScenarioPanelProps) {
  const [localBalance, setLocalBalance] = useState('')
  const [localSalary, setLocalSalary] = useState('')
  const [localSSPct, setLocalSSPct] = useState('')

  if (!scenario) {
    return (
      <div className="card-padded text-center text-gray-400 dark:text-gray-500">
        <p>No scenario selected</p>
      </div>
    )
  }

  const growthOptions = scenario.fundType === 'current' ? CURRENT_GROWTH_OPTIONS : SMSF_GROWTH_OPTIONS

  const handleBalanceBlur = () => {
    if (localBalance) {
      const n = parseFloat(localBalance.replace(/[,\s]/g, ''))
      if (!isNaN(n)) onUpdate(scenario.id, { currentBalance: n })
      setLocalBalance('')
    }
  }

  const handleSalaryBlur = () => {
    if (localSalary) {
      const n = parseFloat(localSalary.replace(/[,\s]/g, ''))
      if (!isNaN(n)) onUpdate(scenario.id, { salary: n })
      setLocalSalary('')
    }
  }

  const handleSSPctBlur = () => {
    if (localSSPct) {
      const n = parseFloat(localSSPct)
      if (!isNaN(n)) onUpdate(scenario.id, { salarySacrificePercent: Math.min(100, Math.max(0, n)) })
      setLocalSSPct('')
    }
  }

  return (
    <div className="card-padded space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</span>
        <select
          value={selectedId ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Badge variant={scenario.fundType === 'smsf' ? 'success' : 'info'}>
        {FUND_TYPE_LABELS[scenario.fundType as FundType]}
      </Badge>

      <Input
        label="Current Balance ($)"
        inputMode="decimal"
        placeholder={fmtAUD(scenario.currentBalance)}
        value={localBalance || formatCurrencyInput(scenario.currentBalance)}
        onChange={(e) => setLocalBalance(e.target.value)}
        onBlur={handleBalanceBlur}
        onFocus={(e) => { setLocalBalance(formatCurrencyInput(scenario.currentBalance)); e.target.select() }}
      />

      <Input
        label="Annual Salary ($)"
        inputMode="decimal"
        placeholder={fmtAUD(scenario.salary)}
        value={localSalary || formatCurrencyInput(scenario.salary)}
        onChange={(e) => setLocalSalary(e.target.value)}
        onBlur={handleSalaryBlur}
        onFocus={(e) => { setLocalSalary(formatCurrencyInput(scenario.salary)); e.target.select() }}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Employer Rate"
          options={EMPLOYER_RATE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={scenario.employerRate}
          onChange={(e) => onUpdate(scenario.id, { employerRate: parseFloat(e.target.value) })}
        />
        <Select
          label="Growth Rate"
          options={growthOptions.map((o) => ({ value: o.value, label: o.label }))}
          value={scenario.growthRate}
          onChange={(e) => onUpdate(scenario.id, { growthRate: parseFloat(e.target.value) })}
        />
      </div>

      <Select
        label="Years"
        options={YEAR_OPTIONS.map((y) => ({ value: y, label: String(y) }))}
        value={scenario.projectionYears}
        onChange={(e) => onUpdate(scenario.id, { projectionYears: parseInt(e.target.value) })}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Salary Sacrifice</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={scenario.salarySacrificeEnabled}
              onChange={(e) => onUpdate(scenario.id, { salarySacrificeEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>
        {scenario.salarySacrificeEnabled && (
          <Input
            label="Sacrifice %"
            inputMode="decimal"
            placeholder="e.g., 5"
            value={localSSPct || String(scenario.salarySacrificePercent)}
            onChange={(e) => setLocalSSPct(e.target.value)}
            onBlur={handleSSPctBlur}
          />
        )}
      </div>
    </div>
  )
}
