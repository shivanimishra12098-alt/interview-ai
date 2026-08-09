import type { Achievement } from '../types'

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-card-border bg-white/[0.02] p-4 transition-colors hover:border-primary/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-2xl">
        {achievement.icon}
      </span>
      <div>
        <p className="font-medium text-white text-sm">{achievement.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>
      </div>
    </div>
  )
}
