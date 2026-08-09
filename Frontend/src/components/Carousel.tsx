import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  glowColor: string
  dotColor: string
}

type CarouselProps = {
  slides: Slide[]
}

export function Carousel({ slides }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(matcher.matches)
    update()
    matcher.addEventListener('change', update)
    return () => matcher.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 4000)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [activeIndex, isPaused, prefersReducedMotion, slides.length])

  const goToSlide = (index: number) => {
    setActiveIndex(index)
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
  }

  const handlePrev = () => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    goToSlide((activeIndex + 1) % slides.length)
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return
    }
    const endX = event.changedTouches[0]?.clientX ?? null
    if (endX === null) {
      touchStartX.current = null
      return
    }

    const deltaX = endX - touchStartX.current
    if (Math.abs(deltaX) < 50) {
      touchStartX.current = null
      return
    }

    if (deltaX > 0) {
      handlePrev()
    } else {
      handleNext()
    }
    touchStartX.current = null
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePrev()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNext()
    }
  }

  const slide = slides[activeIndex]
  const transitionDuration = prefersReducedMotion ? 'duration-0' : 'duration-500'

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Interview feature highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden rounded-[2rem] border border-card-border bg-bg-deep/90 p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-4 h-56 rounded-[2rem] blur-3xl opacity-70"
        style={{ backgroundColor: slide.glowColor }}
      />

      <div className={`relative z-10 transition-all ${transitionDuration} ${prefersReducedMotion ? '' : 'animate-fadeIn'}`} aria-live="polite">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4">
            <span
              className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 ${slide.iconBg} ${slide.iconColor}`}
            >
              <slide.icon size={28} />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
                Feature highlight
              </p>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold text-white mt-2 leading-tight">
                {slide.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={handlePrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={handleNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/85 p-8 shadow-[inset_0_0_200px_rgba(255,255,255,0.02)]">
          <p className="text-base leading-8 text-slate-300">{slide.description}</p>
          <p className="sr-only">Slide {activeIndex + 1} of {slides.length}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Go to slide ${index + 1}: ${item.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => goToSlide(index)}
            className="h-3.5 w-3.5 rounded-full border border-white/10 transition"
            style={{ backgroundColor: index === activeIndex ? item.dotColor : 'transparent' }}
          />
        ))}
      </div>
    </div>
  )
}
