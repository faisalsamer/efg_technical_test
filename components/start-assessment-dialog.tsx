'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts = []
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`)
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  return parts.join(' ') || '0 minutes'
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d ? `${d}d ` : ''}${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

export function StartAssessmentDialog({
  open,
  onOpenChange,
  name,
  timeLimitMinutes,
  expiryAt,
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  timeLimitMinutes: number
  expiryAt: string
  pending: boolean
  onConfirm: () => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  const expiry = new Date(expiryAt)
  const remainingMs = expiry.getTime() - now
  const accessExpired = remainingMs <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg">Are you ready to start, {name}?</DialogTitle>
          <DialogDescription>
            Your timer starts the moment you confirm. It runs on the server and cannot be paused, even if you close the browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-xs text-muted-foreground">Time to complete</p>
            <p className="mt-1 font-semibold text-gold-400">{formatDuration(timeLimitMinutes)}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-xs text-muted-foreground">Access expires in</p>
            <p className={`mt-1 font-mono font-semibold tabular-nums ${accessExpired ? 'text-red-400' : 'text-gold-400'}`}>
              {accessExpired ? 'Expired' : formatCountdown(remainingMs)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {expiry.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Not prepared yet? Choose <strong className="text-foreground">Not yet</strong> and sign in again whenever you are ready, as long as it is before your access expires.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Not yet
          </Button>
          <Button
            onClick={onConfirm}
            disabled={pending || accessExpired}
            className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold"
          >
            {pending ? 'Starting...' : "Yes, I'm ready - start timer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
