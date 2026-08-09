import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
  padded?: boolean
}

export default function Card({ children, hoverable = false, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`glass-card ${padded ? 'p-5 sm:p-6' : ''} ${
        hoverable ? 'transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
