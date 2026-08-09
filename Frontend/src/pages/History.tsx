import { useMemo, useState } from 'react'
import { Search, History as HistoryIcon } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import InterviewCard from '../components/InterviewCard'
import EmptyState from '../components/EmptyState'
import { useInterviews } from '../context/InterviewContext'
import type { InterviewType } from '../types'

const FILTERS: ('All' | InterviewType)[] = ['All', 'Technical Interview', 'Coding Interview', 'System Design', 'Behavioral Interview']

export default function History() {
  const { history } = useInterviews()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')

  const filtered = useMemo(() => {
    return history.filter((r) => {
      const matchesFilter = filter === 'All' || r.type === filter
      const matchesQuery =
        query.trim() === '' ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.topics.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      return matchesFilter && matchesQuery
    })
  }, [history, query, filter])

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Past Interviews</h1>
      <p className="text-slate-400 mt-1.5">Review your history and revisit any past feedback report.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or topic..."
            className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
              filter === f
                ? 'border-primary bg-primary/20 text-primary-light'
                : 'border-card-border bg-white/5 text-slate-400 hover:text-white hover:border-primary/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon size={26} />}
            title="No results found"
            description="Try a different search term or clear the active filter."
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((record) => (
              <InterviewCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
