import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getOrganisationSettings, saveOrganisationSettings } from '@/lib/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useToastStore } from '@/stores/toastStore'
import { DEFAULT_DISCLAIMER } from '@/lib/constants'

export function SettingsPage() {
  const profile = useAuthStore((s) => s.profile)
  const addToast = useToastStore((s) => s.addToast)
  const [loading, setLoading] = useState(true)
  const [firmName, setFirmName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const orgId = profile?.organisationId
    if (!orgId) { setLoading(false); return }
    async function load() {
      try {
        const s = await getOrganisationSettings(orgId as string)
        if (s) {
          setPrimaryColor(s.primaryColor)
          setDisclaimer(s.disclaimerText)
        }
      } catch { /* use defaults */ }
      setLoading(false)
    }
    load()
  }, [profile?.organisationId])

  const handleSave = async () => {
    const orgId = profile?.organisationId
    if (!orgId) return
    setSaving(true)
    try {
      await saveOrganisationSettings(orgId as string, {
        primaryColor,
        disclaimerText: disclaimer,
      })
        /* saved */
      addToast('Settings saved', 'success')
    } catch {
      addToast('Failed to save settings', 'error')
    }
    setSaving(false)
  }

  if (loading) return <Spinner className="h-8 w-8 mx-auto mt-20" />

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Firm branding and report defaults</p>
      </div>

      <Card>
        <h2 className="font-semibold text-sm mb-4">Firm Branding</h2>
        <div className="space-y-4">
          <Input label="Firm Name" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="e.g., ASG Partners" />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
              <code className="text-sm text-gray-500">{primaryColor}</code>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Logo</label>
            <Button variant="secondary" size="sm" disabled>Upload Logo (coming soon)</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-sm mb-4">Compliance Disclaimer</h2>
        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => setDisclaimer(DEFAULT_DISCLAIMER)} className="text-xs text-blue-500 hover:underline mt-1">
          Reset to default
        </button>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving}>Save Settings</Button>
      </div>
    </div>
  )
}
