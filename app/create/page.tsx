'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import Slider from 'rc-slider'
import clsx from 'clsx'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [min_funding, setMinFunding] = useState<string>('0')
  const [founder_portion, setFounderPortion] = useState<string>('0')
  const [num, setNum] = useState<number>(0)

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
      <Input
        type="number"
        id="founder_portion"
        autoComplete="off"
        required
        value={founder_portion ?? ''}
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

      <Slider
        min={0}
        max={100}
        value={num ?? 0}
        onChange={(value) => setNum(value as number)}
        className={clsx(
          ' my-auto mx-2 !h-1 xl:mx-auto xl:mt-3 xl:ml-4  [&>.rc-slider-rail]:bg-gray-200',
          '[&>.rc-slider-track]:bg-indigo-700 [&>.rc-slider-handle]:bg-indigo-500'
        )}
        railStyle={{ height: 4, top: 4, left: 0 }}
        trackStyle={{ height: 4, top: 4 }}
        handleStyle={{
          height: 24,
          width: 24,
          opacity: 1,
          border: 'none',
          boxShadow: 'none',
          top: -0.5,
        }}
        step={5}
      />
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
