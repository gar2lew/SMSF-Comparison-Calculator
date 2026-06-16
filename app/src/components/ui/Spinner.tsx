import { Loader2 } from 'lucide-react'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className || 'h-8 w-8 text-blue-500'}`} />
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="h-10 w-10 text-blue-500" />
    </div>
  )
}
