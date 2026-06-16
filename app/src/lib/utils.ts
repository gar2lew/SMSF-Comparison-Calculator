export function fmtAUD(n: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n)
}

export function fmtAUDCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(n)
  }
  return fmtAUD(n)
}

export function fmtPct(n: number): string {
  return `${new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 }).format(n)}%`
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

export function parseNumber(s: string): number {
  if (!s) return NaN
  const clean = s.replace(/[,\s]/g, '')
  return Number(clean)
}

export function parsePercent(s: string): number {
  if (s === '' || s === null || s === undefined) return 0
  const n = parseNumber(s)
  return isNaN(n) ? NaN : n
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }) as T
}

export function formatCurrencyInput(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
