import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardCheck, Percent, MessagesSquare, Layers, ArrowRight } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import StatCard from '../components/StatCard'
import InterviewCard from '../components/InterviewCard'
import EmptyState from '../components/EmptyState'
import { useInterviews } from '../context/InterviewContext'
import { RECOMMENDED_TOPICS } from '../data/mockData'
import { useToast } from '../context/ToastContext'
import { useCandidate } from '../context/CandidateContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { history } = useInterviews()
  const { showToast } = useToast()
  const { candidate } = useCandidate()

  const completed = history.filter((h) => h.status === 'Completed')
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, h) => sum + h.score, 0) / completed.length)
    : 0
  const totalQuestions = history.reduce((sum, h) => sum + h.questions, 0)
  const topicsCovered = new Set(history.flatMap((h) => h.topics)).size

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Welcome back, {candidate.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">Ready to sharpen your technical skills?</p>
        </div>
        <button
          onClick={() => navigate('/interview/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-medium text-white shadow-glow-sm hover:brightness-110 transition-all"
        >
          <Plus size={17} /> New Interview
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Interviews Completed" value={completed.length} icon={<ClipboardCheck size={20} />} accent="primary" />
        <StatCard label="Average Score" value={`${avgScore}%`} icon={<Percent size={20} />} accent="success" trend="+4%" />
        <StatCard label="Questions Answered" value={totalQuestions} icon={<MessagesSquare size={20} />} accent="secondary" />
        <StatCard label="Topics Covered" value={topicsCovered} icon={<Layers size={20} />} accent="warning" />
      </div>

      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="font-display text-lg font-semibold text-white">Recent Interviews</h2>
        <button
          onClick={() => navigate('/history')}
          className="text-sm text-primary-light hover:text-white transition-colors inline-flex items-center gap-1"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={26} />}
          title="No interviews yet"
          description="Start your first AI-driven mock interview and your results will show up here."
          action={
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-medium text-white"
            >
              <Plus size={16} /> New Interview
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {history.slice(0, 4).map((record) => (
            <InterviewCard key={record.id} record={record} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="font-display text-lg font-semibold text-white">Recommended for you</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOMMENDED_TOPICS.map((topic) => (
          <div key={topic.title} className="glass-card p-5 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{topic.icon}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-card-border">
                {topic.difficulty}
              </span>
            </div>
            <h3 className="font-display font-semibold text-white mt-3.5">{topic.title}</h3>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Progress</span>
                <span>{topic.progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700"
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => {
                showToast(`Queued "${topic.title}" for practice.`, 'info')
                navigate('/resources')
              }}
              className="mt-4 w-full rounded-xl border border-card-border py-2 text-sm font-medium text-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-white transition-colors"
            >
              Practice
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
 