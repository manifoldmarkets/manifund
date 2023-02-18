'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import MySlider from '@/components/slider'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [min_funding, setMinFunding] = useState<string>('0')
  const [founder_portion, setFounderPortion] = useState<number>(0)

  const user = session?.user

  const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%',
  }

  if (!user) {
    return <div>log in to create a cert.</div>
  }
  return (
    <div className="flex flex-col gap-2 p-4">
      <label htmlFor="title">Title</label>
      <Input
        type="text"
        id="title"
        autoComplete="off"
        required
        value={title ?? ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="blurb">Blurb</label>
      <Input
        type="text"
        id="blurb"
        autoComplete="off"
        required
        value={blurb ?? ''}
        onChange={(event) => setBlurb(event.target.value)}
      />
      <label htmlFor="min_funding">Minimum Funding</label>
      <Input
        type="number"
        id="min_funding"
        autoComplete="off"
        required
        value={min_funding ?? ''}
        onChange={(event) => setMinFunding(event.target.value)}
      />

      <label htmlFor="founder_portion">Founder Portion</label>
      <div className="flex justify-center">
        <MySlider
          marks={marks}
          value={founder_portion ?? 0}
          onChange={(value) => setFounderPortion(value as number)}
          step={5}
        />
      </div>
      <Button
        type="submit"
        onClick={async () => {
          const slug = await saveCert(
            title,
            blurb,
            min_funding,
            (founder_portion * 100000).toString()
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
