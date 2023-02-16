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
  const [blurb, setBlurb] = useState<string>('')
  const user = session?.user

  if (!user) {
    return <div>log in to create a cert.</div>
  }
  return (
    <div className="">
      <label htmlFor="title">Title</label>
      <TextInput
        id="title"
        autoComplete="off"
        required
        value={title ? title : ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="blurb">Blurb</label>
      <TextInput
        id="blurb"
        autoComplete="off"
        required
        value={blurb ? blurb : ''}
        onChange={(event) => setBlurb(event.target.value)}
      />
      <Button
        type="submit"
        onClick={async () => {
          const slug = await saveCert(title, blurb)
          router.push(`/projects/${slug}`)
        }}
      >
        Save
      </Button>
    </div>
  )
}

async function saveCert(title: string, blurb: string) {
  const response = await fetch('/api/create-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, blurb }),
  })
  const newProject = await response.json()
  return newProject.slug
}
