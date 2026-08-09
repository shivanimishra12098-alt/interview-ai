import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bot, Lightbulb, LogOut, Menu } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import TypingIndicator from '../components/TypingIndicator'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { useInterviews } from '../context/InterviewContext'
import { useToast } from '../context/ToastContext'
import { AI_CLOSING, FOLLOW_UPS, QUESTION_BANK } from '../data/mockData'
import type { ChatMessageData, InterviewConfig, InterviewRecord } from '../types'
import { evaluateAnswer } from '../services_api'
import { getQuestionDef, EvalResult } from '../evaluator'

const DEFAULT_CONFIG: InterviewConfig = {
  type: 'Technical Interview',
  difficulty: 'Intermediate',
  topics: ['DSA', 'System Design'],
  questionCount: 8,
  mode: 'Adaptive AI',
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildQuestionPlan(count: number): string[] {
  const bank = shuffle(QUESTION_BANK)
  const followUps = shuffle(FOLLOW_UPS)
  const plan: string[] = []
  let bankIdx = 0
  let followIdx = 0
  for (let i = 0; i < count; i++) {
    const useFollowUp = i > 0 && i % 3 === 0 && followIdx < followUps.length
    if (useFollowUp) {
      plan.push(followUps[followIdx])
      followIdx++
    } else {
      plan.push(bank[bankIdx % bank.length])
      bankIdx++
    }
  }
  return plan
}

const STRENGTH_POOL = [
  'Strong grasp of system design concepts',
  'Good problem-solving approach',
  'Clear communication',
  'Logical thinking',
  'Confident with core data structures',
  'Structured, step-by-step reasoning',
]

const IMPROVEMENT_POOL = [
  'Deepen knowledge of distributed systems',
  'Practice more on concurrent programming',
  'Improve test case coverage',
  'Work on edge case handling',
  'Quantify trade-offs with concrete numbers',
]

const NEXT_STEPS_POOL = [
  'Practice designing scalable systems',
  'Solve more problems on concurrency and multithreading',
  'Review advanced data structures and algorithms',
  'Build projects and write unit/integration tests',
  'Do a mock system design session weekly',
]

function pick<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n)
}

export default function LiveInterview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { draftConfig, addRecord } = useInterviews()
  const { showToast } = useToast()

  const config = draftConfig ?? DEFAULT_CONFIG
  const sessionId = useMemo(() => `SES-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, [])
  const questionPlan = useMemo(() => buildQuestionPlan(config.questionCount), [config.questionCount])

  const [messages, setMessages] = useState<ChatMessageData[]>(() => [
    {
      id: 'q-0',
      role: 'ai',
      content: questionPlan[0],
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(1) // number of AI questions asked so far (do not increment for retries)
  const [finished, setFinished] = useState(false)
  const [endModalOpen, setEndModalOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)

  // Track evaluation history per question (1-based questionIndex)
  const [answersHistory, setAnswersHistory] = useState<Record<number, any>>({})

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const totalQuestions = config.questionCount
  const topicsCovered = Math.min(config.topics.length, Math.max(1, Math.ceil((questionIndex / totalQuestions) * config.topics.length)))

  const finishInterview = (finalMessages: ChatMessageData[]) => {
    // Build final scores from answersHistory. For each question, take the highest attempt score (best demonstrated understanding).
    const perQuestionScores: number[] = []
    let retries = 0
    const topicScores: Record<string, { total: number; count: number }> = {}

    Object.values(answersHistory).forEach((q: any) => {
      if (!q || !q.attempts || q.attempts.length === 0) return
      const best = Math.max(...q.attempts.map((a: any) => a.score || 0))
      perQuestionScores.push(best)
      retries += Math.max(0, q.attempts.length - 1)
      const def = getQuestionDef(q.question)
      const topic = def?.topic ?? 'General'
      if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 }
      topicScores[topic].total += best
      topicScores[topic].count += 1
    })

    const overallScore = perQuestionScores.length
      ? Math.round(perQuestionScores.reduce((a, b) => a + b, 0) / perQuestionScores.length)
      : Math.floor(65 + Math.random() * 30)

    const technicalAccuracy = overallScore // for demo, reuse overall
    const problemSolving = Math.max(50, overallScore - 5)
    const communication = Math.max(50, overallScore - 10)
    const conceptual = Math.max(50, overallScore - 8)

    // derive strengths/weaknesses from topicScores
    const topicsSummary = Object.entries(topicScores).map(([topic, v]) => ({ topic, avg: Math.round(v.total / v.count) }))
    const strongest = topicsSummary.sort((a, b) => b.avg - a.avg).slice(0, 4).map((t) => t.topic)
    const weakest = topicsSummary.sort((a, b) => a.avg - b.avg).slice(0, 4).map((t) => t.topic)

    const record: InterviewRecord = {
      id: id ?? `int-${Date.now()}`,
      name: config.type,
      type: config.type,
      difficulty: config.difficulty,
      topics: config.topics,
      date: new Date().toISOString(),
      questions: totalQuestions,
      score: overallScore,
      status: 'Completed',
      strengths: strongest.length ? strongest : pick(STRENGTH_POOL, 4),
      improvements: weakest.length ? weakest : pick(IMPROVEMENT_POOL, 4),
      nextSteps: pick(NEXT_STEPS_POOL, 4),
      summary:
        'Feedback is generated from per-question evaluations. See the detailed per-question breakdown in your session history.',
      messages: finalMessages,
    }
    addRecord(record)
    setFinished(true)
    window.setTimeout(() => navigate(`/interview/${record.id}/result`), 900)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping || finished) return

    const userMessage: ChatMessageData = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    // Append user message immediately and disable input while evaluating
    const withUser = [...messages, userMessage]
    setMessages(withUser)
    setInput('')
    setIsTyping(true)

    // Short delay to simulate evaluation processing and to show "AI is evaluating..."
    window.setTimeout(async () => {
      // Show an evaluation notice (typing indicator is visible too)
      const evalNotice: ChatMessageData = {
        id: `ai-eval-${Date.now()}`,
        role: 'ai',
        content: 'AI is evaluating your answer...',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, evalNotice])

      // Do the (local/mock) evaluation
      const currentQuestionIdx = Math.max(0, Math.min(questionPlan.length - 1, questionIndex - 1))
      const questionText = questionPlan[currentQuestionIdx]
      const evalResult: EvalResult = await evaluateAnswer(questionText, userMessage.content)

      // Record attempt in history
      setAnswersHistory((prev) => {
        const copy: Record<number, any> = { ...(prev || {}) }
        const qKey = questionIndex
        if (!copy[qKey]) copy[qKey] = { question: questionText, attempts: [] }
        copy[qKey].attempts.push({
          candidateAnswer: userMessage.content,
          score: evalResult.score,
          correctness: evalResult.correctness,
          feedback: evalResult.feedback,
          timestamp: Date.now(),
        })
        return copy
      })

      // Compose compact evaluation UI text for the AI message (small evaluation section)
      const badge =
        evalResult.correctness === 'excellent' ? '✓ Excellent' : evalResult.correctness === 'good' ? '✓ Good' : evalResult.correctness === 'partial' ? '⚠ Partially Correct' : evalResult.correctness === 'irrelevant' ? '✕ Irrelevant' : '✕ Incorrect'
      const evalContent = `${badge}\nScore: ${Math.round(evalResult.score)}%\n\n${evalResult.feedback}`

      const evalMessage: ChatMessageData = {
        id: `ai-fb-${Date.now()}`,
        role: 'ai',
        content: evalContent,
        timestamp: Date.now(),
      }

      // Remove the evalNotice and append the evaluation message
      setMessages((prev) => {
        // drop the last evalNotice we added and append feedback
        const withoutNotice = prev.filter((m) => m.id !== evalNotice.id)
        return [...withoutNotice, evalMessage]
      })

      // Decide next action based on evaluation
      if (evalResult.nextAction === 'retry') {
        // Provide a hint if available and keep the same question (do not increment questionIndex)
        const hint = getQuestionDef(questionText)?.hints?.[0]
        const retryText =
          (hint ? `Hint: ${hint}\n\n` : '') + `Let's try that same question again:\n${questionText}`
        const retryMsg: ChatMessageData = {
          id: `ai-retry-${Date.now()}`,
          role: 'ai',
          content: retryText,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, retryMsg])
        setIsTyping(false)
        return
      }

      if (evalResult.nextAction === 'followup') {
        // Ask a targeted follow-up that tests a missing concept if available
        const missing = evalResult.missingConcepts && evalResult.missingConcepts.length > 0 ? evalResult.missingConcepts[0] : null
        const followUpText = missing
          ? `You mentioned some correct ideas. Can you expand on: ${missing}?`
          : 'Can you elaborate a bit more on your approach?'
        const followUpMsg: ChatMessageData = {
          id: `ai-follow-${Date.now()}`,
          role: 'ai',
          content: followUpText,
          timestamp: Date.now(),
        }
        // Do not advance questionIndex for a follow-up — it's part of the same question
        setMessages((prev) => [...prev, followUpMsg])
        setIsTyping(false)
        return
      }

      // nextAction === 'next' -> move to next question
      // If this was the last question, finish; otherwise ask next and increment questionIndex
      const nextIdx = questionIndex // next questionPlan index is questionIndex (0-based questionIndex)
      if (questionIndex >= totalQuestions) {
        // Append closing and finish
        const closing: ChatMessageData = {
          id: `ai-close-${Date.now()}`,
          role: 'ai',
          content: AI_CLOSING,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, closing])
        finishInterview([...messages, userMessage, evalMessage, closing])
        setIsTyping(false)
        return
      }

      const nextQuestion: ChatMessageData = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: questionPlan[nextIdx],
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, nextQuestion])
      setQuestionIndex((n) => n + 1)
      setIsTyping(false)
    }, 900)
  }

  const handleEndInterview = () => {
    setEndModalOpen(false)
    showToast('Interview ended early — generating your report.', 'info')
    finishInterview(messages)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-80 lg:flex-col border-r border-card-border bg-bg-deep/50 p-6 gap-6 overflow-y-auto">
        <SidebarContent
          config={config}
          questionIndex={Math.min(questionIndex, totalQuestions)}
          totalQuestions={totalQuestions}
          topicsCovered={topicsCovered}
          sessionId={sessionId}
          finished={finished}
        />
      </aside>

      {/* Mobile tips drawer */}
      <Modal open={tipsOpen} onClose={() => setTipsOpen(false)} title="Interview details">
        <SidebarContent
          config={config}
          questionIndex={Math.min(questionIndex, totalQuestions)}
          totalQuestions={totalQuestions}
          topicsCovered={topicsCovered}
          sessionId={sessionId}
          finished={finished}
          compact
        />
      </Modal>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-card-border bg-bg-deep/60 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setTipsOpen(true)} className="lg:hidden text-slate-400 hover:text-white shrink-0" aria-label="Open session details">
              <Menu size={20} />
            </button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow-sm">
              <Bot size={18} />
            </span>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-white text-sm sm:text-base truncate">AI Technical Interviewer</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulseGlow" /> Adaptive interview session
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={<LogOut size={15} />} onClick={() => setEndModalOpen(true)} disabled={finished}>
            <span className="hidden sm:inline">End Interview</span>
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
          {finished && (
            <div className="glass-card p-5 text-center border-primary/40 animate-fadeIn">
              <p className="font-display font-semibold text-white">Interview complete 🎉</p>
              <p className="text-sm text-slate-400 mt-1">Redirecting you to your personalized feedback…</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-card-border bg-bg-deep/40">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={isTyping || finished}
            placeholder={finished ? 'Interview complete' : 'Type your answer...'}
          />
          <p className="text-[11px] text-slate-500 mt-2 px-1">Press Enter to send · Shift + Enter for a new line</p>
        </div>
      </div>

      <Modal
        open={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        title="End this interview?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEndModalOpen(false)}>Keep going</Button>
            <Button variant="danger" size="sm" onClick={handleEndInterview}>End interview</Button>
          </>
        }
      >
        You've answered {Math.max(0, questionIndex - 1)} of {totalQuestions} questions. Ending now will generate
        feedback based on what you've completed so far.
      </Modal>
    </div>
  )
}

function SidebarContent({
  config,
  questionIndex,
  totalQuestions,
  topicsCovered,
  sessionId,
  finished,
  compact = false,
}: {
  config: InterviewConfig
  questionIndex: number
  totalQuestions: number
  topicsCovered: number
  sessionId: string
  finished: boolean
  compact?: boolean
}) {
  return (
    <div className={compact ? '' : 'sticky top-6'}>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-display font-semibold">
          JD
        </span>
        <div>
          <p className="font-medium text-white text-sm">John Doe</p>
          <p className="text-xs text-slate-400">Software Engineer</p>
        </div>
      </div>

      <div className="mt-6 glass-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Interview Progress</span>
          <span>
            Question {Math.min(questionIndex, totalQuestions)} of {totalQuestions}
          </span>
        </div>
        <ProgressBar value={questionIndex} max={totalQuestions} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Topics Covered</p>
          <p className="font-display text-xl font-semibold text-white mt-1">{topicsCovered}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-sm font-medium text-white mt-1.5 flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${finished ? 'bg-slate-500' : 'bg-green-400 animate-pulseGlow'}`} />
            {finished ? 'Completed' : 'In progress'}
          </p>
        </div>
      </div>

      <div className="mt-4 glass-card p-4">
        <p className="text-xs text-slate-400">Session ID</p>
        <p className="text-sm font-mono text-slate-300 mt-1">{sessionId}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {config.topics.map((t) => (
          <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-card-border bg-white/5 text-slate-300">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-primary/25 bg-primary/[0.07] p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-primary-light">
          <Lightbulb size={16} /> Interview Tips
        </p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Think out loud, explain your approach, and don't worry about making mistakes.
        </p>
      </div>
    </div>
  )
}
