'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Database } from '@/db/database.types'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import MySlider from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { TextEditor, useTextEditor } from '@/components/editor'
import clsx from 'clsx'
import { InfoTooltip } from '@/components/info-tooltip'
import Link from 'next/link'
import { SiteLink } from '@/components/site-link'

export type Profile = Database['public']['Tables']['profiles']['Row']

const DEFAULT_DESCRIPTION = `
<h3>Project description</h3>
<p>I want to...</p>
<h3>What is your track record on similar projects?</h3>
<p>Our team is...</p>
<h3>How will you spend your funding?</h3>
<p>We need...</p>
`

export default function CreateCertForm() {
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number>(250)
  const [founderPortion, setFounderPortion] = useState<number>(0)
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false)
  const [round, setRound] = useState<string>('ACX Mini-Grants')
  const [auctionClose, setAuctionClose] = useState<string>('03/08/2023')
  const editor = useTextEditor(DEFAULT_DESCRIPTION)
  let errorMessage: string | null = null

  if (title === '') {
    errorMessage = 'Your project needs a title!'
  } else if (minFunding < 250) {
    errorMessage = 'Funding goals must be at least $250'
  }

  const user = session?.user

  const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%',
  }

  if (!user) {
    return (
      <div>
        <Link href="/login" className="text-orange-500 hover:text-orange-600">
          Log in
        </Link>{' '}
        to create a project!
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex flex-col md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold">Create a project proposal</h1>
        <div className="mt-2 flex flex-row gap-2">
          <label htmlFor="advanced-settings" className="text-gray-600">
            Advanced settings
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
        className="text-2xl font-bold"
        type="text"
        id="title"
        autoComplete="off"
        required
        value={title ?? ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="blurb">Subtitle</label>
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
      <label htmlFor="minFunding">
        Funding goal (USD){' '}
        <InfoTooltip text="The minimum amount of funding you need to start this project. If this amount isn't reached, no funds will be sent." />
      </label>
      <Input
        type="number"
        id="minFunding"
        autoComplete="off"
        required
        value={minFunding ?? ''}
        onChange={(event) => setMinFunding(Number(event.target.value))}
      />

      {advancedSettings && (
        <>
          <label htmlFor="founderPortion">
            Founder portion{' '}
            <InfoTooltip text="What percent of the project's impact cert will be kept by the founding team?" />
          </label>
          <div className="flex justify-center">
            <MySlider
              marks={marks}
              value={founderPortion ?? 0}
              onChange={(value) => setFounderPortion(value as number)}
              step={5}
            />
          </div>
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="round"
                aria-describedby="comments-description"
                name="comments"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-600 hover:cursor-pointer focus:ring-orange-500"
                onChange={(event) => {
                  if (event.target.checked) {
                    setRound('Independent')
                  } else {
                    setRound('ACX Mini-Grants')
                  }
                }}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="round" className="font-medium text-gray-700">
                This project is NOT a part of the{' '}
                <SiteLink
                  href="https://astralcodexten.substack.com/p/announcing-forecasting-impact-mini"
                  className="text-orange-500 hover:text-orange-600"
                  followsLinkClass
                >
                  ACX Mini-Grants round
                </SiteLink>
                .
              </label>
              <p id="round-description" className="text-gray-500">
                I understand that only projects that are a part of the ACX
                Mini-Grants round will be considered for oracular funding by
                Scott Alexander, and that projects that are not part of the ACX
                Mini-Grants round do not have a committed oracular funder. I
                understand that by checking this box, my project is less likely
                to recieve investments and oracular funding.
              </p>
            </div>
          </div>
          {round === 'Independent' && (
            <>
              <label htmlFor="auction-close">IPO Auction Close Date</label>
              <Input
                type="date"
                value={auctionClose}
                onChange={(event) => setAuctionClose(event.target.value)}
              />
            </>
          )}
        </>
      )}
      <div className="text-red-500">{errorMessage}</div>
      <Button
        className="mt-6"
        type="submit"
        disabled={!!errorMessage}
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
              min_funding: minFunding.toString(),
              founder_portion: advancedSettings ? founderShares.toString() : 0,
              round: advancedSettings ? round : 'ACX Mini-Grants',
              auction_close: advancedSettings ? auctionClose : '03/08/2023',
            }),
          })
          const newProject = await response.json()
          router.push(`/projects/${newProject.slug}`)
        }}
      >
        Publish project proposal
      </Button>
    </div>
  )
}
