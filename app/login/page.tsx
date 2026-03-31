'use client'

import { useActionState } from 'react'
import { loginCandidate } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginCandidate, null)

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">E</div>
            <span className="text-xl font-bold tracking-tight">EzyFusion</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold leading-tight">Technical Assessment<br />Portal</h2>
          <p className="text-indigo-100 leading-relaxed max-w-sm">Complete your timed assessment. Build your project externally and submit your work before time runs out.</p>
          <div className="flex gap-6 text-sm text-indigo-200">
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
              One submission
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-indigo-300">Ezyfusion Group</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">E</div>
              <span className="text-lg font-bold">EzyFusion</span>
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
                <span>Your <strong className="text-slate-300">timer starts immediately</strong> on first login and cannot be paused.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span>Timer is <strong className="text-slate-300">server-based</strong> - closing the browser won&apos;t stop it.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span>You can only <strong className="text-slate-300">submit once</strong>. Make sure everything is ready.</span>
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
              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>

            <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium" disabled={pending}>
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Signing in...
                </span>
              ) : 'Start Assessment'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By signing in you acknowledge the guidelines above.
          </p>
        </div>
      </div>
    </div>
  )
}
