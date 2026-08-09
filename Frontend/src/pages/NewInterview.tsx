import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Code2, MessagesSquare, Network, Boxes } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import TopicBadge from '../components/TopicBadge'
import { INTERVIEW_TYPES, TOPIC_LIST } from '../data/mockData'
import { useInterviews } from '../context/InterviewContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { startInterview } from '../services_api'
import type { Difficulty, InterviewConfig, InterviewMode, InterviewType } from '../types'

const TYPE_ICONS: Record<InterviewType, typeof Code2> = {
  'Technical Interview': MessagesSquare,
  'Coding Interview': Code2,
  'System Design': Network,
  'Behavioral Interview': Boxes,
}

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']
const QUESTION_COUNTS = [8, 10, 15, 20]
const MODES: { id: InterviewMode; description: string }[] = [
  { id: 'Adaptive AI', description: 'Follow-ups are generated based on your previous answers.' },
  { id: 'Standard', description: 'A fixed set of questions, same difficulty throughout.' },
]

export default function NewInterview() {
  const navigate = useNavigate()
  const { setDraftConfig } = useInterviews()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [type, setType] = useState<InterviewType>('Technical Interview')
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.defaultDifficulty)
  const [topics, setTopics] = useState<string[]>(['DSA', 'System Design'])
  const [questionCount, setQuestionCount] = useState<number>(settings.defaultQuestionCount)
  const [mode, setMode] = useState<InterviewMode>(settings.adaptiveQuestions ? 'Adaptive AI' : 'Standard')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const toggleTopic = (topic: string) => {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleStart = async () => {
    if (topics.length === 0) {
      setError('Select at least one topic to continue.')
      showToast('Please select at least one topic.', 'error')
      return
    }
    setError('')

    const config: InterviewConfig = { type, difficulty, topics, questionCount, mode }
    setDraftConfig(config)
    setStarting(true)

    try {
      // Ask the backend to create a real interview session. If VITE_API_BASE isn't
      // configured, or the call fails, we fall back to the previous fully-local
      // flow (LiveInterview generates its own mock plan) so the app still works
      // as a demo without a backend.
      const { sessionId, firstQuestion } = await startInterview(config)
      navigate(`/interview/${sessionId}`, { state: { sessionId, firstQuestion } })
    } catch (err) {
      const id = `int-${Date.now()}`
      navigate(`/interview/${id}`)
    } finally {
      setStarting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Start a New Interview</h1>
        <p className="text-slate-400 mt-1.5">Customize your interview experience.</p>

        {/* Interview type */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Interview Type</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {INTERVIEW_TYPES.map(({ id, description }) => {
              const Icon = TYPE_ICONS[id]
              const active = type === id
              return (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className={`text-left glass-card p-4 transition-all duration-150 ${
                    active ? 'border-primary shadow-glow-sm bg-primary/[0.06]' : 'hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-primary/25 text-primary-light' : 'bg-white/5 text-slate-400'}`}>
                      <Icon size={17} />
                    </span>
                    <span className="font-medium text-white text-sm">{id}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{description}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Difficulty */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Difficulty</h2>
          <div className="flex flex-wrap gap-2.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium border transition-all ${
                  difficulty === d
                    ? 'border-primary bg-primary/20 text-primary-light shadow-glow-sm'
                    : 'border-card-border bg-white/5 text-slate-300 hover:border-primary/40'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-300">Topics</h2>
            <span className="text-xs text-slate-500">{topics.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPIC_LIST.map((topic) => (
              <TopicBadge key={topic} label={topic} active={topics.includes(topic)} onClick={() => toggleTopic(topic)} />
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mt-2.5">{error}</p>}
        </section>

        {/* Question count */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Number of Questions</h2>
          <div className="flex flex-wrap gap-2.5">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`h-12 w-16 rounded-xl text-sm font-medium border transition-all ${
                  questionCount === n
                    ? 'border-primary bg-primary/20 text-primary-light shadow-glow-sm'
                    : 'border-card-border bg-white/5 text-slate-300 hover:border-primary/40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Mode */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Interview Mode</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MODES.map(({ id, description }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`text-left glass-card p-4 transition-all duration-150 ${
                  mode === id ? 'border-primary shadow-glow-sm bg-primary/[0.06]' : 'hover:border-primary/40'
                }`}
              >
                <span className="font-medium text-white text-sm">{id}</span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 py-3.5 text-sm font-medium text-white shadow-glow hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          {starting ? 'Starting…' : 'Start Interview'} <ArrowRight size={17} />
        </button>
      </div>
    </DashboardLayout>
  )
}