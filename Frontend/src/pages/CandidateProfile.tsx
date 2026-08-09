import { useParams, useNavigate } from 'react-router-dom'
import CANDIDATES from '../data/candidates'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'

function sparkline(values: number[], color = 'rgba(139,92,246,0.95)') {
  const w = 220
  const h = 48
  if (!values || values.length === 0) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / Math.max(1, max - min)) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CandidateProfile() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const candidate = CANDIDATES.find((c) => c.id === candidateId)

  if (!candidate) {
    return (
      <div className="min-h-screen p-6 bg-bg">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6">
            <div className="text-white">Candidate not found</div>
            <div className="mt-4"><Button variant="ghost" onClick={() => navigate('/candidates')}>Back to Candidates</Button></div>
          </div>
        </div>
      </div>
    )
  }

  const scoreHistory = candidate.recentInterviews.map((r: any) => r.score)

  return (
    <div className="min-h-screen p-6 bg-bg">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <button onClick={() => navigate('/candidates')} className="text-sm text-slate-300 hover:text-white">← Back to Candidates</button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-display text-2xl">{candidate.initials}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-semibold text-white">{candidate.name}</h1>
              <div className="text-sm text-slate-400">{candidate.role}</div>
              <div className="text-sm text-slate-400">{candidate.cohort}</div>
              <div className="mt-2 text-sm">Status: <span className={`ml-2 ${candidate.status === 'Active' ? 'text-green-400' : candidate.status === 'Completed' ? 'text-primary-light' : 'text-amber-400'}`}>●</span> {candidate.status}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Average Score</div>
              <div className="text-2xl font-semibold text-white">{candidate.interviewScore}%</div>
              <div className="mt-3 text-xs text-slate-400">Interviews: {candidate.interviewsCompleted}</div>
              <div className="mt-2"><Button variant="primary" onClick={() => alert('Start interview flow for ' + candidate.name)}>Start Interview</Button></div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <h3 className="text-lg font-display font-semibold text-white">Cohort Progress</h3>
              <div className="mt-2">Day {candidate.currentDay} / {candidate.totalDays}</div>
              <div className="mt-2 w-full">
                <ProgressBar value={candidate.progress} max={100} />
                <div className="text-sm text-slate-400 mt-2">{candidate.progress}% Complete</div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-400">Current Streak</div>
                  <div className="text-xl font-semibold text-white mt-1">🔥 {candidate.streak} Days</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-400">Projects</div>
                  <div className="text-xl font-semibold text-white mt-1">{candidate.projectsCompleted}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-400">Interviews</div>
                  <div className="text-xl font-semibold text-white mt-1">{candidate.interviewsCompleted}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-400">Avg Score</div>
                  <div className="text-xl font-semibold text-white mt-1">{candidate.interviewScore}%</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-display font-semibold text-white">Interview Performance</h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/3 rounded-xl">
                    <div className="text-xs text-slate-300">Technical Accuracy</div>
                    <div className="text-2xl font-semibold text-white mt-2">{Math.min(100, candidate.interviewScore + 4)}%</div>
                  </div>
                  <div className="p-4 bg-white/3 rounded-xl">
                    <div className="text-xs text-slate-300">Problem Solving</div>
                    <div className="text-2xl font-semibold text-white mt-2">{Math.min(100, candidate.interviewScore - 2)}%</div>
                  </div>
                  <div className="p-4 bg-white/3 rounded-xl">
                    <div className="text-xs text-slate-300">Communication</div>
                    <div className="text-2xl font-semibold text-white mt-2">{Math.min(100, candidate.interviewScore)}%</div>
                  </div>
                  <div className="p-4 bg-white/3 rounded-xl">
                    <div className="text-xs text-slate-300">Conceptual Understanding</div>
                    <div className="text-2xl font-semibold text-white mt-2">{Math.max(45, candidate.interviewScore - 4)}%</div>
                  </div>
                </div>

                <div className="mt-4">{sparkline(scoreHistory)}</div>

                <div className="mt-6">
                  <h3 className="text-lg font-display font-semibold text-white">Recent Interviews</h3>
                  <ul className="mt-3 space-y-2 text-slate-300">
                    {candidate.recentInterviews.map((r: any) => (
                      <li key={r.title} className="flex items-center justify-between bg-white/3 p-3 rounded-lg">
                        <div>{r.title}</div>
                        <div className="font-semibold text-white">{r.score}%</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-display font-semibold text-white">Strengths</h3>
                  <ul className="mt-3 space-y-2 text-slate-300">
                    {candidate.strengths.map((s: any) => (
                      <li key={s} className="flex items-center gap-2"><span className="text-green-400">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-display font-semibold text-white">Areas to Improve</h3>
                  <ul className="mt-3 space-y-2 text-slate-300">
                    {candidate.areasToImprove.map((s: any) => (
                      <li key={s} className="flex items-center justify-between bg-white/3 p-3 rounded-lg">
                        <div>⚠ {s}</div>
                        <div className="text-xs text-slate-400">Recommended: Practice</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-display font-semibold text-white">Recommendations</h3>
                  <div className="mt-3 text-slate-300">
                    {candidate.skills.mcp < 50 && (
                      <div className="bg-white/3 p-3 rounded-lg mb-2">Recommended: Complete MCP Fundamentals — Day 22</div>
                    )}
                    {candidate.skills.systemDesign < 60 && (
                      <div className="bg-white/3 p-3 rounded-lg">Recommended: Practice System Design Interview</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div>
              <div className="glass-card p-4">
                <h3 className="text-lg font-display font-semibold text-white">Skills</h3>
                <div className="mt-3 space-y-3">
                  {Object.entries(candidate.skills).map(([k, v]: any) => (
                    <div key={k}>
                      <div className="flex items-center justify-between text-sm text-slate-200">{k.replace(/([A-Z])/g, ' $1')} <span className="text-slate-400">{v}%</span></div>
                      <div className="mt-1"><ProgressBar value={v} max={100} /></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-display font-semibold text-white">31-Day Journey</h3>
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: candidate.totalDays }).map((_, i) => {
                        const d = i + 1
                        const isCompleted = d < candidate.currentDay
                        const isCurrent = d === candidate.currentDay
                        return (
                          <div key={d} className={`text-xs p-2 text-center rounded ${isCompleted ? 'bg-green-800 text-white' : isCurrent ? 'bg-primary/10 border border-primary/30 text-white' : 'bg-white/3 text-slate-200'}`}>
                            {isCompleted ? '✓' : isCurrent ? '●' : d}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-display font-semibold text-white">Achievements</h3>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {candidate.achievements.map((a: any) => (
                        <div key={a.id} className={`p-3 rounded-lg ${a.unlocked ? 'bg-white/4' : 'opacity-40 bg-white/6'}`}>{a.title}</div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
