import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Download, AlertTriangle, Trophy, ArrowLeft, ListChecks } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import TopicBadge from '../components/TopicBadge'
import { useInterviews } from '../context/InterviewContext'
import { useToast } from '../context/ToastContext'
import { useCandidate } from '../context/CandidateContext.tsx'

export default function InterviewResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRecord, updateRecord } = useInterviews()
  const { showToast } = useToast()
  const { candidate } = useCandidate()

  const record = id ? getRecord(id) : undefined
  const [draftSummary, setDraftSummary] = useState('')

  useEffect(() => {
    setDraftSummary(record?.summary ?? '')
  }, [record?.id, record?.summary])

  if (!record) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-20">
          <h1 className="font-display text-xl font-semibold text-white">Report not found</h1>
          <p className="text-slate-400 mt-2 text-sm">
            We couldn't find a report for this interview. It may have been removed.
          </p>
          <Button className="mt-6" onClick={() => navigate('/history')}>
            Go to Past Interviews
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const completedOn = new Date(record.date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const handleDownload = () => {
    const lines = [
      `AI Interviewer — Feedback Report`,
      `================================`,
      `Candidate: ${candidate.name}`,
      `Interview: ${record.name}`,
      `Type: ${record.type}  |  Difficulty: ${record.difficulty}`,
      `Topics: ${record.topics.join(', ')}`,
      `Questions Attempted: ${record.questions}`,
      `Score: ${record.score}%`,
      `Status: ${record.status}`,
      `Completed On: ${completedOn}`,
      ``,
      `Overall Summary`,
      `---------------`,
      record.summary || 'No summary added yet.',
      ``,
      `Strengths`,
      `---------`,
      ...record.strengths.map((s) => `- ${s}`),
      ``,
      `Areas to Improve`,
      `-----------------`,
      ...record.improvements.map((s) => `- ${s}`),
      ``,
      `Recommended Next Steps`,
      `-----------------------`,
      ...record.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${record.name.replace(/\s+/g, '-').toLowerCase()}-report.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Report downloaded.', 'success')
  }

  const handleSaveSummary = () => {
    if (!record) return

    const nextSummary = draftSummary.trim()
    updateRecord(record.id, { summary: nextSummary })
    showToast('Interview summary saved.', 'success')
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate('/history')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Back to Past Interviews
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-green-400">
              <CheckCircle2 size={20} />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Interview Complete</h1>
          </div>
          <p className="text-slate-400 mt-2 ml-[calc(2.5rem+0.625rem)]">Your personalized technical interview feedback</p>
        </div>
        <Button icon={<Download size={16} />} onClick={handleDownload}>
          Download Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold text-white">Interview Summary</h2>
              <p className="text-sm text-slate-400 mt-1">Capture your takeaways and highlight what stood out after the interview.</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleSaveSummary}>
              Save Summary
            </Button>
          </div>

          <textarea
            value={draftSummary}
            onChange={(e) => setDraftSummary(e.target.value)}
            rows={6}
            placeholder="Add a quick recap of your performance, strengths, or areas to improve..."
            className="mt-4 w-full rounded-xl border border-card-border bg-bg-deep/70 px-3 py-3 text-sm text-slate-200 outline-none ring-0 placeholder:text-slate-500 focus:border-primary/60"
          />

          <div className="flex flex-wrap gap-1.5 mt-4">
            {record.topics.map((t) => (
              <TopicBadge key={t} label={t} size="sm" />
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-[50px]" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary-light">
              <Trophy size={26} />
            </span>
            <p className="font-display font-semibold text-white mt-3">Great Job!</p>
            <p className="text-3xl font-display font-bold text-gradient mt-2">{record.score}%</p>
            <p className="text-xs text-slate-400 mt-1">Overall score</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Card>
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-400" /> Strengths
          </h2>
          <ul className="mt-4 space-y-3">
            {record.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 size={15} className="text-green-400 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" /> Areas to Improve
          </h2>
          <ul className="mt-4 space-y-3">
            {record.improvements.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-300">
                <AlertTriangle size={15} className="text-orange-400 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <ListChecks size={18} className="text-primary-light" /> Recommended Next Steps
        </h2>
        <ol className="mt-4 space-y-3">
          {record.nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-light text-xs font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mt-5">
        <h2 className="font-display font-semibold text-white mb-4">Interview Details</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-slate-500 text-xs">Candidate</dt>
            <dd className="text-slate-200 mt-1">{candidate.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Questions Attempted</dt>
            <dd className="text-slate-200 mt-1">{record.questions}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Topics Covered</dt>
            <dd className="text-slate-200 mt-1">{record.topics.length}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Status</dt>
            <dd className="text-green-400 mt-1">{record.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Completed On</dt>
            <dd className="text-slate-200 mt-1">{completedOn}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-wrap gap-3 mt-8 pb-4">
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        <Button variant="outline" onClick={() => navigate('/interview/new')}>
          Start Another Interview
        </Button>
      </div>
    </DashboardLayout>
  )
}
 