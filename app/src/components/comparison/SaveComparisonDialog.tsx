import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function SaveComparisonDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (clientName: string) => void }) {
  const [clientName, setClientName] = useState('')
  return <Modal open={open} onClose={onClose} title="Save comparison"><div className="space-y-5"><label className="block text-sm font-semibold text-navy">Client name <span className="font-normal text-slate-400">(optional)</span><input value={clientName} onChange={(event) => setClientName(event.target.value)} className="premium-control mt-2" /></label><div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(clientName.trim())}>Save report</Button></div></div></Modal>
}
