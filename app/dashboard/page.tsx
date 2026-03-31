import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { getSubmission } from '@/actions/submissions'
import { redirect } from 'next/navigation'
import { CountdownTimer } from '@/components/countdown-timer'
import { SubmissionForm } from '@/components/submission-form'
import { TestRequirements } from '@/components/test-requirements'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', session.candidateId)
    .single()

  if (!candidate) redirect('/login')

  const submission = await getSubmission(candidate.id)

  let expired = false
  if (candidate.timer_started_at) {
    const startedAt = new Date(candidate.timer_started_at).getTime()
    const limitMs = candidate.time_limit_minutes * 60 * 1000
    expired = Date.now() - startedAt > limitMs
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-[#0d1220]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm leading-tight">{candidate.name}</p>
              <p className="text-xs text-muted-foreground">{candidate.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {candidate.timer_started_at && (
          <CountdownTimer
            timerStartedAt={candidate.timer_started_at}
            timeLimitMinutes={candidate.time_limit_minutes}
          />
        )}

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
            </div>
            <h2 className="text-lg font-semibold">Test Requirements</h2>
          </div>
          <TestRequirements />
        </div>

        <SubmissionForm expired={expired} existingSubmission={submission} />
      </main>
    </div>
  )
}
