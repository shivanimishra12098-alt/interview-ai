import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, History, BookOpen, User, Settings, Moon, Sun, Bot, X } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/interview/new', label: 'New Interview', icon: PlusCircle },
  { to: '/history', label: 'Past Interviews', icon: History },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { settings, updateSettings } = useSettings()

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow-sm">
            <Bot size={18} />
          </span>
          <span className="font-display font-semibold text-white text-[15px]">AI Interviewer</span>
        </NavLink>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary-light shadow-[inset_0_0_0_1px_rgba(139,92,246,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-card-border mx-3">
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors mt-2"
        >
          <span className="flex items-center gap-3">
            {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            Dark Mode
          </span>
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${settings.darkMode ? 'bg-primary' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-card-border lg:bg-bg-deep/60 lg:backdrop-blur-xl z-30">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-opacity ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-bg-deep border-r border-card-border transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  )
}
