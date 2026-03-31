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

  if (!name || !email || !password || !timeLimitMinutes || !expiryAt) {
    return { error: 'All fields are required.' }
  }

  const { error } = await supabase.from('candidates').insert({
    email,
    password,
    name,
    time_limit_minutes: timeLimitMinutes,
    expiry_at: new Date(expiryAt).toISOString(),
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
