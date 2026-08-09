import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
 
interface CandidateProfile {
  name: string
  email?: string
}
 
interface CandidateContextValue {
  candidate: CandidateProfile
  setCandidate: (patch: Partial<CandidateProfile>) => void
}
 
const DEFAULT_CANDIDATE: CandidateProfile = { name: 'Guest Candidate' }
 
const CandidateContext = createContext<CandidateContextValue | undefined>(undefined)
 
export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidateRaw] = useLocalStorage<CandidateProfile>(
    'ai-interviewer:candidate',
    DEFAULT_CANDIDATE,
  )
 
  const setCandidate = (patch: Partial<CandidateProfile>) => {
    setCandidateRaw((prev) => ({ ...prev, ...patch }))
  }
 
  return (
    <CandidateContext.Provider value={{ candidate, setCandidate }}>
      {children}
    </CandidateContext.Provider>
  )
}
 
export function useCandidate() {
  const ctx = useContext(CandidateContext)
  if (!ctx) throw new Error('useCandidate must be used within a CandidateProvider')
  return ctx
}
 