import { useMemo, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import { RESOURCES } from '../data/mockData'

const CATEGORIES = [
  'All',
  'Data Structures',
  'Algorithms',
  'System Design',
  'Python',
  'AI/ML',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
]

export default function Resources() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesCategory = category === 'All' || r.category === category
      const matchesQuery = query.trim() === '' || r.title.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Resources</h1>
      <p className="text-slate-400 mt-1.5">Curated material to help you close the gaps from your interviews.</p>

      <div className="mt-6 relative max-w-md">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources..."
          className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
              category === c
                ? 'border-primary bg-primary/20 text-primary-light'
                : 'border-card-border bg-white/5 text-slate-400 hover:text-white hover:border-primary/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<BookOpen size={26} />} title="No resources found" description="Try a different category or search term." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
