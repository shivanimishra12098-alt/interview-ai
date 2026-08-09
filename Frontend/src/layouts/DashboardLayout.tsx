import { useState, type ReactNode } from 'react'
import { Menu, Bot } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile topbar */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3.5 border-b border-card-border bg-bg-deep/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
            <Bot size={16} />
          </span>
          <span className="font-display font-semibold text-white text-sm">AI Interviewer</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-slate-300 hover:text-white p-1.5"
        >
          <Menu size={22} />
        </button>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-fade">{children}</div>
      </main>
    </div>
  )
}
