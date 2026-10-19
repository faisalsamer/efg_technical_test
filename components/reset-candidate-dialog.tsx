'use client'

import { useActionState, useState } from 'react'
import { resetCandidate } from '@/actions/candidates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ResetCandidateDialog({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const [open, setOpen] = useState(false)

  const [state, formAction, pending] = useActionState(async (
    prev: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => {
    // Send the admin's timezone so the server interprets the new expiry date correctly
    formData.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    const result = await resetCandidate(prev, formData)
    if (result?.success) setOpen(false)
    return result
  }, null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs" />}>
        Reset Exam
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset exam for {candidateName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            This clears the timer and deletes their current submission. Their timer starts again when they next sign in and confirm they are ready. The password stays the same.
          </p>
          <input type="hidden" name="candidate_id" value={candidateId} />
          <div className="space-y-2">
            <Label htmlFor={`reset_expiry_${candidateId}`}>New Account Expiry Date</Label>
            <Input id={`reset_expiry_${candidateId}`} name="expiry_at" type="datetime-local" required />
            <p className="text-xs text-muted-foreground">Candidate cannot access the test after this date.</p>
          </div>
          <Button type="submit" className="w-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold" disabled={pending}>
            {pending ? 'Resetting...' : 'Reset Exam'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
