import { useState } from 'react'
import type { FundType } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  EMPLOYER_RATE_OPTIONS,
  CURRENT_GROWTH_OPTIONS,
  SMSF_GROWTH_OPTIONS,
  YEAR_OPTIONS,
} from '@/lib/constants'

interface ScenarioEditorProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<{
    name: string
    fund_type: FundType
    current_balance: number
    salary: number
    employer_rate: number
    growth_rate: number
    projection_years: number
    salary_sacrifice_enabled: boolean
    salary_sacrifice_percent: number
  }>) => void
  defaults?: {
    balance?: number
    salary?: number
    employerRate?: number
  }
}

export function ScenarioEditor({ open, onClose, onSave, defaults }: ScenarioEditorProps) {
  const [name, setName] = useState('')
  const [fundType, setFundType] = useState<FundType>('current')
  const [balance, setBalance] = useState(String(defaults?.balance ?? 100000))
  const [salary, setSalary] = useState(String(defaults?.salary ?? 85000))
  const [employerRate, setEmployerRate] = useState(defaults?.employerRate ?? 0.12)
  const [growthRate, setGrowthRate] = useState(0.1)
  const [years, setYears] = useState(10)
  const [ssEnabled, setSSEnabled] = useState(false)
  const [ssPct, setSSPct] = useState('0')

  const growthOpts = fundType === 'current' ? CURRENT_GROWTH_OPTIONS : SMSF_GROWTH_OPTIONS

  const handleSave = () => {
    onSave({
      name: name || 'New Scenario',
      fund_type: fundType,
      current_balance: parseFloat(balance.replace(/[,\s]/g, '')) || 100000,
      salary: parseFloat(salary.replace(/[,\s]/g, '')) || 85000,
      employer_rate: employerRate,
      growth_rate: growthRate,
      projection_years: years,
      salary_sacrifice_enabled: ssEnabled,
      salary_sacrifice_percent: parseFloat(ssPct) || 0,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Scenario" wide>
      <div className="space-y-4">
        <Input label="Scenario Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Conservative" />

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fund Type</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fundType"
                checked={fundType === 'current'}
                onChange={() => { setFundType('current'); setGrowthRate(0.05) }}
                className="text-blue-600"
              />
              <span className="text-sm">Current Fund</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fundType"
                checked={fundType === 'smsf'}
                onChange={() => { setFundType('smsf'); setGrowthRate(0.1) }}
                className="text-emerald-600"
              />
              <span className="text-sm">SMSF</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Balance ($)" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />
          <Input label="Salary ($)" inputMode="decimal" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Employer Rate"
            options={EMPLOYER_RATE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={employerRate}
            onChange={(e) => setEmployerRate(parseFloat(e.target.value))}
          />
          <Select
            label="Growth Rate"
            options={growthOpts.map((o) => ({ value: o.value, label: o.label }))}
            value={growthRate}
            onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
          />
        </div>

        <Select
          label="Years"
          options={YEAR_OPTIONS.map((y) => ({ value: y, label: String(y) }))}
          value={years}
          onChange={(e) => setYears(parseInt(e.target.value))}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={ssEnabled}
              onChange={(e) => setSSEnabled(e.target.checked)}
              className="rounded text-blue-600"
            />
            Salary Sacrifice
          </label>
          {ssEnabled && (
            <Input label="Sacrifice %" inputMode="decimal" value={ssPct} onChange={(e) => setSSPct(e.target.value)} />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create Scenario</Button>
        </div>
      </div>
    </Modal>
  )
}
