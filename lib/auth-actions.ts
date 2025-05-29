'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { getURL } from '@/utils/constants'

export type AuthResult = {
  type: 'error' | 'success'
  text: string
}

export async function signInWithEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { type: 'error', text: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUpWithEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${getURL()}auth/callback?next=/edit-profile`,
    },
  })

  if (error) {
    return { type: 'error', text: error.message }
  }

  return { type: 'success', text: 'Check your email to continue signing up' }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const baseUrl = getURL()
  const redirectTo = `${baseUrl}edit-profile?recovery=true`

  console.log('Reset password - Base URL:', baseUrl)
  console.log('Reset password - Redirect URL:', redirectTo)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { type: 'error', text: error.message }
  }

  return {
    type: 'success',
    text: 'Check your email for password reset instructions',
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  })

  if (error) {
    return { type: 'error', text: error.message }
  }

  redirect(data.url)
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { type: 'error', text: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
