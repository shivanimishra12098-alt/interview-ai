import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, Brain, CheckCircle2, GraduationCap, Menu, Sparkles, Target, Trophy, Users, X, Zap, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Carousel } from '../components/Carousel'

const EXPECTATIONS = [
  {
    title: 'Minimum 8 questions',
    subtitle: 'Structured yet flexible interview',
  },
  {
    title: 'Adaptive interview flow',
    subtitle: 'Questions adapt to your answers',
  },
  {
    title: 'Multiple curriculum topics',
    subtitle: 'Covers a wide range of subjects',
  },
  {
    title: 'Personalized follow-up questions',
    subtitle: 'Go deeper into your responses',
  },
  {
    title: 'AI feedback at the end',
    subtitle: 'Detailed insights & improvement tips',
  },
  {
    title: 'Strengths, gaps & next steps',
    subtitle: 'Know where you stand and grow',
  },
]

const STATS = [
  { label: 'Interviews Conducted', value: '10K+', icon: Users },
  { label: 'Students Improved', value: '5K+', icon: GraduationCap },
  { label: 'Satisfaction Rate', value: '98%', icon: ThumbsUp },
  { label: 'Top Rated', value: 'By Learners', icon: Trophy },
  { label: 'AI-Powered', value: 'Adaptive Learning', icon: Zap },
]

const FEATURE_SLIDES = [
  {
    title: 'Adaptive Questioning',
    description: 'Every follow-up is generated from your last answer, not a fixed script.',
    icon: Sparkles,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-300',
    glowColor: 'rgba(139,92,246,0.18)',
    dotColor: '#a855f7',
  },
  {
    title: 'Curriculum-Aware',
    description: 'Pulls from DSA, system design, databases, networks, AI/ML, and more.',
    icon: GraduationCap,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-300',
    glowColor: 'rgba(59,130,246,0.18)',
    dotColor: '#38bdf8',
  },
  {
    title: 'Real-Time Evaluation',
    description: 'Your answers are evaluated for correctness, depth, and understanding.',
    icon: Brain,
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-300',
    glowColor: 'rgba(34,211,238,0.18)',
    dotColor: '#22d3ee',
  },
  {
    title: 'Actionable Feedback',
    description: 'Walk away with concrete strengths, knowledge gaps, and a personalized next-steps plan.',
    icon: Target,
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-300',
    glowColor: 'rgba(251,146,60,0.18)',
    dotColor: '#fb923c',
  },
]

const STEPS = [
  { n: '01', title: 'Configure', description: 'Pick an interview type, difficulty, and topics.' },
  { n: '02', title: 'Converse', description: 'Answer adaptive questions in a live chat session.' },
  { n: '03', title: 'Improve', description: 'Get a personalized report with next steps.' },
]


export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollToGuide = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-x-hidden">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-drift" />
        <div
          className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-secondary/15 blur-[130px] animate-drift"
          style={{ animationDelay: '3s' }}
        />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Nav */}
      <header className="relative sticky top-0 z-40 border-b border-card-border/60 bg-bg-deep/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow-sm">
              <Bot size={18} />
            </span>
            <span className="font-display font-semibold text-white">AI Interviewer</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => navigate('/candidates')} className="hover:text-white transition-colors">Candidates</button>
            <a href="/resources" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); navigate('/resources') }}>Resources</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-medium text-white shadow-glow-sm hover:brightness-110 transition-all"
            >
              Start Interview <ArrowRight size={15} />
            </button>
          </div>

          <button className="md:hidden text-slate-300" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-card-border bg-bg-deep px-4 py-4 space-y-3 animate-fadeIn">
            <button onClick={() => { setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} className="block text-sm text-slate-300">Features</button>
            <button onClick={() => { setMenuOpen(false); navigate('/candidates') }} className="block text-sm text-slate-300">Candidates</button>
            <button onClick={() => { setMenuOpen(false); navigate('/resources') }} className="block text-sm text-slate-300">Resources</button>
            <button onClick={() => { setMenuOpen(false); navigate('/dashboard') }} className="block text-sm text-slate-300">Sign In</button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/interview/new') }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-medium text-white"
            >
              Start Interview <ArrowRight size={15} />
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10 grid lg:grid-cols-2 gap-14 items-center">
        <div className="animate-fadeInUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary-light mb-6">
            <Sparkles size={13} /> Adaptive AI Interviewer
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] text-white">
            Practice Smarter.
            <br />
            Interview Better.
            <br />
            <span className="text-gradient">Get Hired.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
            An AI interviewer that adapts to you. Based on your curriculum, strengths, and your growth — to bring
            out the best in you.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3.5 text-sm font-medium text-white shadow-glow hover:brightness-110 transition-all"
            >
              Start Interview <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate('/candidates')}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border px-6 py-3.5 text-sm font-medium text-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              View Candidate Profiles
            </button>
          </div>
        </div>

        <div className="animate-fadeInUp" style={{ animationDelay: '120ms' }}>
          <div className="glass-card p-6 sm:p-7 shadow-card relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
              <div>
                <h3 className="font-display font-semibold text-white text-lg">What to expect</h3>
                <div className="mt-5 space-y-4">
                  {EXPECTATIONS.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-primary-light shadow-glow-sm">
                        <CheckCircle2 size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/25 to-transparent" />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-center gap-5">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-slate-900/90 border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.24)]">
                    <div className="absolute -left-6 top-6 h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                      <Sparkles size={18} />
                    </div>
                    <div className="absolute -bottom-6 right-6 h-14 w-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                      <Brain size={18} />
                    </div>
                    <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary shadow-glow-sm">
                      <Bot size={44} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-light" />
                      AI Assistant
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      An intelligent interviewer that asks follow-ups, gives feedback, and keeps the session engaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 pt-6 border-t border-card-border relative">
              <p className="text-xs text-slate-500 mb-3">Interview progress</p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => (
                  <div key={n} className="flex items-center shrink-0">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                        i === 0
                          ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-glow-sm'
                          : 'bg-white/5 text-slate-400 border border-card-border'
                      }`}
                    >
                      {n}
                    </span>
                    {i < 7 && <span className="w-3 h-px bg-card-border" />}
                  </div>
                ))}
                <span className="w-3 h-px bg-card-border shrink-0" />
                <span className="shrink-0 text-[11px] font-medium text-primary-light border border-primary/30 bg-primary/10 rounded-full px-2.5 py-1.5">
                  22+
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="glass-card p-5 border border-white/10 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-primary-light">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-xl font-semibold text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white text-center">
          Built to feel like a real interviewer
        </h2>
        <div className="mt-12 mx-auto max-w-4xl">
          <Carousel slides={FEATURE_SLIDES} />
        </div>
      </section>

      {/* How it works / guide */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="glass-card p-8 sm:p-12">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white text-center">How it works</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center sm:text-left">
                <span className="font-display text-3xl font-bold text-primary/40">{step.n}</span>
                <h3 className="font-display font-semibold text-white mt-2">{step.title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3.5 text-sm font-medium text-white shadow-glow hover:brightness-110 transition-all"
            >
              Start your first interview <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-card-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} AI Interviewer. Built for practice, not surveillance.</span>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/resources')} className="hover:text-slate-300 transition-colors">Resources</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-300 transition-colors">Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
