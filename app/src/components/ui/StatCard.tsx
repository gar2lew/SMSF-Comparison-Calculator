import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  className,
  accent,
}: {
  label: string
  value: string | number
  className?: string
  accent?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const accentColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className={cn('card-padded text-center', className)}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', accent && accentColors[accent])}>{value}</p>
    </div>
  )
}
