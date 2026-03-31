'use client'

import { deleteCandidate } from '@/actions/candidates'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteCandidateButton({ candidateId }: { candidateId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this candidate? This cannot be undone.')) return
    setPending(true)
    const result = await deleteCandidate(candidateId)
    if (result?.success) router.push('/admin/dashboard')
    setPending(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending} className="text-xs">
      {pending ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
