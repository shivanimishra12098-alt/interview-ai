import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-light">
        <Bot size={18} />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-card border border-card-border px-4 py-3.5 flex items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1">AI is typing</span>
        <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-blink1" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-blink1" style={{ animationDelay: '160ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-blink1" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}
