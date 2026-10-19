'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import { loginCandidate, type CandidateLoginState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BrandLogo } from '@/components/brand-logo'
import { StartAssessmentDialog } from '@/components/start-assessment-dialog'

export default function LoginPage() {
  // Credentials from a first login, kept so confirming does not require re-typing them
  const credentials = useRef<FormData | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const [state, formAction, pending] = useActionState(async (
    prev: CandidateLoginState,
    formData: FormData
  ) => {
    const result = await loginCandidate(prev, formData)
    if (result?.confirm) {
      credentials.current = formData
      setAttempt((n) => n + 1)
    }
    setConfirmOpen(!!result?.confirm)
    return result
  }, null)

  function startAssessment() {
    if (!credentials.current) return
    const formData = new FormData()
    credentials.current.forEach((value, key) => formData.append(key, value))
    formData.set('confirm_start', '1')
    startTransition(() => formAction(formData))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 border-r-4 border-gold-500 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <BrandLogo size={40} />
            <span className="text-xl font-bold uppercase tracking-wide">Ezyfusion Group</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold leading-tight">Technical Assessment<br /><span className="text-gold-400">Portal</span></h2>
          <div className="w-14 h-[3px] bg-gold-500" />
          <p className="text-slate-300 leading-relaxed max-w-sm">Complete your timed assessment. Build your project externally and submit your work before time runs out.</p>
          <div className="flex gap-6 text-sm text-gold-300">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Timed
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Secure
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Edit until time&apos;s up
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-500">Ezyfusion Group (EFG) Sdn. Bhd.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <BrandLogo size={32} />
              <span className="text-lg font-bold uppercase tracking-wide">Ezyfusion Group</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to access your assessment</p>
          </div>

          {/* Guidelines */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <h3 className="font-medium text-amber-400 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Before you sign in
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span>On first sign in we ask you to confirm. Your <strong className="text-slate-300">timer starts once you start the assessment</strong> and cannot be paused.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span>Timer is <strong className="text-slate-300">server-based</strong> - closing the browser won&apos;t stop it.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span>You can <strong className="text-slate-300">edit your submission</strong> until your time runs out. After that it is final.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span><strong className="text-slate-300">Prepare your environment</strong> before signing in.</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" placeholder="Enter your password" required />
            </div>

            <Button type="submit" className="w-full h-10 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold" disabled={pending}>
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Signing in...
                </span>
              ) : 'Start/Continue Assessment'}
            </Button>
          </form>

          {state?.confirm && (
            <StartAssessmentDialog
              key={attempt}
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              name={state.confirm.name}
              timeLimitMinutes={state.confirm.timeLimitMinutes}
              expiryAt={state.confirm.expiryAt}
              pending={pending}
              onConfirm={startAssessment}
            />
          )}

          <p className="text-center text-xs text-muted-foreground">
            By signing in you acknowledge the guidelines above.
          </p>
        </div>
      </div>
    </div>
  )
}
