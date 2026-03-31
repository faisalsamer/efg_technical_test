'use server'

import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

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

  // Build a timezone-aware date string so the expiry is interpreted in the admin's local time
  let expiryDate: Date
  if (timezone) {
    // Format: "2026-04-05T18:00" + timezone offset
    // Create a date string the Intl API can resolve, then extract the correct UTC time
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
    expiryDate = new Date(naive.getTime() - offsetMs)
  } else {
    expiryDate = new Date(expiryAt)
  }

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
