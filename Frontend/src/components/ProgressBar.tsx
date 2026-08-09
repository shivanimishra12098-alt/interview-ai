interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'success' | 'warning' | 'secondary'
  height?: 'sm' | 'md'
  showLabel?: boolean
}

const COLOR_CLASSES: Record<NonNullable<ProgressBarProps['color']>, string> = {
  primary: 'from-primary to-secondary',
  success: 'from-success to-green-400',
  warning: 'from-warning to-orange-400',
  secondary: 'from-secondary to-secondary-light',
}

export default function ProgressBar({ value, max = 100, color = 'primary', height = 'md', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      <div className={`w-full rounded-full bg-white/5 overflow-hidden ${height === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${COLOR_CLASSES[color]} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-slate-400">{Math.round(pct)}%</p>}
    </div>
  )
}
