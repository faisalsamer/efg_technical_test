'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SendEmailDialog } from '@/components/send-email-dialog'

interface Candidate {
  id: string
  name: string
  email: string
  password: string
  time_limit_minutes: number
  timer_started_at: string | null
  expiry_at: string
  created_at: string
}

interface Submission { candidate_id: string }

interface CandidateTableProps {
  candidates: Candidate[]
  submissions: Submission[]
}

function getTimerStatus(c: Candidate) {
  if (!c.timer_started_at) return { label: 'Not Started', dot: 'bg-slate-600', text: 'text-slate-500' }
  const elapsed = Date.now() - new Date(c.timer_started_at).getTime()
  if (elapsed > c.time_limit_minutes * 60 * 1000) return { label: 'Expired', dot: 'bg-red-400', text: 'text-red-400' }
  return { label: 'In Progress', dot: 'bg-indigo-400 animate-pulse', text: 'text-indigo-400' }
}

export function CandidateTable({ candidates, submissions }: CandidateTableProps) {
  const submittedIds = new Set(submissions.map((s) => s.candidate_id))

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Name</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Email</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Time</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Timer</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Expiry</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Submission</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-600 py-16">
                <p className="text-sm">No candidates yet</p>
                <p className="text-xs mt-1">Add a candidate to get started</p>
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((candidate) => {
              const timer = getTimerStatus(candidate)
              const hasSubmitted = submittedIds.has(candidate.id)
              const accountExpired = new Date(candidate.expiry_at).getTime() < Date.now()
              return (
                <TableRow key={candidate.id} className="border-border/50 hover:bg-secondary/50 transition-colors">
                  <TableCell>
                    <Link href={`/admin/candidates/${candidate.id}`} className="font-medium hover:text-indigo-400 transition-colors">
                      {candidate.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{candidate.email}</TableCell>
                  <TableCell className="text-sm font-mono text-slate-400">{candidate.time_limit_minutes}m</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs ${timer.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${timer.dot}`} />
                      {timer.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs ${accountExpired ? 'text-red-400' : 'text-slate-400'}`}>
                      {accountExpired ? 'Expired' : new Date(candidate.expiry_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {hasSubmitted ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Submitted
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SendEmailDialog
                      candidateName={candidate.name}
                      candidateEmail={candidate.email}
                      candidatePassword={candidate.password}
                      timeLimitMinutes={candidate.time_limit_minutes}
                      expiryAt={candidate.expiry_at}
                    />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
