import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { listClients, createClient as createClientDoc, createActivity } from '@/lib/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToastStore } from '@/stores/toastStore'
import type { Client, ClientStatus } from '@/lib/types'
import { format } from 'date-fns'
import { Plus, Users } from 'lucide-react'

const statusVariant: Record<ClientStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  lead: 'warning',
  archived: 'default',
}

export function ClientsPage() {
  const profile = useAuthStore((s) => s.profile)
  const addToast = useToastStore((s) => s.addToast)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  const load = useCallback(async () => {
    const orgId = profile?.organisationId
    if (!orgId) return

    try {
      const data = await listClients(orgId, {
        status: filter !== 'all' ? filter : undefined,
        search: search || undefined,
      })
      setClients(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    }
    setLoading(false)
  }, [profile?.organisationId, filter, search])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const handleCreate = async () => {
    const orgId = profile?.organisationId
    const userId = profile?.id
    if (!orgId || !userId || !firstName.trim() || !lastName.trim()) return
    setSaving(true)

    try {
      const created = await createClientDoc({
        organisationId: orgId,
        ownerUserId: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: clientEmail.trim() || null,
        phone: clientPhone.trim() || null,
      })

      if (created) {
        await createActivity({
          organisationId: orgId,
          entityType: 'client',
          entityId: created.id,
          ownerUserId: userId,
          activityType: 'created',
          description: `Client ${firstName} ${lastName} created`,
        })
        addToast('Client created', 'success')
      }

      setModalOpen(false)
      setFirstName('')
      setLastName('')
      setClientEmail('')
      setClientPhone('')
      load()
    } catch {
      addToast('Failed to create client', 'error')
    }
    setSaving(false)
  }

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'active', 'lead', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === f
                  ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 card-padded">
          <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No clients found.</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)} variant="secondary">
            Create your first client
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <Link to={`/clients/${c.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {format(new Date(c.updatedAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Client">
        <div className="space-y-4">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <Input label="Email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          <Input label="Phone" type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>
              Create Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
