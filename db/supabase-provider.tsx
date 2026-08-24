'use client'

import posthog from 'posthog-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase-browser'

import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/db/database.types'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider(props: { children: React.ReactNode; className: string }) {
  const { children, className } = props
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_OUT' && posthog.__loaded) {
        posthog.reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const userId = session?.user?.id
  useEffect(() => {
    if (!userId || !posthog.__loaded) return
    void supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        posthog.identify(userId, {
          email: session?.user?.email,
          username: data?.username,
          name: data?.full_name,
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase])

  return (
    <Context.Provider value={{ supabase, session }}>
      <div className={className}>{children}</div>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  let context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  } else {
    return context
  }
}
