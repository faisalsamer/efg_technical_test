import { getAdminSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getCandidates } from '@/actions/candidates'
import { supabase } from '@/lib/supabase'
import { CandidateTable } from '@/components/candidate-table'
import { AddCandidateDialog } from '@/components/add-candidate-dialog'
import { AdminLogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin')

  const candidates = await getCandidates()
  const { data: submissions } = await supabase
    .from('submissions')
    .select('candidate_id')

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-[#0d1220]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <h1 className="font-semibold">Admin Dashboard</h1>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Candidates</h2>
            <p className="text-sm text-muted-foreground">{candidates.length} total</p>
          </div>
          <AddCandidateDialog />
        </div>

        <CandidateTable candidates={candidates} submissions={submissions || []} />
      </main>
    </div>
  )
}
