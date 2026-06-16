import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { listProjections, listActivity, countDocuments } from '@/lib/firestore'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { ActivityLog } from '@/lib/types'
import { ACTIVITY_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { TrendingUp, Users, FileText } from 'lucide-react'

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const [stats, setStats] = useState({ total: 0, month: 0, clients: 0, presented: 0 })
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orgId = profile?.organisationId
    if (!orgId) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        const [projections, activity, clientCount, presentedCount] = await Promise.all([
          listProjections(orgId as string),
          listActivity(orgId as string, { limitCount: 10 }),
          countDocuments(orgId as string, 'clients', { status: 'active' }),
          countDocuments(orgId as string, 'projections', { presented: 'true' }),
        ])

        const thisMonth = projections.filter((p) => {
          const d = new Date(p.createdAt)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length

        setStats({
          total: projections.length,
          month: thisMonth,
          clients: clientCount,
          presented: presentedCount,
        })
        setRecentActivity(activity)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      }
      setLoading(false)
    }

    load()
  }, [profile?.organisationId])

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{profile ? `, ${profile.fullName.split(' ')[0]}` : ''}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Here&apos;s your workspace overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projections" value={stats.total} accent="blue" />
        <StatCard label="This Month" value={stats.month} accent="green" />
        <StatCard label="Active Clients" value={stats.clients} accent="amber" />
        <StatCard label="Presented" value={stats.presented} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {ACTIVITY_LABELS[a.activityType] || a.activityType}
                    </p>
                    <p className="text-xs text-gray-400">{format(new Date(a.createdAt), 'dd MMM, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Quick Actions
          </h2>
          <div className="space-y-2">
            <Link to="/clients" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="inline h-4 w-4 mr-2" />
              Create New Client
            </Link>
            <Link to="/projections" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              <TrendingUp className="inline h-4 w-4 mr-2" />
              New Projection
            </Link>
            <Link to="/reports" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="inline h-4 w-4 mr-2" />
              View Reports
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
