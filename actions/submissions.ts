'use server'

import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function createSubmission(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized.' }
  }

  const candidateId = session.candidateId

  // Check timer hasn't expired
  const { data: candidate } = await supabase
    .from('candidates')
    .select('timer_started_at, time_limit_minutes')
    .eq('id', candidateId)
    .single()

  if (!candidate || !candidate.timer_started_at) {
    return { error: 'Timer not started.' }
  }

  const startedAt = new Date(candidate.timer_started_at).getTime()
  const now = Date.now()
  const limitMs = candidate.time_limit_minutes * 60 * 1000
  if (now - startedAt > limitMs) {
    return { error: 'Your test time has expired.' }
  }

  const githubUrl = formData.get('github_url') as string
  const envVariablesRaw = formData.get('env_variables') as string
  const appEmail = formData.get('app_email') as string
  const appPassword = formData.get('app_password') as string
  const summary = formData.get('summary') as string

  if (!githubUrl || !appEmail || !appPassword || !summary) {
    return { error: 'All fields are required.' }
  }

  if (!githubUrl.startsWith('https://github.com/')) {
    return { error: 'GitHub URL must start with https://github.com/' }
  }

  let envVariables = {}
  try {
    envVariables = envVariablesRaw ? JSON.parse(envVariablesRaw) : {}
  } catch {
    return { error: 'Invalid environment variables format.' }
  }

  const { error } = await supabase.from('submissions').insert({
    candidate_id: candidateId,
    github_url: githubUrl,
    env_variables: envVariables,
    app_email: appEmail,
    app_password: appPassword,
    summary,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You have already submitted.' }
    }
    return { error: 'Failed to submit. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateSubmission(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized.' }
  }

  const candidateId = session.candidateId

  const { data: candidate } = await supabase
    .from('candidates')
    .select('timer_started_at, time_limit_minutes')
    .eq('id', candidateId)
    .single()

  if (!candidate || !candidate.timer_started_at) {
    return { error: 'Timer not started.' }
  }

  const startedAt = new Date(candidate.timer_started_at).getTime()
  const limitMs = candidate.time_limit_minutes * 60 * 1000
  if (Date.now() - startedAt > limitMs) {
    return { error: 'Your test time has expired.' }
  }

  const githubUrl = formData.get('github_url') as string
  const envVariablesRaw = formData.get('env_variables') as string
  const appEmail = formData.get('app_email') as string
  const appPassword = formData.get('app_password') as string
  const summary = formData.get('summary') as string

  if (!githubUrl || !appEmail || !appPassword || !summary) {
    return { error: 'All fields are required.' }
  }

  if (!githubUrl.startsWith('https://github.com/')) {
    return { error: 'GitHub URL must start with https://github.com/' }
  }

  let envVariables = {}
  try {
    envVariables = envVariablesRaw ? JSON.parse(envVariablesRaw) : {}
  } catch {
    return { error: 'Invalid environment variables format.' }
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      github_url: githubUrl,
      env_variables: envVariables,
      app_email: appEmail,
      app_password: appPassword,
      summary,
    })
    .eq('candidate_id', candidateId)

  if (error) {
    return { error: 'Failed to update. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getSubmission(candidateId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('candidate_id', candidateId)
    .single()

  if (error) return null
  return data
}
