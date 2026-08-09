import { useRef, type KeyboardEvent } from 'react'
import { Paperclip, Send } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ value, onChange, onSend, disabled, placeholder = 'Type your answer...' }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSend()
    }
  }

  return (
    <div className="flex items-end gap-2 sm:gap-3 rounded-2xl border border-card-border bg-card p-2.5 sm:p-3 focus-within:border-primary/50 transition-colors">
      <button
        type="button"
        aria-label="Attach file"
        className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Paperclip size={18} />
      </button>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent text-sm sm:text-[15px] text-slate-100 placeholder:text-slate-500 outline-none py-2 max-h-32 disabled:opacity-50"
        style={{ minHeight: '2.25rem' }}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send answer"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-glow-sm transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <Send size={17} />
      </button>
    </div>
  )
}
