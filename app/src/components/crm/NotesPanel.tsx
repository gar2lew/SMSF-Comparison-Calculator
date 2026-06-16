import { useState, useEffect, useCallback } from 'react'
import type { Note, NoteType, NoteEntityType } from '@/lib/types'
import { listNotes, createNote as createNoteDoc, createActivity } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, MessageSquare, Eye, Lock } from 'lucide-react'
import { format } from 'date-fns'

interface NotesPanelProps {
  entityType: NoteEntityType
  entityId: string
}

const noteTypeMeta: Record<NoteType, { label: string; icon: typeof MessageSquare; variant: 'info' | 'success' | 'default' }> = {
  adviser: { label: 'Adviser', icon: MessageSquare, variant: 'info' },
  client: { label: 'Client', icon: Eye, variant: 'success' },
  internal: { label: 'Internal', icon: Lock, variant: 'default' },
}

export function NotesPanel({ entityType, entityId }: NotesPanelProps) {
  const profile = useAuthStore((s) => s.profile)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('adviser')
  const [saving, setSaving] = useState(false)

  const loadNotes = useCallback(async () => {
    const orgId = profile?.organisationId
    if (!orgId) return
    try {
      const data = await listNotes(orgId, entityType, entityId)
      setNotes(data)
    } catch { /* silent */ }
    setLoading(false)
  }, [profile?.organisationId, entityType, entityId])

  useEffect(() => { loadNotes() }, [loadNotes])

  const handleAdd = async () => {
    if (!content.trim() || !profile?.organisationId || !profile?.id) return
    setSaving(true)
    try {
      const created = await createNoteDoc({
        organisationId: profile.organisationId,
        entityType,
        entityId,
        ownerUserId: profile.id,
        noteType,
        content: content.trim(),
      })
      if (created) {
        await createActivity({
          organisationId: profile.organisationId,
          entityType,
          entityId,
          ownerUserId: profile.id,
          activityType: 'note_added',
          description: `${noteType} note added`,
        })
        setNotes([created, ...notes])
        setContent('')
      }
    } catch { /* silent */ }
    setSaving(false)
  }

  if (loading) return <Spinner className="h-5 w-5" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Notes</h3>
        <span className="text-xs text-gray-400">{notes.length}</span>
      </div>

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800"
          >
            {(['adviser', 'client', 'internal'] as NoteType[]).map((t) => (
              <option key={t} value={t}>{noteTypeMeta[t].label}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleAdd} disabled={!content.trim() || saving} loading={saving}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notes.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">No notes yet.</p>
        )}
        {notes.map((note) => {
          const meta = noteTypeMeta[note.noteType]
          return (
            <div key={note.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                <span className="text-xs text-gray-400">
                  {format(new Date(note.createdAt), 'dd MMM yyyy, h:mm a')}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
