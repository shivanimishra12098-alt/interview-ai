import { Bot, User } from 'lucide-react'
import type { ChatMessageData } from '../types'

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  const isAI = message.role === 'ai'
  const time = new Date(message.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-start gap-3 animate-slideIn ${isAI ? '' : 'flex-row-reverse'}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isAI ? 'bg-primary/20 text-primary-light' : 'bg-secondary/20 text-secondary-light'
        }`}
      >
        {isAI ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className={`max-w-[80%] sm:max-w-[70%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAI
              ? 'bg-card border border-card-border text-slate-200 rounded-tl-sm'
              : 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-sm shadow-glow-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-slate-500 mt-1 px-1">{time}</span>
      </div>
    </div>
  )
}
