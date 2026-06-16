import { useState, useEffect, useCallback } from 'react'
import type { ActivityLog, ActivityEntityType } from '@/lib/types'
import { listActivity } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import { Spinner } from '@/components/ui/Spinner'
import { ACTIVITY_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { Clock, TrendingUp, FileText, Share2, Edit3, Archive, Copy, MessageSquare, Presentation } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ActivityTimelineProps {
  entityType: ActivityEntityType
  entityId: string
}

const activityIcons: Record<string, LucideIcon> = {
  created: TrendingUp,
  updated: Edit3,
  shared: Share2,
  exported: FileText,
  presented: Presentation,
  archived: Archive,
  duplicated: Copy,
  scenario_added: TrendingUp,
  note_added: MessageSquare,
}

export function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const profile = useAuthStore((s) => s.profile)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    const orgId = profile?.organisationId
    if (!orgId) return
    try {
      const data = await listActivity(orgId, { entityType, entityId })
      setLogs(data)
    } catch { /* silent */ }
    setLoading(false)
  }, [profile?.organisationId, entityType, entityId])

  useEffect(() => { loadLogs() }, [loadLogs])

  if (loading) return <Spinner className="h-5 w-5" />

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Activity Timeline</h3>
      {logs.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet.</p>}
      <div className="space-y-0">
        {logs.map((log, i) => {
          const Icon = activityIcons[log.activityType] || Clock
          return (
            <div key={log.id} className="flex gap-3 py-1.5">
              <div className="relative">
                <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                </div>
                {i < logs.length - 1 && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {ACTIVITY_LABELS[log.activityType] || log.activityType}
                </p>
                {log.description && <p className="text-xs text-gray-500 dark:text-gray-400">{log.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{format(new Date(log.createdAt), 'dd MMM, h:mm a')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
