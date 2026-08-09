import { useNavigate } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary-light mx-auto mb-6">
          <Compass size={28} />
        </span>
        <h1 className="font-display text-3xl font-semibold text-white">404</h1>
        <p className="text-slate-400 mt-2">This page doesn't exist, or it may have moved.</p>
        <Button className="mt-7" icon={<Home size={16} />} iconPosition="left" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
