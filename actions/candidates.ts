'use server'

import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// Interprets a datetime-local value ("2026-04-05T18:00") in the admin's timezone and returns the UTC instant.
function toExpiryDate(expiryAt: string, timezone: string | null) {
  if (!timezone) return new Date(expiryAt)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  // Parse the naive datetime in the given timezone by computing the offset
  const naive = new Date(expiryAt) // interpreted as local (UTC on server)
  const utcParts = formatter.formatToParts(naive)
  const get = (type: string) => utcParts.find(p => p.type === type)?.value || '0'
  const inTz = new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`)
  const offsetMs = inTz.getTime() - naive.getTime()
  return new Date(naive.getTime() - offsetMs)
}

export async function addCandidate(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const admin = await getAdminSession()
  if (!admin) {
    return { error: 'Unauthorized.' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const timeLimitMinutes = parseInt(formData.get('time_limit_minutes') as string, 10)
  const expiryAt = formData.get('expiry_at') as string
  const timezone = formData.get('timezone') as string

  if (!name || !email || !password || !timeLimitMinutes || !expiryAt) {
    return { error: 'All fields are required.' }
  }

  const expiryDate = toExpiryDate(expiryAt, timezone)

  const { error } = await supabase.from('candidates').insert({
    email,
    password,
    name,
    time_limit_minutes: timeLimitMinutes,
    expiry_at: expiryDate.toISOString(),
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A candidate with this email already exists.' }
    }
    return { error: 'Failed to add candidate.' }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function deleteCandidate(candidateId: string) {
  const admin = await getAdminSession()
  if (!admin) {
    return { error: 'Unauthorized.' }
  }

  const { error: submissionError } = await supabase
    .from('submissions')
    .delete()
    .eq('candidate_id', candidateId)

  if (submissionError) {
    return { error: 'Failed to delete candidate.' }
  }

  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId)

  if (error) {
    return { error: 'Failed to delete candidate.' }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function resetCandidate(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const admin = await getAdminSession()
  if (!admin) {
    return { error: 'Unauthorized.' }
  }

  const candidateId = formData.get('candidate_id') as string
  const expiryAt = formData.get('expiry_at') as string
  const timezone = formData.get('timezone') as string

  if (!candidateId || !expiryAt) {
    return { error: 'Choose a new expiry date.' }
  }

  const expiryDate = toExpiryDate(expiryAt, timezone)
  if (isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
    return { error: 'The new expiry date must be in the future.' }
  }

  const { error } = await supabase
    .from('candidates')
    .update({ timer_started_at: null, expiry_at: expiryDate.toISOString() })
    .eq('id', candidateId)

  if (error) {
    return { error: 'Failed to reset the exam.' }
  }

  const { error: submissionError } = await supabase
    .from('submissions')
    .delete()
    .eq('candidate_id', candidateId)

  if (submissionError) {
    return { error: 'The timer was reset, but the previous submission could not be deleted.' }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/candidates/${candidateId}`)
  return { success: true }
}

export async function getCandidates() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, email, name, password, time_limit_minutes, timer_started_at, expiry_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
