'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { EyeOff, Timer } from 'lucide-react'

interface CountdownTimerProps {
  timerStartedAt: string
  timeLimitMinutes: number
  onExpired?: () => void
}

// Whether the candidate hid the floating timer, remembered per browser.
// Falls back to memory when storage is unavailable (private mode, blocked site data).
const FLOATING_HIDDEN_KEY = 'floating-timer-hidden'
let floatingHiddenFallback = false

function subscribeFloatingHidden(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(FLOATING_HIDDEN_KEY, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(FLOATING_HIDDEN_KEY, callback)
  }
}

function getFloatingHidden() {
  try {
    return localStorage.getItem(FLOATING_HIDDEN_KEY) === '1'
  } catch {
    return floatingHiddenFallback
  }
}

function setFloatingHidden(hidden: boolean) {
  floatingHiddenFallback = hidden
  try {
    localStorage.setItem(FLOATING_HIDDEN_KEY, hidden ? '1' : '0')
  } catch {}
  window.dispatchEvent(new Event(FLOATING_HIDDEN_KEY))
}

export function CountdownTimer({ timerStartedAt, timeLimitMinutes, onExpired }: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const startedAt = new Date(timerStartedAt).getTime()
    const limitMs = timeLimitMinutes * 60 * 1000
    const elapsed = Date.now() - startedAt
    return Math.max(0, Math.floor((limitMs - elapsed) / 1000))
  })

  const expired = remainingSeconds <= 0
  const urgent = remainingSeconds <= 300 && !expired

  useEffect(() => {
    if (expired) {
      onExpired?.()
      return
    }
    const interval = setInterval(() => {
      const startedAt = new Date(timerStartedAt).getTime()
      const limitMs = timeLimitMinutes * 60 * 1000
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000))
      setRemainingSeconds(remaining)
      if (remaining <= 0) {
        onExpired?.()
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [timerStartedAt, timeLimitMinutes, expired, onExpired])

  // Show the floating timer once the main card has scrolled under the sticky header
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardInView, setCardInView] = useState(true)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setCardInView(entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const floatingHidden = useSyncExternalStore(subscribeFloatingHidden, getFloatingHidden, () => false)

  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60
  const formatNum = (n: number) => n.toString().padStart(2, '0')
  const totalSeconds = timeLimitMinutes * 60
  const progress = expired ? 0 : (remainingSeconds / totalSeconds) * 100
  const timeText = `${formatNum(hours)}:${formatNum(minutes)}:${formatNum(seconds)}`

  const color = expired ? 'red' : urgent ? 'orange' : 'gold'
  const colorMap = {
    red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500', glow: 'glow-red', dot: 'bg-red-400' },
    orange: { bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400', bar: 'bg-orange-500', glow: 'glow-orange', dot: 'bg-orange-400' },
    gold: { bg: 'bg-gold-500/5', border: 'border-gold-500/20', text: 'text-gold-400', bar: 'bg-gold-500', glow: 'glow-gold', dot: 'bg-gold-400' },
  }
  const c = colorMap[color]
  const digitColor = expired ? 'text-red-400/80' : urgent ? 'text-orange-300' : 'text-slate-100'

  const floating = !cardInView
  const floatingShown = floating && !floatingHidden
  const collapsedShown = floating && floatingHidden

  return (
    <>
      <div ref={cardRef} className={`rounded-2xl border ${c.border} ${c.bg} ${c.glow} p-6`}>
        <div className="flex flex-col items-center space-y-4">
          <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${c.text}`}>
            {!expired && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${urgent ? 'animate-pulse' : ''}`} />}
            {expired ? 'Time Expired' : 'Time Remaining'}
          </div>

          <div className="flex items-baseline gap-1">
            {[formatNum(hours), formatNum(minutes), formatNum(seconds)].map((val, i) => (
              <div key={i} className="flex items-baseline">
                {i > 0 && <span className="text-slate-600 text-3xl font-light mx-1">:</span>}
                <span className={`text-5xl font-mono font-bold tabular-nums ${digitColor}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full max-w-xs">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${c.bar}`} style={{ width: `${progress}%` }} />
            </div>
          </div>

          {expired && <p className="text-red-400/80 text-sm">You can no longer submit your work.</p>}

          <button
            type="button"
            onClick={() => setFloatingHidden(!floatingHidden)}
            className="cursor-pointer text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-gold-400 hover:underline"
          >
            {floatingHidden ? 'Show floating timer while scrolling' : 'Hide floating timer while scrolling'}
          </button>
        </div>
      </div>

      {/* Floating timer, shown while the main card is scrolled out of view */}
      <div
        aria-hidden={!floatingShown}
        inert={!floatingShown}
        className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ease-out ${floatingShown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <div className={`flex items-center gap-3 rounded-2xl border ${c.border} bg-navy-900/90 py-2.5 pl-4 pr-2 shadow-lg shadow-black/40 backdrop-blur-xl`}>
          <div className="min-w-[7.5rem]">
            <div className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider ${c.text}`}>
              {!expired && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${urgent ? 'animate-pulse' : ''}`} />}
              {expired ? 'Time Expired' : 'Time Remaining'}
            </div>
            <p className={`font-mono text-xl font-bold tabular-nums leading-tight ${digitColor}`}>{timeText}</p>
            <div className="mt-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${c.bar}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFloatingHidden(true)}
            aria-label="Hide floating timer"
            title="Hide floating timer"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-gold-400"
          >
            <EyeOff className="size-4" />
          </button>
        </div>
      </div>

      {/* Collapsed floating timer: a small button to bring it back */}
      <button
        type="button"
        onClick={() => setFloatingHidden(false)}
        aria-hidden={!collapsedShown}
        tabIndex={collapsedShown ? 0 : -1}
        aria-label={`Show floating timer, ${expired ? 'time expired' : `${timeText} remaining`}`}
        title="Show floating timer"
        className={`fixed bottom-4 right-4 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border ${c.border} bg-navy-900/90 ${c.text} shadow-lg shadow-black/40 backdrop-blur-xl transition-all duration-300 ease-out hover:border-gold-500/50 ${urgent ? 'animate-pulse' : ''} ${collapsedShown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <Timer className="size-5" />
      </button>
    </>
  )
}
