import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NewInterview from './pages/NewInterview'
import LiveInterview from './pages/LiveInterview'
import InterviewResult from './pages/InterviewResult'
import History from './pages/History'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import CohortDay from './pages/CohortDay'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Candidates from './pages/Candidates'
import CandidateProfile from './pages/CandidateProfile'
import { SettingsProvider } from './context/SettingsContext'
import { InterviewProvider } from './context/InterviewContext'
import { ToastProvider } from './context/ToastContext'
import { CandidateProvider } from './context/CandidateContext'

export default function App() {
  return (
    <SettingsProvider>
      <CandidateProvider>
      <ToastProvider>
        <InterviewProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview/new" element={<NewInterview />} />
            <Route path="/interview/:id/result" element={<InterviewResult />} />
            <Route path="/interview/:id" element={<LiveInterview />} />
            <Route path="/history" element={<History />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cohort/day/:day" element={<CohortDay />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:candidateId" element={<CandidateProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </InterviewProvider>
      </ToastProvider>
      </CandidateProvider>
    </SettingsProvider>
  )
}
 