'use client'

import { useActionState, useState } from 'react'
import { createSubmission, updateSubmission } from '@/actions/submissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EnvVariablesInput } from './env-variables-input'

interface EnvVar { key: string; value: string }

interface Submission {
  github_url: string
  env_variables: Record<string, string>
  app_email: string
  app_password: string
  summary: string
  submitted_at: string
}

interface SubmissionFormProps {
  expired: boolean
  existingSubmission: Submission | null
}

const LIMITS = {
  github_url: 200,
  app_email: 100,
  app_password: 100,
  summary: 2000,
}

function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max
  return (
    <span className={`text-[11px] tabular-nums ${over ? 'text-red-400' : 'text-slate-600'}`}>
      {value.length}/{max}
    </span>
  )
}

export function SubmissionForm({ expired, existingSubmission }: SubmissionFormProps) {
  const [editing, setEditing] = useState(false)
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.github_url || '')
  const [appEmail, setAppEmail] = useState(existingSubmission?.app_email || '')
  const [appPassword, setAppPassword] = useState(existingSubmission?.app_password || '')
  const [summary, setSummary] = useState(existingSubmission?.summary || '')
  const [envVars, setEnvVars] = useState<EnvVar[]>(() => {
    if (existingSubmission?.env_variables) {
      return Object.entries(existingSubmission.env_variables).map(([key, value]) => ({ key, value }))
    }
    return []
  })
  const [envError, setEnvError] = useState('')

  const isUpdate = !!existingSubmission && editing

  const wrappedAction = async (
    prev: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => {
    const action = isUpdate ? updateSubmission : createSubmission
    const result = await action(prev, formData)
    if (result?.success && isUpdate) {
      setEditing(false)
    }
    return result
  }

  const [state, formAction, pending] = useActionState(wrappedAction, null)

  // Duplicate env key check
  const getDuplicateKeys = () => {
    const keys = envVars.map(v => v.key.trim()).filter(k => k !== '')
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const k of keys) {
      if (seen.has(k)) dupes.add(k)
      seen.add(k)
    }
    return dupes
  }

  // Read-only submission view
  if (existingSubmission && !editing) {
    const envEntries = Object.entries(existingSubmission.env_variables || {})
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 glow-emerald p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-300">Submission Received</h3>
              <p className="text-xs text-slate-500">{new Date(existingSubmission.submitted_at).toLocaleString()}</p>
            </div>
          </div>
          {!expired && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setEditing(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Edit Submission
            </Button>
          )}
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">GitHub Repository</p>
            <a href={existingSubmission.github_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 break-all">
              {existingSubmission.github_url}
            </a>
          </div>

          {envEntries.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Environment Variables</p>
              <div className="font-mono text-xs bg-[#0b0f1a] rounded-xl border border-border p-4 space-y-1 overflow-x-auto">
                {envEntries.map(([k, v]) => (
                  <div key={k}><span className="text-indigo-400">{k}</span><span className="text-slate-600">=</span><span className="text-emerald-400">{v}</span></div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Supabase Login Email</p>
              <p className="text-slate-300">{existingSubmission.app_email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Supabase Login Password</p>
              <p className="text-slate-300 font-mono">{existingSubmission.app_password}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Summary</p>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{existingSubmission.summary}</p>
          </div>
        </div>
      </div>
    )
  }

  if (expired && !existingSubmission) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 glow-red p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
        <p className="text-red-300 font-semibold">Time&apos;s Up</p>
        <p className="text-slate-500 text-sm">You can no longer submit your work.</p>
      </div>
    )
  }

  const handleSubmit = (formData: FormData) => {
    // Require at least one env variable
    const filledVars = envVars.filter(v => v.key.trim() && v.value.trim())
    if (filledVars.length === 0) {
      setEnvError('At least one environment variable is required.')
      return
    }

    // Check env vars have both key and value
    const incomplete = envVars.filter(v => (v.key.trim() && !v.value.trim()) || (!v.key.trim() && v.value.trim()))
    if (incomplete.length > 0) {
      setEnvError('Each variable must have both a key and a value.')
      return
    }

    // Check duplicate env keys
    const dupes = getDuplicateKeys()
    if (dupes.size > 0) {
      setEnvError(`Duplicate keys: ${[...dupes].join(', ')}`)
      return
    }
    setEnvError('')

    const envObj: Record<string, string> = {}
    for (const v of envVars) {
      if (v.key.trim()) envObj[v.key.trim()] = v.value.trim()
    }
    formData.set('env_variables', JSON.stringify(envObj))
    formAction(formData)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
          <h2 className="text-lg font-semibold">{isUpdate ? 'Edit Submission' : 'Submit Your Work'}</h2>
        </div>
        {isUpdate && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>

      <form action={handleSubmit} className="space-y-5">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {state?.success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
            {isUpdate ? 'Submission updated!' : 'Submission received successfully!'}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="github_url">GitHub Repository URL</Label>
            <CharCount value={githubUrl} max={LIMITS.github_url} />
          </div>
          <Input
            id="github_url"
            name="github_url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/your-username/your-repo"
            required
            maxLength={LIMITS.github_url}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <EnvVariablesInput value={envVars} onChange={(v) => { setEnvVars(v); setEnvError('') }} />
          {envError && (
            <p className="text-red-400 text-xs mt-2">{envError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="app_email">Supabase Login Email</Label>
              <CharCount value={appEmail} max={LIMITS.app_email} />
            </div>
            <Input
              id="app_email"
              name="app_email"
              type="email"
              value={appEmail}
              onChange={(e) => setAppEmail(e.target.value)}
              placeholder="test@example.com"
              required
              maxLength={LIMITS.app_email}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="app_password">Supabase Login Password</Label>
              <CharCount value={appPassword} max={LIMITS.app_password} />
            </div>
            <Input
              id="app_password"
              name="app_password"
              type="text"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder="test account password"
              required
              maxLength={LIMITS.app_password}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary">Summary</Label>
            <CharCount value={summary} max={LIMITS.summary} />
          </div>
          <Textarea
            id="summary"
            name="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Briefly describe what you implemented, any trade-offs, and anything else..."
            rows={5}
            required
            maxLength={LIMITS.summary}
          />
        </div>

        <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium" disabled={pending}>
          {pending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              {isUpdate ? 'Updating...' : 'Submitting...'}
            </span>
          ) : isUpdate ? 'Update Submission' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
