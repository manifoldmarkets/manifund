'use client'

import { createContext, useContext, useState } from 'react'
import { createClient } from './supabase-browser'

import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/db/database.types'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider(props: {
  children: React.ReactNode
  user: User | null
  className: string
}) {
  const { children, user, className } = props
  const [supabase] = useState(() => createClient())

  return (
    <Context.Provider value={{ supabase, user }}>
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
