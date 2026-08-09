interface TopicBadgeProps {
  label: string
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function TopicBadge({ label, active = false, onClick, size = 'md' }: TopicBadgeProps) {
  const base =
    size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3.5 py-1.5'
  if (!onClick) {
    return (
      <span className={`inline-flex items-center rounded-full border border-card-border bg-white/5 text-slate-300 ${base}`}>
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border transition-all duration-150 ${base} ${
        active
          ? 'border-primary bg-primary/20 text-primary-light shadow-glow-sm'
          : 'border-card-border bg-white/5 text-slate-300 hover:border-primary/40 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
