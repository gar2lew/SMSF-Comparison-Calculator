import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  listProjections,
  listClients,
  createProjection as createProjDoc,
  createScenario,
  createActivity,
} from '@/lib/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { useToastStore } from '@/stores/toastStore'
import type { Projection, Client, ProjectionStatus } from '@/lib/types'
import { format } from 'date-fns'
import { Plus, TrendingUp } from 'lucide-react'

const statusVariant: Record<ProjectionStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
}

export function ProjectionsPage() {
  const profile = useAuthStore((s) => s.profile)
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()
  const [projections, setProjections] = useState<(Projection & { clientName?: string })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

  const load = useCallback(async () => {
    const orgId = profile?.organisationId
    if (!orgId) return

    try {
      const [pj, cl] = await Promise.all([
        listProjections(orgId),
        listClients(orgId, { status: 'active' }),
      ])

      const clientMap = new Map(cl.map((c) => [c.id, c]))
      const pjWithNames = pj.map((p) => ({
        ...p,
        clientName: clientMap.get(p.clientId)
          ? `${clientMap.get(p.clientId)!.firstName} ${clientMap.get(p.clientId)!.lastName}`
          : 'Unknown client',
      }))

      setProjections(pjWithNames)
      setClients(cl)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projections')
    }
    setLoading(false)
  }, [profile?.organisationId])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    const orgId = profile?.organisationId
    const userId = profile?.id
    if (!orgId || !userId || !newName.trim() || !selectedClientId) return
    setSaving(true)

    try {
      const proj = await createProjDoc({
        organisationId: orgId,
        clientId: selectedClientId,
        ownerUserId: userId,
        name: newName.trim(),
      })

      if (proj) {
        await Promise.all([
          createScenario({
            organisationId: orgId,
            projectionId: proj.id,
            displayOrder: 0,
            name: 'Industry Default',
            fundType: 'current',
            currentBalance: 100000,
            salary: 85000,
            employerRate: 0.12,
            growthRate: 0.05,
            projectionYears: 10,
            salarySacrificeEnabled: false,
            salarySacrificePercent: 0,
          }),
          createScenario({
            organisationId: orgId,
            projectionId: proj.id,
            displayOrder: 1,
            name: 'SMSF Growth',
            fundType: 'smsf',
            currentBalance: 100000,
            salary: 85000,
            employerRate: 0.12,
            growthRate: 0.1,
            projectionYears: 10,
            salarySacrificeEnabled: false,
            salarySacrificePercent: 0,
          }),
          createActivity({
            organisationId: orgId,
            entityType: 'projection',
            entityId: proj.id,
            ownerUserId: userId,
            activityType: 'created',
            description: `Projection "${newName}" created`,
          }),
        ])

        addToast('Projection created', 'success')
        setModalOpen(false)
        setNewName('')
        navigate(`/projections/${proj.id}`)
      }
    } catch {
      addToast('Failed to create projection', 'error')
    }
    setSaving(false)
  }

  const filtered = search
    ? projections.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : projections

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{projections.length} projection{projections.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Projection
        </Button>
      </div>

      <Input placeholder="Search projections..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 card-padded">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No projections found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link key={p.id} to={`/projections/${p.id}`}>
              <div className="card-padded hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">{p.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {p.clientName}
                    {' · '}
                    {format(new Date(p.updatedAt), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.shared && <Badge variant="info">Shared</Badge>}
                  {p.presented && <Badge variant="success">Presented</Badge>}
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Projection">
        <div className="space-y-4">
          <Input label="Projection Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Retirement Plan 2045" required />
          <Select
            label="Client"
            options={clients.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving} disabled={!newName.trim() || !selectedClientId}>
              Create Projection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
