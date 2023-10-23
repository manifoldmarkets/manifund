'use client'

import { useSupabase } from '@/db/supabase-provider'
import { useState } from 'react'
import { Checkbox, Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { TOTAL_SHARES } from '@/db/project'
import { ResetEditor, TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import Link from 'next/link'
import { add, format, isAfter, isBefore } from 'date-fns'
import { Col } from '@/components/layout/col'
import { RequiredStar } from '@/components/tags'
import { clearLocalStorageItem } from '@/hooks/use-local-storage'
import { Row } from '@/components/layout/row'
import { MiniCause } from '@/db/cause'
import { SelectCauses } from '@/components/select-causes'
import {RangeSlider, Slider} from '@/components/slider'
import clsx from 'clsx'
import { InfoTooltip } from '@/components/info-tooltip'
import 'rc-slider/assets/index.css'
import { formatMoneyPrecise } from '@/utils/formatting'

const DESCRIPTION_OUTLINE = `
<h3>Project summary</h3>
</br>
<h3>What are this project's goals and how will you achieve them?</h3>
</br>
<h3>How will this funding be used?</h3>
</br>
<h3>Who is on your team and what's your track record on similar projects?</h3>
</br>
<h3>What are the most likely causes and outcomes if this project fails? (premortem)</h3>
</br>
<h3>What other funding are you or your project getting?</h3>
</br>
`
const DESCRIPTION_KEY = 'ProjectDescription'

const SLIDER_MARKS = [
  {value: 0, label: "0%"},
  {value: 25, label: "25%"},
  {value: 50, label: "50%"},
  {value: 75, label: "75%"},
  {value: 100, label: "100%"},
]

export function CreateProjectForm(props: { causesList: MiniCause[] }) {
  const { causesList } = props
  const { session } = useSupabase()
  const router = useRouter()
  // For all
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number | null>(null)
  const [fundingGoal, setFundingGoal] = useState<number | null>(null)
  const [verdictDate, setVerdictDate] = useState(
    format(add(new Date(), { months: 1 }), 'yyyy-MM-dd')
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedCauses, setSelectedCauses] = useState<MiniCause[]>([])
  // For ACX Impact Certs
  const [applyingToACX, setApplyingToACX] = useState<boolean>(false)
  const [sellingPortion, setSellingPortion] = useState<number>(20)
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const initialValuation = (100 * (minFunding ?? 0)) / sellingPortion
  const isInitialValuationValid =
    !isNaN(initialValuation) &&
    initialValuation > 0 &&
    isFinite(initialValuation)
  const editor = useTextEditor(DESCRIPTION_OUTLINE, DESCRIPTION_KEY)

  let errorMessage = null
  if (title === '') {
    errorMessage = 'Your project needs a title.'
  } else if (minFunding !== null && minFunding < 500) {
    errorMessage = 'Your minimum funding must be at least $500.'
  } else if (
    fundingGoal &&
    ((minFunding && minFunding > fundingGoal) || fundingGoal <= 0)
  ) {
    errorMessage =
      'Your funding goal must be greater than 0 and greater than or equal to your minimum funding goal.'
  } else if (
    isAfter(new Date(verdictDate), add(new Date(), { weeks: 6 })) ||
    isBefore(new Date(verdictDate), new Date())
  ) {
    errorMessage =
      'Your application close date must be in the future but no more than 6 weeks from now.'
  } else if (!verdictDate) {
    errorMessage = 'You need to set a decision deadline.'
  } else {
    errorMessage = null
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
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
        funding_goal: fundingGoal,
        founder_portion: TOTAL_SHARES,
        round: 'Regrants',
        auction_close: verdictDate,
        stage: 'proposal',
        type: 'grant',
        causeSlugs: selectedCauses.map((cause) => cause.slug),
      }),
    })
    const newProject = await response.json()
    router.push(`/projects/${newProject.slug}`)
    clearLocalStorageItem(DESCRIPTION_KEY)
    setIsSubmitting(false)
  }

  const user = session?.user

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
      <Row className="gap-1">
        <Checkbox
          checked={applyingToACX}
          onChange={(event) => setApplyingToACX(event.target.checked)}
        />
        <label className="ml-3">I am applying to ACX Grants Round 2.</label>
      </Row>
      <Col className="gap-1">
        <label htmlFor="title">
          Title
          <RequiredStar />
        </label>
        <Col>
          <Input
            type="text"
            id="title"
            autoComplete="off"
            maxLength={80}
            value={title ?? ''}
            onChange={(event) => setTitle(event.target.value)}
          />
          <span className="text-right text-xs text-gray-600">
            Maximum 80 characters
          </span>
        </Col>
      </Col>
      <Col className="gap-1">
        <label htmlFor="blurb">Subtitle</label>
        <Col>
          <Input
            type="text"
            id="blurb"
            autoComplete="off"
            maxLength={160}
            value={blurb ?? ''}
            onChange={(event) => setBlurb(event.target.value)}
          />
          <span className="text-right text-xs text-gray-600">
            Maximum 160 characters
          </span>
        </Col>
      </Col>
      <Col className="gap-1">
        <Row className="items-center justify-between">
          <label>
            Project description
            <RequiredStar />
          </label>
          <ResetEditor
            storageKey={DESCRIPTION_KEY}
            editor={editor}
            defaultContent={DESCRIPTION_OUTLINE}
          />
        </Row>
        <p className="text-sm text-gray-500">
          Note that the editor offers formatting shortcuts{' '}
          <Link
            className="hover:underline"
            href="https://www.notion.so/help/keyboard-shortcuts#markdown-style"
          >
            like Notion
          </Link>{' '}
          for hyperlinks, bullet points, headers, and more.
        </p>
        <TextEditor editor={editor} />
      </Col>
      <Col className="gap-1">
        <label htmlFor="minFunding" className="mr-3 mt-4">
          Minimum funding (USD)
          <RequiredStar />
        </label>
        <p className="text-sm text-gray-600">
          The minimum amount of funding you need to start this project. If this
          amount is not reached, no funds will be sent. Due to the cost of
          approving grants and processing payments, we require this to be at
          least $500.
        </p>
        <Col>
          <Input
            type="number"
            id="minFunding"
            autoComplete="off"
            value={minFunding !== null ? Number(minFunding).toString() : ''}
            onChange={(event) => setMinFunding(Number(event.target.value))}
            error={minFunding !== null && minFunding < 500}
            errorMessage="Minimum funding must be at least $500."
          />
        </Col>
      </Col>
      {applyingToACX && (
        <Col className="gap-1">
          <label htmlFor="initialPublicOffering">
            Portion of stake to be sold
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            Blah blah explaing what is going on and link to impact certs info.
          </p>
          <Row className="justify-between gap-5">
            <Row className="gap-1">
              <Input
                value={sellingPortion}
                type="number"
                onChange={(event) =>
                  setSellingPortion(Number(event.target.value))
                }
              ></Input>
              <p className="relative top-3">%</p>
            </Row>
            <Slider
              marks={SLIDER_MARKS}
              amount={sellingPortion}
              onChange={(value) => {
                setSellingPortion(value as number)
              }}
              step={5}
              className="w-full"
            />
          </Row>
          <Row className="m-auto w-2/3 justify-between">
            <Col>
              <p className="text-xs">Initial valuation:</p>
              <p className="text-base font-bold">
                {isInitialValuationValid
                  ? `$${initialValuation.toLocaleString()}`
                  : 'N/A'}
              </p>
            </Col>
            <Col>
              <p className="text-xs">Some AMM cost info:</p>
              <p className="text-base font-bold">stat%</p>
            </Col>
          </Row>
        </Col>
      )}
      <Col className="gap-1">
        <label htmlFor="fundingGoal">
          Funding goal (USD)
          <RequiredStar />
        </label>
        <p className="text-sm text-gray-600">
          Until this amount is raised, the project will be marked for donors as
          not fully funded. If this amount is different from your minimum
          funding, please explain in your project description what you could
          accomplish with the minimum funding and what you could accomplish with
          the full funding.
        </p>
        <Input
          type="number"
          id="fundingGoal"
          autoComplete="off"
          value={fundingGoal ? Number(fundingGoal).toString() : ''}
          onChange={(event) => setFundingGoal(Number(event.target.value))}
          error={
            !!(
              fundingGoal &&
              minFunding &&
              (fundingGoal <= minFunding || fundingGoal <= 0)
            )
          }
          errorMessage="Funding goal must be greater than 0 and greater than or equal to your minimum funding."
        />
      </Col>
      <Col className="gap-1">
        <label>
          Decision deadline
          <RequiredStar />
        </label>
        <p className="text-sm text-gray-600">
          After this deadline, if you have not reached your minimum funding bar,
          your application will close and you will not recieve any money. This
          date cannot be more than 6 weeks after posting.
        </p>
        <Input
          type="date"
          value={verdictDate ?? ''}
          onChange={(event) => setVerdictDate(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label>Cause areas</label>
        <SelectCauses
          causesList={causesList}
          selectedCauses={selectedCauses}
          setSelectedCauses={setSelectedCauses}
        />
      </Col>
      <InvestmentStructurePanel minimumFunding={minFunding ?? 0} />
      <Button
        className="mt-4"
        type="submit"
        disabled={!!errorMessage}
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Publish project
      </Button>
    </Col>
  )
}

function InvestmentStructurePanel(props: { minimumFunding: number }) {
  const { minimumFunding } = props
  const [investorPortion, setInvestorPortion] = useState<number>(50)
  const [ammPortion, setAMMPortion] = useState<number>(10)
  const initialValuation = (100 * (minimumFunding ?? 0)) / investorPortion
  return (
    <Col>
    <Row className="justify-center text-sm text-gray-500 gap-10">
      <Row className="gap-1 items-center">
        <div className="h-2 w-2 rounded-full bg-orange-500"/>
        <p>founder</p>
      </Row>
      <Row className="gap-1 items-center">
        <div className="h-2 w-2 rounded-full bg-gray-300"/>
        <p>AMM</p>
      </Row>
      <Row className="gap-1 items-center">
        <div className="h-2 w-2 rounded-full bg-rose-500"/>
        <p>investors</p>
      </Row>
    </Row>
    <RangeSlider
      min={0}
      max={100}
      marks={SLIDER_MARKS}
      className={clsx(
        'mx-2 mb-10 mt-5 !h-1'
      )}
      lowValue={investorPortion}
      highValue={investorPortion + ammPortion}
      setValues={(low, high) => {
          setInvestorPortion(low)
          setAMMPortion(high - low)
      }}
    />
    <Row className="m-auto gap-5 justify-between">
    <Col>
      <p className="text-xs">Equity kept by founder</p>
      <p className="text-base font-bold">{100 - ammPortion - investorPortion}%</p>
    </Col>
    <Col>
      <p className="text-xs">Cost to seed AMM</p>
      <p className="text-base font-bold">{formatMoneyPrecise(initialValuation * ammPortion / 100)}</p>
    </Col>
    <Col>
      <p className="text-xs">Equity sold to investors</p>
      <p className="text-base font-bold">
        {investorPortion}%
      </p>
    </Col>
    <Col>
      <p className="text-xs">Initial valuation</p>
      <p className="text-base font-bold">
        {formatMoneyPrecise(initialValuation)}
      </p>
    </Col>
  </Row>
</Col>
  )
}
