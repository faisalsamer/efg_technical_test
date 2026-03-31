'use client'

import { useState } from 'react'
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

interface SendEmailDialogProps {
  candidateName: string
  candidateEmail: string
  candidatePassword?: string
  timeLimitMinutes: number
  expiryAt: string
  trigger?: React.ReactNode
}

export function SendEmailDialog({
  candidateName,
  candidateEmail,
  candidatePassword,
  timeLimitMinutes,
  expiryAt,
  trigger,
}: SendEmailDialogProps) {
  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'
  const expiry = new Date(expiryAt).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)'

  const defaultSubject = `Upcoming Technical Assessment - Full-Stack Developer`
  const defaultBody = `Hi ${candidateName},

Thank you for your interest in the Full-Stack Developer role at EzyFusion Group.

You have been invited to complete a timed technical assessment. Below is what to expect and your login credentials.

--- WHAT TO EXPECT ---

You will be building a Feedback Board - a full-stack CRUD application within a ${timeLimitMinutes}-minute time limit.

Tech stack:
- Next.js (App Router) with TypeScript
- Supabase (PostgreSQL, Auth, Storage)
- Prisma ORM
- shadcn/ui + Tailwind CSS

You will be evaluated on:
- Database design and Row Level Security (RLS)
- Authentication and authorization
- Full CRUD functionality
- UI/UX quality
- File handling and storage

--- YOUR CREDENTIALS ---

Login URL: ${loginUrl}
Email: ${candidateEmail}
Password: ${candidatePassword || ''}

Time Limit: ${timeLimitMinutes} minutes
Account Expires: ${expiry}

--- IMPORTANT ---

- Your timer starts as soon as you log in for the first time.
- The timer cannot be paused or reset.
- You can only submit once, so make sure your work is complete before submitting.
- Your account will expire on ${expiry}, after which you will no longer be able to access the test.
- Please make sure your development environment is set up with the above stack beforehand so you can make the most of your time.

Candidates who pass will proceed directly to the interview stage.

Good luck!

Best regards,
EzyFusion Group`

  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)

  const handleSend = () => {
    const mailto = `mailto:${candidateEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
  }

  return (
    <Dialog>
      <DialogTrigger render={
        trigger ? undefined : <Button variant="outline" size="sm" className="text-xs" />
      }>
        {trigger || (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Send Email
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Credentials Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input value={candidateEmail} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Message</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="font-mono text-xs leading-relaxed" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSend} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Open in Email Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
