import { Clock, ArrowUpRight } from 'lucide-react'
import type { ResourceItem } from '../types'
import { useToast } from '../context/ToastContext'

const DIFFICULTY_CLASSES: Record<ResourceItem['difficulty'], string> = {
  Beginner: 'text-green-300 bg-success/15',
  Intermediate: 'text-orange-300 bg-warning/15',
  Advanced: 'text-red-300 bg-danger/15',
}

export default function ResourceCard({ resource }: { resource: ResourceItem }) {
  const { showToast } = useToast()

  return (
    <div className="glass-card p-5 flex flex-col transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_CLASSES[resource.difficulty]}`}>
          {resource.difficulty}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={13} /> {resource.time}
        </span>
      </div>
      <h3 className="font-display font-semibold text-white mt-3">{resource.title}</h3>
      <p className="text-sm text-slate-400 mt-1.5 flex-1">{resource.description}</p>
      <p className="text-xs text-primary-light/80 mt-3">{resource.category}</p>
      <button
        onClick={() => showToast(`Starting "${resource.title}" — happy learning!`, 'success')}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-card-border py-2 text-sm font-medium text-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-white transition-colors"
      >
        Start Learning <ArrowUpRight size={15} />
      </button>
    </div>
  )
}
