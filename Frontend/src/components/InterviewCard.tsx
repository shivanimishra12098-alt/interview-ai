import { useNavigate } from 'react-router-dom'
import { Calendar, HelpCircle, ArrowRight } from 'lucide-react'
import type { InterviewRecord } from '../types'
import TopicBadge from './TopicBadge'

interface InterviewCardProps {
  record: InterviewRecord
}

const STATUS_CLASSES: Record<InterviewRecord['status'], string> = {
  Completed: 'text-green-300 bg-success/15',
  'In Progress': 'text-orange-300 bg-warning/15',
  Abandoned: 'text-red-300 bg-danger/15',
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-orange-400'
  return 'text-red-400'
}

export default function InterviewCard({ record }: InterviewCardProps) {
  const navigate = useNavigate()
  const date = new Date(record.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="glass-card p-5 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-white">{record.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{record.type}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASSES[record.status]}`}>
          {record.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {record.topics.map((t) => (
          <TopicBadge key={t} label={t} size="sm" />
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {date}
        </span>
        <span className="flex items-center gap-1.5">
          <HelpCircle size={14} /> {record.questions} questions
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-card-border">
        <div>
          <span className={`text-xl font-display font-semibold ${scoreColor(record.score)}`}>{record.score}%</span>
          <span className="text-xs text-slate-500 ml-1.5">score</span>
        </div>
        <button
          onClick={() => navigate(`/interview/${record.id}/result`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-white transition-colors"
        >
          View Report <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
