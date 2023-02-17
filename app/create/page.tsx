'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import clsx from 'clsx'

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
        <Slider
          min={0}
          max={100}
          marks={marks}
          value={founder_portion ?? 0}
          onChange={(value) => setFounderPortion(value as number)}
          className={clsx(
            ' mt-3 mb-10 mx-2 !h-1 [&>.rc-slider-rail]:bg-gray-200 w-11/12',
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
          draggableTrack
          pushable
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
