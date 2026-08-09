import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 glass-card">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary-light mb-5">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
      <p className="text-sm text-slate-400 mt-2 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
