'use client'

import { useSupabase } from './supabase-provider'

// Supabase auth needs to be triggered client-side
export function Login() {
  const { supabase, session } = useSupabase()

  const handleEmailLogin = async () => {
    await supabase.auth.signInWithPassword({
      email: 'jon@supabase.com',
      password: 'password',
    })
  }

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <button onClick={handleEmailLogin}>Email Login</button>
      <button onClick={handleGitHubLogin}>GitHub Login</button>
      <button onClick={handleLogout}>Logout</button>
    </>
  )
}