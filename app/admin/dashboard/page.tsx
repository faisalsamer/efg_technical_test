import { getAdminSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getCandidates } from '@/actions/candidates'
import { supabase } from '@/lib/supabase'
import { CandidateTable } from '@/components/candidate-table'
import { AddCandidateDialog } from '@/components/add-candidate-dialog'
import { BrandLogo } from '@/components/brand-logo'
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
      <header className="sticky top-0 z-50 border-b border-border bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={30} />
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
