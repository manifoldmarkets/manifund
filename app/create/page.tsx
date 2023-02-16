'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/utils/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { TextInput } from '@/components/text-input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const user = session?.user

  if (!user) {
    return <div>log in to create a cert.</div>
  }
  return (
    <div className="">
      <label htmlFor="title">Title</label>
      <TextInput
        type="text"
        id="title"
        autoComplete="off"
        required
        value={title ? title : ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button
        type="submit"
        onClick={async () => {
          const slug = await saveCert(title)
          router.push(`/projects/${slug}`)
        }}
      >
        Save
      </Button>
    </div>
  )
}

async function saveCert(title: string) {
  const response = await fetch('/api/create-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, blurb: 'blurby' }),
  })
  const newProject = await response.json()
  return newProject.slug
}
