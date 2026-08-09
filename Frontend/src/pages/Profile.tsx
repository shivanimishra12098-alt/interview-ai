import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'
import { getProfile, saveProfile as persistProfile } from '../services_api'

const defaultProfile = {
  fullName: 'John Doe',
  initials: 'JD',
  role: 'AI Engineering Candidate',
  cohort: '31-Day AI Engineering Cohort',
  status: 'Active',
  day: 18,
  totalDays: 31,
  streak: 7,
  daysCompleted: 18,
  interviewsCompleted: 12,
  averageScore: 84,
  projectsCompleted: 4,
  skills: [
    { name: 'Python', pct: 82 },
    { name: 'Prompt Engineering', pct: 91 },
    { name: 'RAG', pct: 76 },
    { name: 'Vector Databases', pct: 68 },
    { name: 'AI Agents', pct: 73 },
    { name: 'MCP', pct: 42 },
    { name: 'AI Deployment', pct: 35 },
    { name: 'System Design', pct: 81 },
  ],
  interviewScores: [72, 76, 79, 81, 85, 84],
  strengths: [
    'Strong problem-solving ability',
    'Clear technical communication',
    'Good understanding of RAG',
    'Strong Python fundamentals',
    'Consistent interview performance',
  ],
  improvements: ['MCP fundamentals', 'AI deployment', 'Distributed systems', 'Advanced agent architectures'],
  achievements: [
    { id: 'a1', title: 'First Interview', icon: '🏆', desc: 'Completed your first AI interview', locked: false },
    { id: 'a2', title: '7-Day Streak', icon: '🔥', desc: 'Learned for 7 consecutive days', locked: false },
    { id: 'a3', title: 'RAG Master', icon: '🧠', desc: 'Scored 85%+ on RAG assessment', locked: false },
    { id: 'a4', title: 'Fast Learner', icon: '⚡', desc: 'Completed 7 days ahead of schedule', locked: false },
    { id: 'a5', title: 'Interview Ready', icon: '🎯', desc: 'Completed 10 interviews', locked: false },
    { id: 'a6', title: 'AI Builder', icon: '🔬', desc: 'Completed 3 AI projects', locked: false },
  ],
  recentActivity: [
    { when: 'Today', items: ['Completed Day 18', 'Scored 88% in AI Agent Interview'] },
    { when: 'Yesterday', items: ['Completed Day 17', 'Completed Agent Memory lesson'] },
    { when: '2 days ago', items: ['Completed Day 16', 'Scored 82% in Tool Calling Interview'] },
    { when: '3 days ago', items: ['Completed mini project'] },
  ],
}

function sparkline(values: number[], color = 'rgba(139,92,246,0.95)') {
  const w = 160
  const h = 40
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

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(() => ({ ...defaultProfile }))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const remoteProfile = await getProfile()
        if (!active) return
        const nextProfile = { ...defaultProfile, ...(remoteProfile || {}) }
        setProfile(nextProfile)
        setForm(nextProfile)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [])

  const weeks = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const groups: number[][] = []
    for (let i = 0; i < days.length; i += 7) groups.push(days.slice(i, i + 7))
    return groups
  }, [])

  async function saveProfile() {
    const nextProfile = { ...profile, ...form }
    setProfile(nextProfile)
    setForm(nextProfile)
    setEditOpen(false)
    try {
      await persistProfile(nextProfile)
    } catch (error) {
      console.error('Unable to save profile', error)
    }
  }

  function openDay(d: number) {
    navigate(`/cohort/day/${d}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center text-white">
        <div className="glass-card p-6 text-center">Loading profile…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-bg">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-display text-2xl shadow-glow">{profile.initials}</div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-white">{profile.fullName}</h1>
              <p className="text-slate-400 mt-1">{profile.role} · {profile.cohort}</p>
              <p className="text-sm text-slate-300 mt-2">Status: <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400" /> <span className="ml-1">{profile.status}</span></span></p>
            </div>
          </div>

          <div className="ml-auto flex gap-3">
            <Button variant="outline" onClick={() => setEditOpen(true)}>Edit Profile</Button>
            <Button variant="ghost" onClick={() => alert('Public profile: coming soon')}>View Public Profile</Button>
          </div>

          <div className="w-full lg:w-96 mt-4 lg:mt-0">
            <div className="text-xs text-slate-400">Cohort Progress</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={Math.round((profile.day / profile.totalDays) * 100)} max={100} />
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <div>Day {profile.day} of {profile.totalDays}</div>
                  <div className="font-medium text-white">{Math.round((profile.day / profile.totalDays) * 100)}% Complete</div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2"><span>🔥</span> <span>{profile.streak} Days</span></div>
              <div className="text-slate-400">·</div>
              <div className="text-slate-400">{profile.daysCompleted} / {profile.totalDays} Days Completed</div>
            </div>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="text-xs text-slate-400">Days Completed</div>
            <div className="mt-2 text-2xl font-semibold text-white">{profile.daysCompleted} / {profile.totalDays}</div>
          </div>
          <div className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="text-xs text-slate-400">Interviews Completed</div>
            <div className="mt-2 text-2xl font-semibold text-white">{profile.interviewsCompleted}</div>
          </div>
          <div className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="text-xs text-slate-400">Average Interview Score</div>
            <div className="mt-2 text-2xl font-semibold text-white">{profile.averageScore}%</div>
          </div>
          <div className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="text-xs text-slate-400">Projects Completed</div>
            <div className="mt-2 text-2xl font-semibold text-white">{profile.projectsCompleted}</div>
          </div>
        </div>

        {/* 31-Day journey and skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">31-Day Learning Journey</h3>
            <p className="text-sm text-slate-400 mt-2">✓ Completed · ● Current · ○ Upcoming — Click a day to open the lesson</p>

            <div className="mt-4 space-y-4">
              {weeks.map((w, wi) => (
                <div key={wi}>
                  <div className="text-sm font-medium text-slate-300 mb-2">Week {wi + 1}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {w.map((d) => {
                      const isCompleted = d < profile.day
                      const isCurrent = d === profile.day
                      const label = (() => {
                        const texts: Record<number, string> = {
                          1: 'AI Engineering Fundamentals',
                          2: 'LLM Fundamentals',
                          3: 'Prompt Engineering',
                          4: 'Embeddings',
                          5: 'Vector Databases',
                          6: 'RAG Fundamentals',
                          7: 'Mini Project',
                          8: 'Advanced RAG',
                          9: 'Chunking Strategies',
                          10: 'Retrieval & Ranking',
                          11: 'RAG Evaluation',
                          12: 'Building a RAG Application',
                          13: 'AI Application Architecture',
                          14: 'Week 2 Project',
                          15: 'AI Agents',
                          16: 'Tool Calling',
                          17: 'Agent Memory',
                          18: 'Agentic Workflows',
                          19: 'Multi-Agent Systems',
                          20: 'Agent Evaluation',
                          21: 'Agent Project',
                          22: 'Model Context Protocol',
                          23: 'MCP Servers',
                          24: 'AI Tools & Integrations',
                          25: 'AI Deployment',
                          26: 'Production AI Systems',
                          27: 'Monitoring & Observability',
                          28: 'Production Project',
                          29: 'AI Security',
                          30: 'Final AI System',
                          31: 'Final Interview & Assessment',
                        }
                        return texts[d] ?? `Day ${d}`
                      })()

                      return (
                        <button
                          key={d}
                          onClick={() => openDay(d)}
                          className={`text-left p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-900/30 border border-green-800' : isCurrent ? 'bg-primary/10 border border-primary/30' : 'bg-white/3 border border-card-border hover:bg-white/5'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-lg">{isCompleted ? '✓' : isCurrent ? '●' : '○'}</div>
                              <div>
                                <div className="text-sm text-slate-200 font-medium">Day {d} — {label}</div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">{isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">Skills & Competency</h3>
            <p className="text-sm text-slate-400 mt-2">Progress and suggested improvements</p>
            <div className="mt-4 space-y-4">
              {profile.skills.map((s: any) => (
                <div key={s.name} className="">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-200 font-medium">{s.name}</div>
                    <div className="text-sm text-slate-400">{s.pct}%</div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={s.pct} max={100} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interview performance & strengths */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Interview Performance</h3>
                <p className="text-sm text-slate-400 mt-1">Overview of recent interview metrics</p>
              </div>
              <div className="text-sm text-slate-400">Average Score <span className="font-semibold text-white ml-2">{profile.averageScore}%</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/3 rounded-xl">
                <div className="text-xs text-slate-300">Technical Accuracy</div>
                <div className="text-2xl font-semibold text-white mt-2">87%</div>
              </div>
              <div className="p-4 bg-white/3 rounded-xl">
                <div className="text-xs text-slate-300">Problem Solving</div>
                <div className="text-2xl font-semibold text-white mt-2">82%</div>
              </div>
              <div className="p-4 bg-white/3 rounded-xl">
                <div className="text-xs text-slate-300">Communication</div>
                <div className="text-2xl font-semibold text-white mt-2">86%</div>
              </div>
              <div className="p-4 bg-white/3 rounded-xl">
                <div className="text-xs text-slate-300">Conceptual Understanding</div>
                <div className="text-2xl font-semibold text-white mt-2">80%</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-300">Recent interview scores</div>
              <div className="text-xs text-slate-400">Last 6</div>
            </div>
            <div className="mt-2">{sparkline(profile.interviewScores)}</div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">Your Strengths</h3>
            <ul className="mt-3 space-y-2 text-slate-300">
              {profile.strengths.map((s: any) => (
                <li key={s} className="flex items-center gap-2"><span className="text-green-400">✓</span>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements & Achievements & Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">Recommended Improvements</h3>
            <ul className="mt-3 space-y-3">
              {profile.improvements.map((imp: any) => (
                <li key={imp} className="flex items-center justify-between bg-white/3 p-3 rounded-lg">
                  <div className="text-slate-200">⚠ {imp}</div>
                  <Button variant="primary" size="sm" onClick={() => navigate('/resources')}>Practice →</Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">Achievements</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {profile.achievements.map((a: any) => (
                <div key={a.id} className={`p-3 rounded-lg ${a.locked ? 'opacity-40' : 'bg-white/4'} flex items-start gap-3`}>
                  <div className="text-2xl">{a.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{a.title}</div>
                    <div className="text-xs text-slate-400">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white">Recent Activity</h3>
            <div className="mt-3 space-y-3 text-slate-300">
              {profile.recentActivity.map((g: any) => (
                <div key={g.when}>
                  <div className="text-sm text-slate-400">{g.when}</div>
                  <ul className="mt-1 ml-3 list-disc">
                    {g.items.map((it: string) => (
                      <li key={it} className="text-slate-200">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current goal */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Current Goal</h3>
            <p className="text-slate-400 mt-1">Complete Week 3 of the AI Engineering Cohort</p>
            <div className="mt-3 w-72">
              <ProgressBar value={Math.round(((profile.day - 14) / 7) * 100)} max={100} />
              <div className="text-sm text-slate-300 mt-2">{Math.max(0, (profile.day - 14))} / 7 days completed</div>
            </div>
          </div>
          <div>
            <Button variant="primary" onClick={() => openDay(profile.day)}>Continue Learning →</Button>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" footer={<><Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={saveProfile}>Save</Button></>}>
        <div className="space-y-3">
          <label className="text-xs text-slate-400">Full Name</label>
          <input className="w-full bg-white/5 p-2 rounded-md text-white" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value, initials: (e.target.value || 'JD').split(' ').map((x: string) => x[0]).slice(0,2).join('') })} />
          <label className="text-xs text-slate-400">Role</label>
          <input className="w-full bg-white/5 p-2 rounded-md text-white" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <label className="text-xs text-slate-400">Bio</label>
          <textarea className="w-full bg-white/5 p-2 rounded-md text-white" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <label className="text-xs text-slate-400">Primary Programming Language</label>
          <input className="w-full bg-white/5 p-2 rounded-md text-white" value={form.primaryLanguage || ''} onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value })} />
          <label className="text-xs text-slate-400">Experience Level</label>
          <select className="w-full bg-white/5 p-2 rounded-md text-white" value={form.experience || 'Intermediate'} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <label className="text-xs text-slate-400">Learning Goal</label>
          <input className="w-full bg-white/5 p-2 rounded-md text-white" value={form.learningGoal || ''} onChange={(e) => setForm({ ...form, learningGoal: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
