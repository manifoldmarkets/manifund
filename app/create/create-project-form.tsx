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
import { InvestmentStructurePanel } from './investment-structure'
import { Tooltip } from '@/components/tooltip'
import { SiteLink } from '@/components/site-link'

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

export function CreateProjectForm(props: { causesList: MiniCause[] }) {
  const { causesList } = props
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number | null>(null)
  const [fundingGoal, setFundingGoal] = useState<number | null>(null)
  const [verdictDate, setVerdictDate] = useState(
    format(add(new Date(), { months: 1 }), 'yyyy-MM-dd')
  )
  const [locationDescription, setLocationDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedCauses, setSelectedCauses] = useState<MiniCause[]>([])
  const [applyingToManifold, setApplyingToManifold] = useState<boolean>(false)
  const [founderPortion, setFounderPortion] = useState<number>(50)
  const ammPortion = 10
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const editor = useTextEditor(DESCRIPTION_OUTLINE, DESCRIPTION_KEY)
  const minMinFunding = applyingToManifold ? 100 : 500

  let errorMessage = null
  if (title === '') {
    errorMessage = 'Your project needs a title.'
  } else if (minFunding === null) {
    errorMessage = 'Your project needs a minimum funding amount.'
  } else if (minFunding !== null && minFunding < minMinFunding) {
    errorMessage = `Your minimum funding must be at least $${minMinFunding}.`
  } else if (applyingToManifold && !agreedToTerms) {
    errorMessage = 'Please confirm that you agree to the investment structure.'
  } else if (
    fundingGoal &&
    !applyingToManifold &&
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
    const selectedCauseSlugs = selectedCauses.map((cause) => cause.slug)
    if (applyingToManifold) {
      selectedCauseSlugs.push('manifold-community')
    }
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
        funding_goal: fundingGoal ?? minFunding,
        founder_shares: applyingToManifold
          ? (founderPortion / 100) * TOTAL_SHARES
          : TOTAL_SHARES,
        // TODO: replace name if Austin has an alternative
        round: applyingToManifold ? 'Manifold Community Fund' : 'Regrants',
        auction_close: verdictDate,
        stage: 'proposal',
        type: applyingToManifold ? 'cert' : 'grant',
        causeSlugs: selectedCauseSlugs,
        amm_shares: applyingToManifold
          ? (ammPortion / 100) * TOTAL_SHARES
          : null,
        location_description: locationDescription,
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
      <Row className="items-center gap-1">
        <Checkbox
          checked={applyingToManifold}
          onChange={(event) => setApplyingToManifold(event.target.checked)}
        />
        <label className="ml-2 text-sm">
          I am applying to the{' '}
          <SiteLink
            href="/causes/manifold-community?tab=about"
            target="_blank"
            followsLinkClass
          >
            Manifold Markets Community Fund.
          </SiteLink>
        </label>
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
          least ${minMinFunding}.
        </p>
        <Col>
          <Input
            type="number"
            id="minFunding"
            autoComplete="off"
            value={minFunding !== null ? Number(minFunding).toString() : ''}
            onChange={(event) => setMinFunding(Number(event.target.value))}
            error={minFunding !== null && minFunding < minMinFunding}
            errorMessage={`Minimum funding must be at least $${minMinFunding}.`}
          />
        </Col>
      </Col>
      {applyingToManifold ? (
        <InvestmentStructurePanel
          minFunding={minFunding ?? 0}
          founderPortion={founderPortion}
          setFounderPortion={setFounderPortion}
          ammPortion={ammPortion}
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
        />
      ) : (
        <Col className="gap-1">
          <label htmlFor="fundingGoal">
            Funding goal (USD)
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            Until this amount is raised, the project will be marked for donors
            as not fully funded. If this amount is different from your minimum
            funding, please explain in your project description what you could
            accomplish with the minimum funding and what you could accomplish
            with the full funding.
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
      )}
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
      <Col className="gap-1">
        <label>International activities</label>
        <p className="text-sm text-gray-600">
          If any part of this project will happen outside of the US, or people
          working on the project are not US residents, please describe what will
          happen internationally and where. Only a sentence or two needed. (This
          is for Manifund operations, and will not be published.)
        </p>
        <Input
          type="text"
          value={locationDescription}
          onChange={(event) => setLocationDescription(event.target.value)}
        />
      </Col>
      <Tooltip text={errorMessage} className="mt-4 w-full">
        <Button
          type="submit"
          className="w-full"
          disabled={!!errorMessage}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Publish project
        </Button>
      </Tooltip>
    </Col>
  )
}
