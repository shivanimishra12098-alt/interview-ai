import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useEffect } from 'react'

export default function CohortDay() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    // Scroll to top when opening a day
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen p-6 bg-bg">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-6 mb-6">
          <h2 className="text-2xl font-display font-semibold text-white">Day {day} — Cohort Lesson</h2>
          <p className="text-slate-400 mt-2">This is a placeholder for the cohort day content. In the real product this would show the lesson, resources, and activities for the day.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={() => navigate('/resources')}>Open Resources</Button>
            <Button variant="outline" onClick={() => navigate('/interview/new')}>Start Practice Interview</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
