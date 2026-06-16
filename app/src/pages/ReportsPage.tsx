import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { listReports } from '@/lib/firestore'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Report, ReportStatus } from '@/lib/types'
import { format } from 'date-fns'
import { FileText, Download, AlertCircle } from 'lucide-react'

const statusVariant: Record<ReportStatus, 'warning' | 'default' | 'success' | 'danger'> = {
  pending: 'warning',
  generating: 'default',
  generated: 'success',
  failed: 'danger',
}

export function ReportsPage() {
  const profile = useAuthStore((s) => s.profile)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const orgId = profile?.organisationId
    if (!orgId) return
    try {
      const data = await listReports(orgId, profile.id)
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    }
    setLoading(false)
  }, [profile?.organisationId, profile?.id])

  useEffect(() => { load() }, [load])

  const handleDownload = async (report: Report) => {
    if (!report.filePath) return
    try {
      const url = await getDownloadURL(ref(storage, report.filePath))
      window.open(url, '_blank')
    } catch {
      // silently fail — user sees blank page
    }
  }

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 card-padded">
          <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No reports generated yet.</p>
          <p className="text-sm text-gray-400 mt-1">Generate reports from the Projection workspace.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{r.fileName || 'Untitled'}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{r.reportType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {format(new Date(r.createdAt), 'dd MMM yyyy, h:mm a')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'generated' && r.filePath ? (
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(r)}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      ) : r.status === 'failed' ? (
                        <Button size="sm" variant="ghost" disabled>
                          <AlertCircle className="h-3.5 w-3.5" /> Retry
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
