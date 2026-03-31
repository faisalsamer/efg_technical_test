'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  timerStartedAt: string
  timeLimitMinutes: number
  onExpired?: () => void
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

  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60
  const formatNum = (n: number) => n.toString().padStart(2, '0')
  const totalSeconds = timeLimitMinutes * 60
  const progress = expired ? 0 : (remainingSeconds / totalSeconds) * 100

  const color = expired ? 'red' : urgent ? 'amber' : 'indigo'
  const colorMap = {
    red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500', glow: 'glow-red', dot: 'bg-red-400' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500', glow: 'glow-amber', dot: 'bg-amber-400' },
    indigo: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400', bar: 'bg-indigo-500', glow: 'glow-indigo', dot: 'bg-indigo-400' },
  }
  const c = colorMap[color]

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} ${c.glow} p-6`}>
      <div className="flex flex-col items-center space-y-4">
        <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${c.text}`}>
          {!expired && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${urgent ? 'animate-pulse' : ''}`} />}
          {expired ? 'Time Expired' : 'Time Remaining'}
        </div>

        <div className="flex items-baseline gap-1">
          {[formatNum(hours), formatNum(minutes), formatNum(seconds)].map((val, i) => (
            <div key={i} className="flex items-baseline">
              {i > 0 && <span className="text-slate-600 text-3xl font-light mx-1">:</span>}
              <span className={`text-5xl font-mono font-bold tabular-nums ${expired ? 'text-red-400/80' : urgent ? 'text-amber-300' : 'text-slate-100'}`}>
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
      </div>
    </div>
  )
}
