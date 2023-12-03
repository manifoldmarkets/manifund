'use client'

import { useSupabase } from '@/db/supabase-provider'
import { useEffect, useState } from 'react'
import { Input } from '@/components/input'
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
import { Cause, CertParams, MiniCause } from '@/db/cause'
import { SelectCauses } from '@/components/select-causes'
import { InvestmentStructurePanel } from './investment-structure'
import { Tooltip } from '@/components/tooltip'
import { SiteLink } from '@/components/site-link'
import { toTitleCase } from '@/utils/formatting'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { Checkbox } from '@/components/input'

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

export function CreateProjectForm(props: { causesList: Cause[] }) {
  const { causesList } = props
  const { session } = useSupabase()
  const router = useRouter()
  const selectablePrizeCauses = causesList.filter(
    (cause) => cause.open && cause.prize
  )
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number | null>(null)
  const [fundingGoal, setFundingGoal] = useState<number | null>(null)
  const [verdictDate, setVerdictDate] = useState(
    format(add(new Date(), { months: 1 }), 'yyyy-MM-dd')
  )
  const [locationDescription, setLocationDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const selectableCauses = causesList.filter(
    (cause) => cause.open && !cause.prize
  )
  const [selectedCauses, setSelectedCauses] = useState<MiniCause[]>([])
  const [selectedPrize, setSelectedPrize] = useState<Cause | null>(null)
  const [founderPercent, setFounderPercent] = useState<number>(50)
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const [agreeToChinatalkTerms, setAgreeToChinatalkTerms] =
    useState<boolean>(false)
  const editor = useTextEditor(DESCRIPTION_OUTLINE, DESCRIPTION_KEY)
  const chinatalkPrizeSelected = selectedPrize?.slug === 'china-talk'

  useEffect(() => {
    setFounderPercent(
      (1 -
        (selectedPrize?.cert_params?.defaultInvestorShares ?? 0) /
          TOTAL_SHARES) *
        100
    )
    editor?.commands.setContent(
      selectedPrize?.project_description_outline ?? DESCRIPTION_OUTLINE
    )
  }, [selectedPrize])
  const minMinFunding = selectedPrize?.cert_params
    ? selectedPrize.cert_params.minMinFunding
    : 500

  let errorMessage = null
  if (title === '') {
    errorMessage = 'Your project needs a title.'
  } else if (
    minFunding === null &&
    (!selectedPrize || selectedPrize.cert_params?.proposalPhase)
  ) {
    errorMessage = 'Your project needs a minimum funding amount.'
  } else if (
    minFunding !== null &&
    minFunding < minMinFunding &&
    (!selectedPrize || selectedPrize.cert_params?.proposalPhase)
  ) {
    errorMessage = `Your minimum funding must be at least $${minMinFunding}.`
  } else if (
    selectedPrize &&
    selectedPrize.cert_params?.adjustableInvestmentStructure &&
    !agreedToTerms
  ) {
    errorMessage = 'Please confirm that you agree to the investment structure.'
  } else if (
    fundingGoal &&
    !selectedPrize &&
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
  } else if (
    (!selectedPrize || selectedPrize.cert_params?.proposalPhase) &&
    !verdictDate
  ) {
    errorMessage = 'You need to set a decision deadline.'
  } else if (chinatalkPrizeSelected && !agreeToChinatalkTerms) {
    errorMessage = "You must agree to Chinatalk's terms and conditions."
  } else {
    errorMessage = null
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const description = editor?.getJSON() ?? '<p>No description</p>'
    const selectedCauseSlugs = selectedCauses.map((cause) => cause.slug)
    if (!!selectedPrize) {
      selectedCauseSlugs.push(selectedPrize.slug)
    }
    const seedingAmm =
      selectedPrize &&
      !!selectedPrize.cert_params?.ammShares &&
      (agreedToTerms ||
        selectedPrize.cert_params?.adjustableInvestmentStructure)
    const response = await fetch('/api/create-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        blurb,
        description,
        min_funding: minFunding ?? 0,
        funding_goal: fundingGoal ?? minFunding ?? 0,
        founder_shares: !!selectedPrize
          ? (founderPercent / 100) * TOTAL_SHARES
          : TOTAL_SHARES,
        // TODO: deprecate rounds completely
        round: !!selectedPrize ? toTitleCase(selectedPrize.title) : 'Regrants',
        auction_close: verdictDate,
        stage:
          selectedPrize && !selectedPrize.cert_params?.proposalPhase
            ? 'active'
            : 'proposal',
        type: !!selectedPrize ? 'cert' : 'grant',
        amm_shares: seedingAmm ? selectedPrize.cert_params?.ammShares : null,
        location_description: locationDescription,
        causeSlugs: selectedCauseSlugs,
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
    <Col className="gap-4 p-5">
      <div className="flex flex-col md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold">Add a project</h1>
      </div>
      <Col className="gap-1">
        <label>I am applying for...</label>
        <p className="text-sm text-gray-600">
          Select &quot;a regular grant&quot; by default. The other options are
          specific prizes that you can learn more about{' '}
          <SiteLink followsLinkClass href="/causes">
            here
          </SiteLink>
          .
        </p>
        <HorizontalRadioGroup
          value={selectedPrize?.slug ?? 'grant'}
          onChange={(value) =>
            setSelectedPrize(
              value === 'grant'
                ? null
                : selectablePrizeCauses.find((cause) => cause.slug === value) ??
                    null
            )
          }
          options={{
            grant: 'A regular grant',
            ...Object.fromEntries(
              selectablePrizeCauses.map((cause) => [cause.slug, cause.title])
            ),
          }}
        />
      </Col>
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
            defaultContent={
              selectedPrize?.project_description_outline ?? DESCRIPTION_OUTLINE
            }
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
      {(!selectedPrize || selectedPrize.cert_params?.proposalPhase) && (
        <Col className="gap-1">
          <label htmlFor="minFunding" className="mr-3 mt-4">
            Minimum funding (USD)
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            The minimum amount of funding you need to start this project. If
            this amount is not reached, no funds will be sent. Due to the cost
            of approving grants and processing payments, we require this to be
            at least ${minMinFunding}.
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
      )}
      {!!selectedPrize ? (
        <InvestmentStructurePanel
          minFunding={minFunding ?? 0}
          founderPercent={founderPercent}
          setFounderPercent={setFounderPercent}
          certParams={selectedPrize?.cert_params as CertParams}
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
      {(!selectedPrize || selectedPrize.cert_params?.proposalPhase) && (
        <Col className="gap-1">
          <label>
            Decision deadline
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            After this deadline, if you have not reached your minimum funding
            bar, your application will close and you will not recieve any money.
            This date cannot be more than 6 weeks after posting.
          </p>
          <Input
            type="date"
            value={verdictDate ?? ''}
            onChange={(event) => setVerdictDate(event.target.value)}
          />
        </Col>
      )}
      <Col className="gap-1">
        <label>Cause areas</label>
        <SelectCauses
          causesList={selectableCauses}
          selectedCauses={selectedCauses}
          setSelectedCauses={setSelectedCauses}
        />
      </Col>

      <Col className="gap-1">
        <label>
          In what countries are you and anyone else working on this located?
        </label>
        <p className="text-sm text-gray-600">
          This is for Manifund operations and will not be published.
        </p>
        <Input
          type="text"
          value={locationDescription}
          onChange={(event) => setLocationDescription(event.target.value)}
        />
      </Col>

      {/* Custom for Chinatalk: confirm terms & conditions */}
      {chinatalkPrizeSelected && (
        <Row className="mt-5 items-start">
          <Checkbox
            checked={agreeToChinatalkTerms}
            onChange={(event) => setAgreeToChinatalkTerms(event.target.checked)}
          />
          <RequiredStar />
          <span className="ml-3 leading-tight">
            <span className="text-sm font-bold text-gray-900">
              I agree to the{' '}
              <SiteLink
                href="https://www.chinatalk.info/essay"
                className="text-orange-500 hover:text-orange-600"
              >
                terms and conditions
              </SiteLink>{' '}
              of the Chinatalk Essay Competition.
            </span>
          </span>
        </Row>
      )}

      <Tooltip text={errorMessage}>
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
