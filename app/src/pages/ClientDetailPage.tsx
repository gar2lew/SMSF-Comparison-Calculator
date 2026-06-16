import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getClient, listProjections } from '@/lib/firestore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { NotesPanel } from '@/components/crm/NotesPanel'
import type { Client, Projection } from '@/lib/types'
import { format } from 'date-fns'
import { Mail, Phone, Calendar, Plus, ArrowLeft } from 'lucide-react'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [projections, setProjections] = useState<Projection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id || !profile?.organisationId) return

    try {
      const [c, p] = await Promise.all([
        getClient(id),
        listProjections(profile.organisationId, { clientId: id }),
      ])

      if (!c) {
        setError('Client not found')
      } else if (c.organisationId !== profile.organisationId) {
        setError('Access denied')
      } else {
        setClient(c)
        setProjections(p)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client')
    }
    setLoading(false)
  }, [id, profile?.organisationId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>
  if (!client) return <p className="text-center mt-20 text-gray-500">Client not found.</p>

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </button>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{client.firstName} {client.lastName}</h1>
            <Badge variant={client.status === 'active' ? 'success' : client.status === 'lead' ? 'warning' : 'default'}>
              {client.status}
            </Badge>
          </div>
          <Button variant="secondary" size="sm">Edit</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
          {client.email && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" /> {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" /> {client.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" /> Client since {format(new Date(client.createdAt), 'dd MMM yyyy')}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Projections ({projections.length})</h2>
            <Button size="sm" onClick={() => navigate(`/projections/new/${client.id}`)}>
              <Plus className="h-4 w-4" /> New Projection
            </Button>
          </div>

          {projections.length === 0 ? (
            <div className="card-padded text-center py-12 text-gray-400">
              <p>No projections yet for this client.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projections.map((p) => (
                <Link key={p.id} to={`/projections/${p.id}`}>
                  <Card padding={true} className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-blue-600 dark:text-blue-400">{p.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(p.updatedAt), 'dd MMM yyyy')}
                          {p.shared && ' · Shared'}
                          {p.presented && ' · Presented'}
                        </p>
                      </div>
                      <Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'default'}>
                        {p.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            {profile && <NotesPanel entityType="client" entityId={client.id} />}
          </Card>
        </div>
      </div>
    </div>
  )
}
