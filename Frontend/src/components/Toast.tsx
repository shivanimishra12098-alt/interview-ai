import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import type { ToastMessage } from '../types'

interface ToastStackProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const ICONS: Record<ToastMessage['type'], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const COLORS: Record<ToastMessage['type'], string> = {
  success: 'text-green-400 border-green-500/30',
  error: 'text-red-400 border-red-500/30',
  info: 'text-blue-400 border-blue-500/30',
}

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(90vw,360px)]">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type]
        return (
          <div
            key={toast.id}
            role="status"
            className={`glass-card flex items-start gap-3 p-3.5 pr-2.5 shadow-card animate-slideIn border ${COLORS[toast.type]}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
