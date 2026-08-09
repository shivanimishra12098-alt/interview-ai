import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import CANDIDATES from '../data/candidates'

function CandidateCard({ candidate }: { candidate: any }) {
  const navigate = useNavigate()
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">{candidate.initials}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{candidate.name}</div>
          <div className="text-xs text-slate-400">{candidate.role}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Score</div>
          <div className="text-sm font-semibold text-white">{candidate.interviewScore}%</div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-300">
        <div className="flex-1">
          <div className="text-[11px] text-slate-400">Progress</div>
          <div className="mt-1 text-sm text-white">Day {candidate.currentDay} / {candidate.totalDays}</div>
          <div className="mt-2 h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${candidate.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>🔥 {candidate.streak} day streak</div>
        <div>Status: <span className={`ml-2 ${candidate.status === 'Active' ? 'text-green-400' : candidate.status === 'Completed' ? 'text-primary-light' : 'text-amber-400'}`}>●</span> {candidate.status}</div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <button onClick={() => navigate(`/candidates/${candidate.id}`)} className="text-sm font-medium text-primary-light hover:underline">View Profile →</button>
        <div className="text-xs text-slate-400">Interviews: {candidate.interviewsCompleted}</div>
      </div>
    </div>
  )
}

export default function Candidates() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed' | 'At Risk'>('All')
  const [progressFilter, setProgressFilter] = useState<'All' | '0-25' | '26-50' | '51-75' | '76-100'>('All')
  const [perfFilter, setPerfFilter] = useState<'All' | 'Below60' | '60-80' | 'Above80'>('All')

  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CANDIDATES.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false
      if (progressFilter !== 'All') {
        const p = c.progress
        if (progressFilter === '0-25' && !(p >= 0 && p <= 25)) return false
        if (progressFilter === '26-50' && !(p >= 26 && p <= 50)) return false
        if (progressFilter === '51-75' && !(p >= 51 && p <= 75)) return false
        if (progressFilter === '76-100' && !(p >= 76 && p <= 100)) return false
      }
      if (perfFilter !== 'All') {
        const s = c.interviewScore
        if (perfFilter === 'Below60' && !(s < 60)) return false
        if (perfFilter === '60-80' && !(s >= 60 && s <= 80)) return false
        if (perfFilter === 'Above80' && !(s > 80)) return false
      }

      if (!q) return true
      // search by name, role, or skills
      if (c.name.toLowerCase().includes(q)) return true
      if (c.role.toLowerCase().includes(q)) return true
      const skillsMatch = Object.values(c.skills).some((v: number) => String(v).includes(q))
      if (skillsMatch) return true
      // also check skill names
      const skillNameMatch = Object.keys(c.skills).some((k) => k.toLowerCase().includes(q))
      if (skillNameMatch) return true
      return false
    })
  }, [query, statusFilter, progressFilter, perfFilter])

  const topPerformers = useMemo(() => {
    return [...CANDIDATES].sort((a, b) => b.interviewScore - a.interviewScore).slice(0, 3)
  }, [])

  const counts = useMemo(() => {
    const total = CANDIDATES.length
    const active = CANDIDATES.filter((c) => c.status === 'Active').length
    const completed = CANDIDATES.filter((c) => c.status === 'Completed').length
    const atRisk = CANDIDATES.filter((c) => c.status === 'At Risk').length
    return { total, active, completed, atRisk }
  }, [])

  return (
    <div className="min-h-screen p-6 bg-bg">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-white">Candidate Directory</h1>
            <p className="text-sm text-slate-400">31-Day AI Engineering Cohort — Candidate Profiles</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">31 Candidates · {counts.active} Active · {counts.completed} Completed · {counts.atRisk} At Risk</div>
            <button onClick={() => navigate('/')} className="text-sm text-slate-300 hover:text-white">Back to Home</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search candidates..." className="w-full bg-white/5 rounded-lg pl-10 pr-3 py-2 text-sm text-white" />
                <div className="absolute left-3 top-2 text-slate-400"><Search size={16} /></div>
              </div>
              <div className="flex items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white/5 text-sm text-white p-2 rounded-lg">
                  <option value="All">All Candidates</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="At Risk">At Risk</option>
                </select>
                <select value={progressFilter} onChange={(e) => setProgressFilter(e.target.value as any)} className="bg-white/5 text-sm text-white p-2 rounded-lg">
                  <option value="All">All Progress</option>
                  <option value="0-25">0–25%</option>
                  <option value="26-50">26–50%</option>
                  <option value="51-75">51–75%</option>
                  <option value="76-100">76–100%</option>
                </select>
                <select value={perfFilter} onChange={(e) => setPerfFilter(e.target.value as any)} className="bg-white/5 text-sm text-white p-2 rounded-lg">
                  <option value="All">All Performance</option>
                  <option value="Below60">Below 60%</option>
                  <option value="60-80">60–80%</option>
                  <option value="Above80">Above 80%</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-300">🏆 Top Performers</h3>
              <ol className="mt-3 space-y-1 text-sm text-slate-300">
                {topPerformers.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <div>{t.name}</div>
                    <div className="font-semibold text-white">{t.interviewScore}%</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="col-span-1">
            <div className="glass-card p-4">
              <div className="text-xs text-slate-400">Cohort Summary</div>
              <div className="mt-3 text-white font-semibold text-lg">{counts.total} Candidates</div>
              <div className="mt-2 text-sm text-slate-300">{counts.active} Active · {counts.completed} Completed · {counts.atRisk} At Risk</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </div>
  )
}
