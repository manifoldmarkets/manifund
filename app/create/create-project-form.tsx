'use client'

import { useSupabase } from '@/db/supabase-provider'
import { useEffect, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { MySlider } from '@/components/slider'
import { Project, TOTAL_SHARES } from '@/db/project'
import { TextEditor, useTextEditor } from '@/components/editor'
import clsx from 'clsx'
import { InfoTooltip } from '@/components/info-tooltip'
import Link from 'next/link'
import { Round } from '@/db/round'
import { sortBy } from 'lodash'
import { add, format, isAfter, isBefore } from 'date-fns'
import { formatMoney } from '@/utils/formatting'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Card } from '@/components/card'
import { Checkbox } from '@/components/input'
import { HorizontalRadioGroup } from '@/components/radio-group'

const DEFAULT_DESCRIPTION = `
<h3>Project description</h3>
<p>I want to...</p>
<h3>What is your track record on similar projects?</h3>
<p>Our team is...</p>
<h3>How will you spend your funding?</h3>
<p>We need...</p>
`

export function CreateProjectForm(props: { rounds: Round[] }) {
  const { rounds } = props
  const availableRounds = sortBy(
    rounds.filter((round) => {
      const proposalDueDate = new Date(
        `${round.proposal_due_date}T23:59:59-12:00`
      )
      return (
        round.proposal_due_date === null ||
        isBefore(new Date(), new Date(round.proposal_due_date))
      )
    }),
    'proposal_due_date'
  )
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const projectTypeLabels = {
    grant: 'Grant application',
    cert: 'Impact certificate',
  } as { [key in Project['type']]: string }
  const [projectType, setProjectType] = useState<Project['type']>('cert')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number>(0)
  const [fundingGoal, setFundingGoal] = useState<number>(250)
  const [initialValuation, setInitialValuation] = useState<number>(250)
  const [round, setRound] = useState<Round>(availableRounds[0])
  const [sellingPortion, setSellingPortion] = useState<number>(20)
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const [auctionClose, setAuctionClose] = useState(
    round.auction_close_date !== null
      ? format(
          round.auction_close_date
            ? new Date(round.auction_close_date)
            : add(new Date(), { weeks: 2 }),
          'yyyy-MM-dd'
        )
      : null
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const editor = useTextEditor(DEFAULT_DESCRIPTION)

  let errorMessage = null
  if (title === '') {
    errorMessage = 'Your project needs a title!'
  } else if (initialValuation <= 0 && auctionClose === null) {
    errorMessage =
      'Your initial valuation must be greater than 0. Only post projects with positive expected value.'
  } else if (
    minFunding <= 0 &&
    auctionClose !== null &&
    projectType === 'cert'
  ) {
    errorMessage = 'Your minimum funding must be greater than 0.'
  } else if (
    (projectType === 'grant' && minFunding > fundingGoal) ||
    fundingGoal <= 0
  ) {
    errorMessage =
      'Your funding goal must be greater than 0 and greater than or equal to your minimum funding goal.'
  } else if (
    projectType === 'grant' &&
    auctionClose &&
    (isAfter(new Date(auctionClose), add(new Date(), { weeks: 6 })) ||
      isBefore(new Date(auctionClose), new Date()))
  ) {
    errorMessage =
      'Your application close date must be in the future but no more than 6 weeks from now.'
  } else if (projectType === 'grant' && minFunding > 0 && !auctionClose) {
    errorMessage =
      'Because your minimum funding is greater than 0, you need to set a decision deadline.'
  } else if (projectType === 'cert' && !agreedToTerms) {
    errorMessage =
      'Confirm that you have read, understand, and agree to the terms of issuing this certificate.'
  } else {
    errorMessage = null
  }

  useEffect(() => {
    if (
      round.title === 'Independent' ||
      (round.title === 'Regrants' && minFunding > 0)
    ) {
      setAuctionClose(format(add(new Date(), { weeks: 2 }), 'yyyy-MM-dd'))
    } else if (round.auction_close_date) {
      setAuctionClose(format(new Date(round.auction_close_date), 'yyyy-MM-dd'))
    } else {
      setAuctionClose(null)
    }
  }, [round])

  useEffect(() => {
    if (projectType === 'grant') {
      setSellingPortion(0)
      setRound(
        availableRounds.find((r) => r.title === 'Regrants') ??
          availableRounds[0]
      )
      setAuctionClose(null)
    } else {
      setSellingPortion(20)
      setRound(availableRounds[0])
    }
  }, [projectType])

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
    <Col className="gap-3 p-5">
      <div className="flex flex-col md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold">Add a project</h1>
      </div>
      <HorizontalRadioGroup
        value={projectType}
        onChange={(event) => setProjectType(event as Project['type'])}
        options={projectTypeLabels}
      />
      <label htmlFor="title">Title</label>
      <Input
        className="text-2xl font-bold"
        type="text"
        id="title"
        autoComplete="off"
        value={title ?? ''}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="blurb">Subtitle</label>
      <Input
        type="text"
        id="blurb"
        autoComplete="off"
        value={blurb ?? ''}
        onChange={(event) => setBlurb(event.target.value)}
      />
      <label htmlFor="description">Description</label>
      <TextEditor editor={editor} />
      {projectType === 'cert' ? (
        <>
          <div>
            <label className="text-base font-semibold text-gray-900">
              Rounds currently accepting submissions
            </label>
            <fieldset className="mt-4">
              <legend className="sr-only">Round options</legend>
              <div className="space-y-4">
                {availableRounds
                  .filter((round) => round.title !== 'Regrants')
                  .map((availableRound) => (
                    <Row
                      key={availableRound.title}
                      className="relative items-start"
                    >
                      <Row className="h-6 items-center">
                        <input
                          id={availableRound.title}
                          name="notification-method"
                          type="radio"
                          defaultChecked={availableRound.title === round.title}
                          onChange={() => {
                            setRound(availableRound)
                          }}
                          className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-600"
                        />
                      </Row>
                      <div className="ml-3">
                        <Row>
                          <label
                            htmlFor={availableRound.title}
                            className="text-md block font-medium"
                          >
                            {availableRound.title}
                          </label>
                          <Link href={`/rounds/${availableRound.slug}`}>
                            <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-400" />
                          </Link>
                        </Row>
                        {availableRound.title === 'Independent' && (
                          <p className="text-sm text-gray-500">
                            Independent projects do not have a committed
                            oracular funder. By entering as an Independent
                            project, your project is less likely to recieve
                            investments and oracular funding.
                          </p>
                        )}
                      </div>
                    </Row>
                  ))}
              </div>
            </fieldset>
          </div>

          <Card>
            <h1 className="text-xl font-bold">
              Founder equity & initial pricing
            </h1>
            <p className="mb-5 text-sm text-gray-500">
              You can choose to buy or sell more of your project at any time.
            </p>
            {round.title === 'Independent' && (
              <Row className="mt-2 gap-2">
                <label htmlFor="advanced-settings" className="text-gray-600">
                  Auction for initial valuation
                  <InfoTooltip text="If you use an auction, your project will start in the 'proposal' phase, and you will only recieve funding if there are enough bids to pass the minimum funding bar you set. Otherwise, your project will begin in the 'active' phase and you can sell shares at the valuation of your choice immediately." />
                </label>

                <button
                  type="button"
                  className={clsx(
                    'relative mb-3 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2' +
                      (auctionClose === null
                        ? ' bg-gray-200'
                        : ' bg-orange-500'),
                    'focus:ring-offset-gray-100'
                  )}
                  role="switch"
                  aria-checked="false"
                  onClick={() =>
                    setAuctionClose(
                      auctionClose === null
                        ? format(add(new Date(), { days: 7 }), 'yyyy-MM-dd')
                        : null
                    )
                  }
                >
                  <span className="sr-only">Use auction</span>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      auctionClose === null ? 'translate-x-0' : 'translate-x-5'
                    )}
                  ></span>
                </button>
              </Row>
            )}
            {auctionClose !== null && (
              <div className="mb-3">
                <label htmlFor="auction-close">Auction Close Date: </label>
                <Input
                  type="date"
                  value={auctionClose ?? ''}
                  disabled={
                    round.title !== 'Independent' && round.title !== 'Regrants'
                  }
                  onChange={(event) => setAuctionClose(event.target.value)}
                />
              </div>
            )}
            <label htmlFor="founderPortion">
              Portion of stake to be sold{' '}
              <InfoTooltip text="What percent of the project's impact cert will be sold to investors? The rest will be kept by the founding team." />
            </label>
            <Row className="justify-center gap-5">
              <Row className=" gap-1">
                <Input
                  value={sellingPortion}
                  type="number"
                  onChange={(event) =>
                    setSellingPortion(Number(event.target.value))
                  }
                ></Input>
                <p className="relative top-3">%</p>
              </Row>
              <MySlider
                marks={marks}
                value={sellingPortion}
                onChange={(value) => setSellingPortion(value as number)}
                step={5}
              />
            </Row>
            {auctionClose === null ? (
              <Col>
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
              </Col>
            ) : (
              <Col>
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
                  onChange={(event) =>
                    setMinFunding(Number(event.target.value))
                  }
                />
              </Col>
            )}
          </Card>
        </>
      ) : (
        <>
          <label htmlFor="minFunding" className="mr-3 mt-4">
            Minimum funding (USD){' '}
            <InfoTooltip text="The minimum amount of funding you need to start this project. If this amount isn't reached, no funds will be sent." />
          </label>
          <Input
            type="number"
            id="minFunding"
            autoComplete="off"
            required
            value={minFunding}
            onChange={(event) => setMinFunding(Number(event.target.value))}
          />
          <label htmlFor="fundingGoal">
            Funding goal (USD){' '}
            <InfoTooltip text="The amount you're asking for. This will be the main number displayed to regranters." />
          </label>
          <Input
            type="number"
            id="fundingGoal"
            autoComplete="off"
            required
            value={fundingGoal}
            onChange={(event) => setFundingGoal(Number(event.target.value))}
          />
          {minFunding > 0 && (
            <Col>
              <div className="mb-3">
                <label htmlFor="auction-close">Decision deadline: </label>
                <InfoTooltip text="After this deadline, if you have not reached your minimum funding goal, your application will close and you will not recieve any money. This date cannot be more than 6 weeks after posting." />
              </div>
              <Input
                type="date"
                value={auctionClose ?? ''}
                disabled={
                  round.title !== 'Independent' && round.title !== 'Regrants'
                }
                onChange={(event) => setAuctionClose(event.target.value)}
              />
            </Col>
          )}
        </>
      )}
      {projectType === 'cert' && (
        <Row className="mb-3">
          <Row className="h-6 items-center">
            <Checkbox
              id="terms"
              aria-describedby="terms-description"
              name="terms"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
            />
          </Row>

          <div className="ml-3 text-sm leading-6">
            <label htmlFor="terms" className="font-medium text-gray-900">
              Check this box to confirm that you understand and commit to the
              following:
            </label>{' '}
            <span id="terms-description" className="text-gray-500">
              {genEquityPriceSummary(
                sellingPortion,
                auctionClose === null ? undefined : minFunding,
                auctionClose === null ? initialValuation : undefined
              )}
            </span>
          </div>
        </Row>
      )}
      <div className="mt-3 text-center text-rose-500">{errorMessage}</div>
      <Button
        className="mt-4"
        type="submit"
        disabled={!!errorMessage}
        loading={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true)
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
              min_funding:
                auctionClose === null
                  ? (sellingPortion / 100) * initialValuation
                  : minFunding,
              // TODO: make funding goal meaningfully different from min for certs
              funding_goal: projectType === 'cert' ? minFunding : fundingGoal,
              founder_portion: founderShares,
              round: round.title,
              auction_close:
                round.title === 'Independent' || round.title === 'Regrants'
                  ? auctionClose
                  : round.auction_close_date,
              stage:
                auctionClose === null && projectType === 'cert'
                  ? 'active'
                  : 'proposal',
              type: projectType,
            }),
          })
          const newProject = await response.json()
          setIsSubmitting(false)
          router.push(`/projects/${newProject.slug}`)
        }}
      >
        Publish project
      </Button>
    </Col>
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
    return `${sellingPortion}% of your project will immediately be put up for sale at a valuation of ${formatMoney(
      minValuation
    )}. If all of that equity is sold, you will recieve ${formatMoney(
      (sellingPortion / 100) * minValuation
    )} in upfront funding, and will pay back ${sellingPortion}% of any retroactive funding you later recieve for this project to your investors.`
  } else {
    return ''
  }
}
