import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  accent?: 'primary' | 'secondary' | 'success' | 'warning'
  trend?: string
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/15 text-primary-light',
  secondary: 'bg-secondary/15 text-secondary-light',
  success: 'bg-success/15 text-green-300',
  warning: 'bg-warning/15 text-orange-300',
}

export default function StatCard({ label, value, icon, accent = 'primary', trend }: StatCardProps) {
  return (
    <div className="glass-card p-5 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}>
          {icon}
        </span>
        {trend && (
          <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl sm:text-3xl font-display font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}
