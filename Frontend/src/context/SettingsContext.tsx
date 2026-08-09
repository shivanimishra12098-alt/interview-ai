import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { AppSettings } from '../types'

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  compactMode: false,
  defaultDifficulty: 'Intermediate',
  defaultQuestionCount: 8,
  adaptiveQuestions: true,
  interviewReminders: true,
  weeklyProgress: false,
}

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('ai-interviewer:settings', DEFAULT_SETTINGS)

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
    document.documentElement.classList.toggle('compact', settings.compactMode)
  }, [settings.darkMode, settings.compactMode])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
