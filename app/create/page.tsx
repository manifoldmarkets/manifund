'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import MySlider from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { TextEditor, useTextEditor } from '@/components/editor'
import clsx from 'clsx'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function CreateCertForm() {
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<string>('0')
  const [founderPortion, setFounderPortion] = useState<number>(0)
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false)
  const editor = useTextEditor()

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
    <div className="flex flex-col gap-3 p-5">
      <div className="flex flex-col md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold">Create a Project Proposal</h1>
        <div className="mt-2 flex flex-row gap-2">
          <label htmlFor="advanced-settings" className="text-gray-600">
            Advanced Settings
          </label>
          <button
            type="button"
            className={clsx(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2' +
                (advancedSettings ? ' bg-orange-500' : ' bg-gray-200'),
              'focus:ring-offset-gray-100'
            )}
            role="switch"
            aria-checked="false"
            onClick={() => setAdvancedSettings(!advancedSettings)}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={clsx(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                advancedSettings ? 'translate-x-5' : 'translate-x-0'
              )}
            ></span>
          </button>
        </div>
      </div>
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
      <label htmlFor="description">Description</label>
      <TextEditor editor={editor} />
      <label htmlFor="minFunding">Minimum Funding</label>
      <Input
        type="number"
        id="minFunding"
        autoComplete="off"
        required
        value={minFunding ?? ''}
        onChange={(event) => setMinFunding(event.target.value)}
      />

      {advancedSettings && (
        <>
          <label htmlFor="founderPortion">Founder Portion</label>
          <div className="flex justify-center">
            <MySlider
              marks={marks}
              value={founderPortion ?? 0}
              onChange={(value) => setFounderPortion(value as number)}
              step={5}
            />
          </div>
        </>
      )}
      <Button
        type="submit"
        onClick={async () => {
          const founderShares = (founderPortion / 100) * TOTAL_SHARES
          const description = editor?.getJSON() ?? '<p>No description</p>'
          const response = await fetch('/api/create-project', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              blurb,
              description,
              min_funding: minFunding,
              founder_portion: founderShares.toString(),
            }),
          })
          const newProject = await response.json()
          router.push(`/projects/${newProject.slug}`)
        }}
      >
        Save
      </Button>
    </div>
  )
}
