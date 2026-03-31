import { getAdminSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getCandidate } from '@/actions/candidates'
import { getSubmission } from '@/actions/submissions'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { DeleteCandidateButton } from './delete-button'
import { SendEmailDialog } from '@/components/send-email-dialog'

export const dynamic = 'force-dynamic'

function getTimerInfo(c: { timer_started_at: string | null; time_limit_minutes: number }) {
  if (!c.timer_started_at) return { status: 'Not Started', color: 'text-slate-500', remaining: null }
  const remainingMs = c.time_limit_minutes * 60 * 1000 - (Date.now() - new Date(c.timer_started_at).getTime())
  if (remainingMs <= 0) return { status: 'Expired', color: 'text-red-400', remaining: '0:00:00' }
  const s = Math.floor(remainingMs / 1000)
  const fmt = (n: number) => n.toString().padStart(2, '0')
  return { status: 'In Progress', color: 'text-indigo-400', remaining: `${fmt(Math.floor(s / 3600))}:${fmt(Math.floor((s % 3600) / 60))}:${fmt(s % 60)}` }
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin')

  const { id } = await params
  const candidate = await getCandidate(id)
  if (!candidate) redirect('/admin/dashboard')

  const submission = await getSubmission(candidate.id)
  const timer = getTimerInfo(candidate)
  const accountExpired = new Date(candidate.expiry_at).getTime() < Date.now()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-[#0d1220]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back
            </Link>
            <div className="w-px h-4 bg-border" />
            <span className="font-medium text-sm">Candidate Details</span>
          </div>
          <div className="flex items-center gap-2">
            <SendEmailDialog
              candidateName={candidate.name}
              candidateEmail={candidate.email}
              candidatePassword={candidate.password}
              timeLimitMinutes={candidate.time_limit_minutes}
              expiryAt={candidate.expiry_at}
            />
            <DeleteCandidateButton candidateId={candidate.id} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{candidate.name}</h1>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-slate-500">Password</Label>
              <p className="mt-1 font-mono text-sm">{candidate.password}</p>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-slate-500">Time Limit</Label>
              <p className="mt-1 font-mono text-sm">{candidate.time_limit_minutes}m</p>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-slate-500">Timer</Label>
              <p className={`mt-1 text-sm font-medium ${timer.color}`}>
                {timer.status}
                {timer.remaining && <span className="text-muted-foreground font-mono text-xs ml-1.5">({timer.remaining})</span>}
              </p>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-slate-500">Account Expiry</Label>
              <p className={`mt-1 text-sm font-medium ${accountExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                {new Date(candidate.expiry_at).toLocaleString()}
                {accountExpired && <span className="text-xs ml-1">(Expired)</span>}
              </p>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-slate-500">Submission</Label>
              <p className={`mt-1 text-sm font-medium ${submission ? 'text-emerald-400' : 'text-slate-500'}`}>
                {submission ? 'Submitted' : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Submission */}
        {submission ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="font-semibold text-emerald-300">Submission</h3>
              <span className="text-xs text-slate-500 ml-auto">{new Date(submission.submitted_at).toLocaleString()}</span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">GitHub</p>
                <a href={submission.github_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 break-all">{submission.github_url}</a>
              </div>

              {Object.keys(submission.env_variables || {}).length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Environment Variables</p>
                  <div className="font-mono text-xs bg-[#0b0f1a] rounded-xl border border-border p-4 space-y-1 overflow-x-auto">
                    {Object.entries(submission.env_variables as Record<string, string>).map(([k, v]) => (
                      <div key={k}><span className="text-indigo-400">{k}</span><span className="text-slate-600">=</span><span className="text-emerald-400">{v}</span></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">App Email</p>
                  <p className="text-slate-300">{submission.app_email}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">App Password</p>
                  <p className="text-slate-300 font-mono">{submission.app_password}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Summary</p>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{submission.summary}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-12 text-center text-slate-600 text-sm">
            No submission yet
          </div>
        )}
      </main>
    </div>
  )
}
