import type { ReactNode } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import type { Difficulty } from '../types'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-white/10'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Row({ title, description, control }: { title: string; description: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      {control}
    </div>
  )
}

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const { showToast } = useToast()

  const set = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    updateSettings({ [key]: value } as Partial<typeof settings>)
    showToast('Settings updated.', 'success')
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Settings</h1>
      <p className="text-slate-400 mt-1.5">Manage your appearance, interview defaults, and notifications.</p>

      <div className="space-y-5 mt-6 max-w-2xl">
        <Card>
          <h2 className="font-display font-semibold text-white mb-1">Appearance</h2>
          <div className="divide-y divide-card-border">
            <Row
              title="Dark Mode"
              description="Use the dark, purple-accented theme across the app."
              control={<Toggle checked={settings.darkMode} onChange={(v) => set('darkMode', v)} />}
            />
            <Row
              title="Compact Mode"
              description="Reduce spacing to fit more content on screen."
              control={<Toggle checked={settings.compactMode} onChange={(v) => set('compactMode', v)} />}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-white mb-1">Interview Preferences</h2>
          <div className="divide-y divide-card-border">
            <Row
              title="Default Difficulty"
              description="Used to pre-fill new interview setup."
              control={
                <div className="flex gap-1.5">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => set('defaultDifficulty', d)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                        settings.defaultDifficulty === d
                          ? 'border-primary bg-primary/20 text-primary-light'
                          : 'border-card-border bg-white/5 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
            />
            <Row
              title="Default Number of Questions"
              description="Applied automatically on the New Interview page."
              control={
                <div className="flex gap-1.5">
                  {[8, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => set('defaultQuestionCount', n)}
                      className={`h-9 w-9 rounded-lg text-xs font-medium border transition-all ${
                        settings.defaultQuestionCount === n
                          ? 'border-primary bg-primary/20 text-primary-light'
                          : 'border-card-border bg-white/5 text-slate-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              }
            />
            <Row
              title="Enable Adaptive Questions"
              description="Let follow-up questions be generated from your answers by default."
              control={<Toggle checked={settings.adaptiveQuestions} onChange={(v) => set('adaptiveQuestions', v)} />}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-white mb-1">Notifications</h2>
          <div className="divide-y divide-card-border">
            <Row
              title="Interview Reminders"
              description="Get nudged to keep up your practice streak."
              control={<Toggle checked={settings.interviewReminders} onChange={(v) => set('interviewReminders', v)} />}
            />
            <Row
              title="Weekly Progress"
              description="A weekly summary of your scores and topics covered."
              control={<Toggle checked={settings.weeklyProgress} onChange={(v) => set('weeklyProgress', v)} />}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
