'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Database } from '@/db/database.types'
import { useEffect, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { MySlider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { TextEditor, useTextEditor } from '@/components/editor'
import clsx from 'clsx'
import { InfoTooltip } from '@/components/info-tooltip'
import Link from 'next/link'
import { SiteLink } from '@/components/site-link'
import { Round } from '@/db/round'
import { sortBy } from 'lodash'
import { add, format } from 'date-fns'
import { formatMoney } from '@/utils/formatting'

export type Profile = Database['public']['Tables']['profiles']['Row']

const DEFAULT_DESCRIPTION = `
<h3>Project description</h3>
<p>I want to...</p>
<h3>What is your track record on similar projects?</h3>
<p>Our team is...</p>
<h3>How will you spend your funding?</h3>
<p>We need...</p>
`

export function CreateProposalForm(props: { rounds: Round[] }) {
  const { rounds } = props
  const availableRounds = sortBy(
    rounds.filter((round) => {
      const proposalDueDate = new Date(
        `${round.proposal_due_date}T23:59:59-12:00`
      )
      return new Date() < proposalDueDate || round.proposal_due_date === null
    }),
    'proposal_due_date'
  )
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number>(250)
  const [initialValuation, setInitialValuation] = useState<number>(250)
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false)
  const [round, setRound] = useState<Round>(availableRounds[0])
  const [useAuction, setUseAuction] = useState<boolean>(
    round.auction_close_date ? true : false
  )
  const [sellingPortion, setSellingPortion] = useState<number>(
    useAuction ? 100 : 0
  )
  const [auctionClose, setAuctionClose] = useState(
    useAuction
      ? format(
          round.auction_close_date
            ? new Date(round.auction_close_date)
            : add(new Date(), { days: 7 }),
          'yyyy-MM-dd'
        )
      : null
  )
  console.log('auctionClose', auctionClose)
  const editor = useTextEditor(DEFAULT_DESCRIPTION)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (title === '') {
      setErrorMessage('Your project needs a title!')
    } else if (minFunding < 250) {
      setErrorMessage('Funding goals must be at least $250')
    } else {
      setErrorMessage(null)
    }
  }, [title, minFunding, round])

  useEffect(
    () =>
      round.auction_close_date
        ? setAuctionClose(
            format(new Date(round.auction_close_date), 'yyyy-MM-dd')
          )
        : setAuctionClose(format(add(new Date(), { days: 7 }), 'yyyy-MM-dd')),
    [round]
  )

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
      <div>
        <label className="text-base font-semibold text-gray-900">
          Rounds currently accepting submissions
        </label>
        <fieldset className="mt-4">
          <legend className="sr-only">Round options</legend>
          <div className="space-y-4">
            {availableRounds.map((availableRound) => (
              <div
                key={availableRound.title}
                className="relative flex items-start"
              >
                <div className="flex h-6 items-center">
                  <input
                    id={availableRound.title}
                    name="notification-method"
                    type="radio"
                    defaultChecked={availableRound.title === round.title}
                    onChange={() => {
                      setRound(availableRound)
                      setUseAuction(
                        availableRound.auction_close_date ? true : false
                      )
                    }}
                    className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-600"
                  />
                </div>
                <div className="ml-3">
                  <label
                    htmlFor={availableRound.title}
                    className="text-md block font-medium"
                  >
                    {availableRound.title}
                  </label>
                  {availableRound.title === 'Independent' && (
                    <p className="text-sm text-gray-500">
                      Independent projects do not have a committed oracular
                      funder. By entering as an Independent project, your
                      project is less likely to recieve investments and oracular
                      funding.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="rounded-md border border-gray-300 bg-white p-5 shadow-md">
        <h1 className="text-xl font-bold">Founder equity & initial pricing</h1>
        <p className="mb-5 text-sm text-gray-500">
          Check these numbers carefully. They cannot be changed after your
          project is published.
        </p>
        <div
          className={clsx(
            'mt-2 flex flex-row gap-2',
            round.title !== 'Independent' ? 'hidden' : 'block'
          )}
        >
          <label htmlFor="advanced-settings" className="text-gray-600">
            Auction for initial valuation
            <InfoTooltip text="If you use an auction, your project will start in the 'proposal' phase, and you will only recieve funding if there are enough bids to pass the minimum funding bar you set. Otherwise, your project will begin in the 'active' phase and you can sell shares at the valuation of your choice immediately." />
          </label>
          <button
            type="button"
            className={clsx(
              'relative mb-3 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2' +
                (useAuction ? ' bg-orange-500' : ' bg-gray-200'),
              'focus:ring-offset-gray-100'
            )}
            role="switch"
            disabled={round.title !== 'Independent'}
            aria-checked="false"
            onClick={() => setUseAuction(!useAuction)}
          >
            <span className="sr-only">Use auction</span>
            <span
              aria-hidden="true"
              className={clsx(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                useAuction ? 'translate-x-5' : 'translate-x-0'
              )}
            ></span>
          </button>
        </div>
        <div>
          {useAuction && (
            <div className="mb-3">
              <label htmlFor="auction-close">Auction Close Date: </label>
              <Input
                type="date"
                value={auctionClose ?? ''}
                disabled={round.title !== 'Independent'}
                onChange={(event) => setAuctionClose(event.target.value)}
              />
            </div>
          )}
        </div>
        <label htmlFor="founderPortion">
          Portion of stake to be sold{' '}
          <InfoTooltip text="What percent of the project's impact cert will be sold to investors? The rest will be kept by the founding team." />
        </label>
        <div className="flex justify-center gap-5">
          <div className="flex gap-1">
            <Input
              value={sellingPortion}
              type="number"
              onChange={(event) =>
                setSellingPortion(Number(event.target.value))
              }
            ></Input>
            <p className="relative top-3">%</p>
          </div>
          <MySlider
            marks={marks}
            value={sellingPortion}
            onChange={(value) => setSellingPortion(value as number)}
            step={5}
          />
        </div>
        {useAuction ? (
          <div className="flex flex-col">
            <label htmlFor="minFunding">
              Minimum funding (USD){' '}
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
          </div>
        ) : (
          <div className="flex flex-col">
            <label htmlFor="valuation" className="mr-3">
              Initial valuation (USD){' '}
              <InfoTooltip text="Approximately our expected payout." />
            </label>
            <Input
              type="number"
              id="minFunding"
              autoComplete="off"
              required
              value={initialValuation}
              onChange={(event) =>
                setInitialValuation(Number(event.target.value))
              }
            />
          </div>
        )}
        <div className="m-3 rounded-md bg-orange-100 p-2 text-center font-medium text-orange-500 shadow-sm">
          {genEquityPriceSummary(
            sellingPortion,
            useAuction ? minFunding : undefined,
            useAuction ? undefined : initialValuation
          )}
        </div>
      </div>
      <div className="mt-4 text-center text-rose-500">{errorMessage}</div>
      <Button
        className="mt-4"
        type="submit"
        disabled={!!errorMessage}
        onClick={async () => {
          const founderShares = ((100 - sellingPortion) / 100) * TOTAL_SHARES
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
              min_funding: useAuction
                ? minFunding.toString()
                : (sellingPortion / 100) * initialValuation,
              founder_portion: advancedSettings ? founderShares.toString() : 0,
              round: round.title,
              auction_close:
                round.title === 'Independent'
                  ? auctionClose
                  : round.auction_close_date,
              stage: useAuction ? 'proposal' : 'active',
            }),
          })
          const newProject = await response.json()
          router.push(`/projects/${newProject.slug}`)
        }}
      >
        Publish project
      </Button>
    </div>
  )
}

function genEquityPriceSummary(
  sellingPortion: number,
  minFunding?: number,
  minValuation?: number
) {
  if (minFunding !== undefined) {
    return `${sellingPortion}% of your project will be put up for auction at a minimum valuation of ${
      (100 * minFunding) / sellingPortion
    }. If less than ${minFunding} worth of bids are placed before the auction close date, no funds will be sent and your project will not proceed.`
  } else if (minValuation !== undefined) {
    return `${sellingPortion}% of your project immediately be put up for sale at a valuation of ${formatMoney(
      minValuation
    )}. If all of that equity is sold, you will recieve ${formatMoney(
      (sellingPortion / 100) * minValuation
    )} in upfront funding, and will pay back ${sellingPortion}% of any retroactive funding you later recieve for this project to your investors. You can sell more of your equity at any time.`
  } else {
    return ''
  }
}
