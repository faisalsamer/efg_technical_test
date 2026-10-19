'use client'

import { deleteCandidate } from '@/actions/candidates'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteCandidateButton({ candidateId, redirectTo }: { candidateId: string; redirectTo?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this candidate and their submission? This cannot be undone.')) return
    setPending(true)
    const result = await deleteCandidate(candidateId)
    if (result?.success) {
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } else {
      alert(result?.error ?? 'Failed to delete candidate.')
    }
    setPending(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending} className="text-xs">
      {pending ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
