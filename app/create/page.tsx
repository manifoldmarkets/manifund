'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/utils/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { supabase, session } = useSupabase()
  const [title, setTitle] = useState<string>('')
  const user = session?.user

  if (!user) {
    return <div>log in to create a cert.</div>
  }
  return (
    <div className="text-red-500">
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        autoComplete="off"
        required
        value={title ? title : ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit" onClick={() => saveCert(title, user.id, supabase)}>
        Save
      </button>
    </div>
  )
}

async function saveCert(
  title: string,
  creator: string,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from('projects')
    .insert({ title: title, creator: creator })
  if (error) {
    throw error
  }
}
