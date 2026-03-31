'use server'

import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import {
  createSession,
  destroySession,
  createAdminSession,
  destroyAdminSession,
} from '@/lib/session'
import { redirect } from 'next/navigation'

export async function loginCandidate(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !candidate) {
    return { error: 'Invalid email or password.' }
  }

  if (password !== candidate.password) {
    return { error: 'Invalid email or password.' }
  }

  // Check if account has expired
  if (new Date(candidate.expiry_at).getTime() < Date.now()) {
    return { error: 'Your account has expired. You can no longer take this test.' }
  }

  // Check if time already expired
  if (candidate.timer_started_at) {
    const startedAt = new Date(candidate.timer_started_at).getTime()
    const now = Date.now()
    const limitMs = candidate.time_limit_minutes * 60 * 1000
    if (now - startedAt > limitMs) {
      return { error: 'Your test time has expired.' }
    }
  }

  // Start timer on first login
  if (!candidate.timer_started_at) {
    await supabase
      .from('candidates')
      .update({ timer_started_at: new Date().toISOString() })
      .eq('id', candidate.id)
  }

  await createSession(candidate.id)
  redirect('/dashboard')
}

export async function logoutCandidate() {
  await destroySession()
  redirect('/login')
}

export async function loginAdmin(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    return { error: 'Admin credentials not configured.' }
  }

  if (email !== adminEmail) {
    return { error: 'Invalid email or password.' }
  }

  const passwordValid = await bcrypt.compare(password, adminPasswordHash)
  if (!passwordValid) {
    return { error: 'Invalid email or password.' }
  }

  await createAdminSession()
  redirect('/admin/dashboard')
}

export async function logoutAdmin() {
  await destroyAdminSession()
  redirect('/admin')
}
