'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [min_funding, setMinFunding] = useState<string>('0')
  const [founder_portion, setFounderPortion] = useState<string>('0')

  const user = session?.user

  if (!user) {
    return <div>log in to create a cert.</div>
  }
  return (
    <div className="">
      <label htmlFor="title">Title</label>
      <Input
        type="text"
        id="title"
        autoComplete="off"
        required
        value={title ? title : ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="blurb">Blurb</label>
      <Input
        type="text"
        id="blurb"
        autoComplete="off"
        required
        value={blurb ? blurb : ''}
        onChange={(event) => setBlurb(event.target.value)}
      />
      <label htmlFor="min_funding">Minimum Funding</label>
      <Input
        type="number"
        id="min_funding"
        autoComplete="off"
        required
        value={min_funding ? min_funding : ''}
        onChange={(event) => setMinFunding(event.target.value)}
      />
      <label htmlFor="founder_portion">Founder Portion</label>
      <Input
        type="number"
        id="founder_portion"
        autoComplete="off"
        required
        value={founder_portion ? founder_portion : ''}
        onChange={(event) => setFounderPortion(event.target.value)}
      />
      <Button
        type="submit"
        onClick={async () => {
          const slug = await saveCert(
            title,
            blurb,
            min_funding,
            founder_portion
          )
          router.push(`/projects/${slug}`)
        }}
      >
        Save
      </Button>
    </div>
  )
}

async function saveCert(
  title: string,
  blurb: string,
  min_funding: string,
  founder_portion: string
) {
  const response = await fetch('/api/create-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, blurb, min_funding, founder_portion }),
  })
  const newProject = await response.json()
  console.log('new project: ', newProject)
  return newProject.slug
}
