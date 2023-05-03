'use client'

import { createContext, useContext, useState } from 'react'
import { createClient } from './supabase-browser'

import type { Session, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/db/database.types'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider(props: {
  children: React.ReactNode
  session: Session | null
  className: string
}) {
  const { children, session, className } = props
  const [supabase] = useState(() => createClient())

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
