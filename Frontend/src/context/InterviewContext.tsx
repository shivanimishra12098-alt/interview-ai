import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { INTERVIEW_HISTORY } from '../data/mockData'
import type { InterviewConfig, InterviewRecord } from '../types'

interface InterviewContextValue {
  history: InterviewRecord[]
  addRecord: (record: InterviewRecord) => void
  updateRecord: (id: string, patch: Partial<InterviewRecord>) => void
  getRecord: (id: string) => InterviewRecord | undefined
  draftConfig: InterviewConfig | null
  setDraftConfig: (config: InterviewConfig | null) => void
}

const InterviewContext = createContext<InterviewContextValue | undefined>(undefined)

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<InterviewRecord[]>(
    'ai-interviewer:history',
    INTERVIEW_HISTORY,
  )
  const [draftConfig, setDraftConfig] = useLocalStorage<InterviewConfig | null>(
    'ai-interviewer:draft-config',
    null,
  )

  const addRecord = (record: InterviewRecord) => {
    setHistory((prev) => [record, ...prev])
  }

  const updateRecord = (id: string, patch: Partial<InterviewRecord>) => {
    setHistory((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const getRecord = (id: string) => history.find((r) => r.id === id)

  return (
    <InterviewContext.Provider
      value={{ history, addRecord, updateRecord, getRecord, draftConfig, setDraftConfig }}
    >
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterviews() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterviews must be used within an InterviewProvider')
  return ctx
}
