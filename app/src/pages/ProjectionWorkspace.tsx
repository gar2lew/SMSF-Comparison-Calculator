import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  getProjection,
  listScenarios,
  updateScenario,
  createScenario,
  createActivity,
  updateProjection,
  getClient,
} from '@/lib/firestore'
import { projectYearlySeries, scenarioToInput } from '@/lib/calculator'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useToastStore } from '@/stores/toastStore'
import { ScenarioPanel } from '@/components/calculator/ScenarioPanel'
import { ProjectionChart } from '@/components/calculator/ProjectionChart'
import { ComparisonSummary } from '@/components/calculator/ComparisonSummary'
import { YearlyBreakdown } from '@/components/calculator/YearlyBreakdown'
import { ScenarioEditor } from '@/components/calculator/ScenarioEditor'
import { NotesPanel } from '@/components/crm/NotesPanel'
import { ActivityTimeline } from '@/components/crm/ActivityTimeline'
import type { Client, Scenario, ComparisonResult, YearlyDataPoint } from '@/lib/types'
import {
  Copy,
  Share2,
  FileDown,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function ProjectionWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const addToast = useToastStore((s) => s.addToast)

  const [projection, setProjection] = useState<any>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedIdA, setSelectedIdA] = useState<string | null>(null)
  const [selectedIdB, setSelectedIdB] = useState<string | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)

  const [showEditor, setShowEditor] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    breakdown: false,
    notes: false,
    activity: false,
  })

  const orgId = profile?.organisationId ?? ''
  const userId = profile?.id ?? ''

  const load = useCallback(async () => {
    if (!id || !orgId) return
    try {
      const proj = await getProjection(id)
      if (!proj) { setError('Projection not found'); setLoading(false); return }
      if (proj.organisationId !== orgId) { setError('Access denied'); setLoading(false); return }

      const [scens, cl] = await Promise.all([
        listScenarios(orgId, id),
        getClient(proj.clientId),
      ])

      setProjection(proj)
      setScenarios(scens)
      setClient(cl)
      setSelectedIdA(scens[0]?.id ?? null)
      setSelectedIdB(scens[1]?.id ?? scens[0]?.id ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projection')
    }
    setLoading(false)
  }, [id, orgId])

  useEffect(() => { load() }, [load])

  const runComparison = useCallback(() => {
    const a = scenarios.find((s) => s.id === selectedIdA)
    const b = scenarios.find((s) => s.id === selectedIdB)
    if (!a || !b) return

    const resA = projectYearlySeries(scenarioToInput(a))
    const resB = projectYearlySeries(scenarioToInput(b))
    const years = Math.min(a.projectionYears, b.projectionYears)

    const winner =
      resA.finalBalance === resB.finalBalance ? 'tie'
        : resA.finalBalance > resB.finalBalance ? 'a' : 'b'

    setComparison({
      scenarioA: { scenario: a, result: resA },
      scenarioB: { scenario: b, result: resB },
      winner,
      deltaFinal: resB.finalBalance - resA.finalBalance,
      deltaGrowthPct: resB.growthPercent - resA.growthPercent,
      yearsCompared: years,
    })
  }, [scenarios, selectedIdA, selectedIdB])

  useEffect(() => {
    if (scenarios.length > 0) runComparison()
  }, [scenarios, selectedIdA, selectedIdB, runComparison])

  const handleUpdate = async (scenarioId: string, updates: Partial<Scenario>) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === scenarioId ? { ...s, ...updates } : s)),
    )

    try {
      await updateScenario(scenarioId, updates)
      if (projection) await updateProjection(projection.id, {})
    } catch {
      addToast('Failed to save scenario', 'error')
    }
  }

  const persistResults = useCallback(async () => {
    if (!comparison || !orgId) return
    const { scenarioA, scenarioB } = comparison
    try {
      await Promise.all([
        updateScenario(scenarioA.scenario.id, {
          resultFinalBalance: scenarioA.result.finalBalance,
          resultGrowthAmount: scenarioA.result.growthAmount,
          resultGrowthPercent: scenarioA.result.growthPercent,
          resultYearlyData: scenarioA.result.yearlyData as YearlyDataPoint[],
          resultComputedAt: new Date().toISOString(),
        }),
        updateScenario(scenarioB.scenario.id, {
          resultFinalBalance: scenarioB.result.finalBalance,
          resultGrowthAmount: scenarioB.result.growthAmount,
          resultGrowthPercent: scenarioB.result.growthPercent,
          resultYearlyData: scenarioB.result.yearlyData as YearlyDataPoint[],
          resultComputedAt: new Date().toISOString(),
        }),
      ])
    } catch {
      // Result persistence is best-effort; don't block UI
    }
  }, [comparison, orgId])

  useEffect(() => {
    if (comparison) persistResults()
  }, [comparison, persistResults])

  const handleAddScenario = async (data: any) => {
    if (!projection || !orgId) return
    const maxOrder = Math.max(...scenarios.map((s) => s.displayOrder), 0)
    const first = scenarios[0]

    try {
      await createScenario({
        organisationId: orgId,
        projectionId: projection.id,
        displayOrder: maxOrder + 1,
        name: data.name || 'New Scenario',
        fundType: data.fund_type || 'current',
        currentBalance: data.current_balance ?? first?.currentBalance ?? 100000,
        salary: data.salary ?? first?.salary ?? 85000,
        employerRate: data.employer_rate ?? first?.employerRate ?? 0.12,
        growthRate: data.growth_rate ?? 0.1,
        projectionYears: data.projection_years ?? first?.projectionYears ?? 10,
        salarySacrificeEnabled: data.salary_sacrifice_enabled ?? false,
        salarySacrificePercent: data.salary_sacrifice_percent ?? 0,
      })
      addToast('Scenario added', 'success')
      load()
    } catch {
      addToast('Failed to add scenario', 'error')
    }
  }

  const handleDuplicate = async () => {
    const source = scenarios.find((s) => s.id === selectedIdA) ?? scenarios[0]
    if (!source || !projection || !orgId) return

    try {
      await createScenario({
        organisationId: orgId,
        projectionId: projection.id,
        displayOrder: Math.max(...scenarios.map((s) => s.displayOrder), 0) + 1,
        name: `${source.name} (Copy)`,
        fundType: source.fundType,
        currentBalance: source.currentBalance,
        salary: source.salary,
        employerRate: source.employerRate,
        growthRate: source.growthRate,
        projectionYears: source.projectionYears,
        salarySacrificeEnabled: source.salarySacrificeEnabled,
        salarySacrificePercent: source.salarySacrificePercent,
      })
      addToast('Scenario duplicated', 'success')
      load()
    } catch {
      addToast('Failed to duplicate scenario', 'error')
    }
  }

  const handleShare = async () => {
    if (!projection) return
    try {
      await updateProjection(projection.id, { shared: true })
      await createActivity({
        organisationId: orgId,
        entityType: 'projection',
        entityId: projection.id,
        ownerUserId: userId,
        activityType: 'shared',
      })
      setProjection({ ...projection, shared: true })
      addToast('Projection shared', 'success')
    } catch {
      addToast('Failed to share', 'error')
    }
  }

  const handleExportCSV = () => {
    if (!comparison) return
    const { scenarioA: sa, scenarioB: sb, yearsCompared } = comparison
    const headers = [
      'Year', sa.scenario.name, `${sb.scenario.name} Balance`, 'Difference',
      `Emp Contrib (${sa.scenario.name})`, `SS Contrib (${sa.scenario.name})`,
      `Emp Contrib (${sb.scenario.name})`, `SS Contrib (${sb.scenario.name})`,
    ]
    const rows = [headers.join(',')]
    for (let y = 0; y <= yearsCompared; y++) {
      const da = sa.result.yearlyData[y]; const db = sb.result.yearlyData[y]
      if (!da || !db) continue
      rows.push([
        y === 0 ? 'Start' : `Year ${y}`,
        da.balance.toFixed(2), db.balance.toFixed(2),
        (db.balance - da.balance).toFixed(2),
        da.employerContribution.toFixed(2), da.salarySacrificeContribution.toFixed(2),
        db.employerContribution.toFixed(2), db.salarySacrificeContribution.toFixed(2),
      ].join(','))
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projection?.name || 'projection'}_comparison.csv`.replace(/[/\\:*?"<>|]/g, '_')
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const scenarioA = scenarios.find((s) => s.id === selectedIdA) ?? null
  const scenarioB = scenarios.find((s) => s.id === selectedIdB) ?? null

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{error}</p>
      <Button variant="ghost" onClick={() => navigate('/projections')}>Back to Projections</Button>
    </div>
  )
  if (!projection) return null

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projections')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Projections
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{projection.name}</h1>
          {client && (
            <button onClick={() => navigate(`/clients/${client.id}`)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {client.firstName} {client.lastName}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={projection.status === 'active' ? 'success' : projection.status === 'draft' ? 'warning' : 'default'}>
            {projection.status}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleDuplicate}><Copy className="h-3.5 w-3.5" /> Duplicate</Button>
          <Button variant="ghost" size="sm" onClick={handleShare}><Share2 className="h-3.5 w-3.5" /> Share</Button>
          <Button variant="ghost" size="sm" onClick={handleExportCSV}><FileDown className="h-3.5 w-3.5" /> CSV</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => { if (s.id !== selectedIdA) setSelectedIdA(s.id) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              s.id === selectedIdA || s.id === selectedIdB
                ? s.fundType === 'smsf'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
        <button
          onClick={() => setShowEditor(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-500"
        >
          <Plus className="h-3 w-3 inline mr-1" /> Add
        </button>
      </div>

      {scenarioA && scenarioB && scenarioA.projectionYears !== scenarioB.projectionYears && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400">
          Different year lengths selected. Comparison uses {Math.min(scenarioA.projectionYears, scenarioB.projectionYears)} years.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioPanel scenario={scenarioA} scenarios={scenarios} selectedId={selectedIdA} onSelect={setSelectedIdA} onUpdate={handleUpdate} label="Compare A" />
        <ScenarioPanel scenario={scenarioB} scenarios={scenarios} selectedId={selectedIdB} onSelect={setSelectedIdB} onUpdate={handleUpdate} label="Compare B" />
      </div>

      {comparison && (
        <>
          <Card><h2 className="font-semibold text-sm mb-4">Balance Projection</h2><ProjectionChart comparison={comparison} /></Card>
          <ComparisonSummary comparison={comparison} />
          <YearlyBreakdown comparison={comparison} />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between font-semibold text-sm">
            Adviser Notes {expandedSections.notes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expandedSections.notes && <div className="mt-4"><NotesPanel entityType="projection" entityId={projection.id} /></div>}
        </Card>
        <Card>
          <button onClick={() => toggleSection('activity')} className="w-full flex items-center justify-between font-semibold text-sm">
            Activity Timeline {expandedSections.activity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expandedSections.activity && <div className="mt-4"><ActivityTimeline entityType="projection" entityId={projection.id} /></div>}
        </Card>
      </div>

      <ScenarioEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleAddScenario}
        defaults={{ balance: scenarioA?.currentBalance ?? 100000, salary: scenarioA?.salary ?? 85000, employerRate: scenarioA?.employerRate ?? 0.12 }}
      />
    </div>
  )
}
