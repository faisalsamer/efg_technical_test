'use client'

import { useActionState, useState } from 'react'
import { addCandidate } from '@/actions/candidates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreatedCandidate {
  name: string
  email: string
  password: string
  timeLimitMinutes: number
  expiryAt: string
}

export function AddCandidateDialog() {
  const [open, setOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [created, setCreated] = useState<CreatedCandidate | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  const [state, formAction, pending] = useActionState(async (
    prev: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const timeLimitMinutes = formData.get('time_limit_minutes') as string
    const expiryAt = formData.get('expiry_at') as string

    // Append the admin's timezone so the server can interpret the datetime correctly
    formData.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)

    const result = await addCandidate(prev, formData)
    if (result?.success) {
      setOpen(false)
      const c: CreatedCandidate = { name, email, password, timeLimitMinutes: parseInt(timeLimitMinutes), expiryAt }
      setCreated(c)

      const loginUrl = `${window.location.origin}/login`
      const expiry = new Date(expiryAt).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)'
      setEmailSubject(`Technical Assessment - ${name}`)
      setEmailBody(`Hi ${name},

You have been invited to complete a technical assessment.

Here are your login credentials:

Login URL: ${loginUrl}
Email: ${email}
Password: ${password}

Time Limit: ${timeLimitMinutes} minutes
Account Expires: ${expiry}

IMPORTANT:
- Your timer starts as soon as you log in for the first time.
- The timer cannot be paused or reset.
- You can only submit once, so make sure your work is complete before submitting.
- Your account will expire on ${expiry}, after which you will no longer be able to access the test.

Good luck!

Best regards,
Ezyfusion Group`)
      setEmailOpen(true)
    }
    return result
  }, null)

  const handleSendEmail = () => {
    if (!created) return
    const mailto = `mailto:${created.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailto, '_blank')
    setEmailOpen(false)
    setCreated(null)
  }

  return (
    <>
      {/* Add Candidate Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-500 text-white" />}>
          + Add Candidate
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="text" required className="font-mono" />
              <p className="text-xs text-muted-foreground">This will be shared with the candidate.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
              <Input id="time_limit_minutes" name="time_limit_minutes" type="number" defaultValue={90} min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_at">Account Expiry Date</Label>
              <Input id="expiry_at" name="expiry_at" type="datetime-local" required />
              <p className="text-xs text-muted-foreground">Candidate cannot access the test after this date.</p>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={pending}>
              {pending ? 'Adding...' : 'Add Candidate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Credentials to Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input value={created?.email || ''} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Message</Label>
              <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={10} className="font-mono text-xs leading-relaxed" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendEmail} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                Open in Email Client
              </Button>
              <Button variant="outline" onClick={() => { setEmailOpen(false); setCreated(null) }}>
                Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
