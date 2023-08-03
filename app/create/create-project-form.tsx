'use client'

import { useSupabase } from '@/db/supabase-provider'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { TOTAL_SHARES } from '@/db/project'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/utils/use-text-editor'
import Link from 'next/link'
import { add, format, isAfter, isBefore } from 'date-fns'
import { Col } from '@/components/layout/col'
import { RequiredStar } from '@/components/tags'

const DEFAULT_DESCRIPTION = `
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

export function CreateProjectForm() {
  const { session } = useSupabase()
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [blurb, setBlurb] = useState<string>('')
  const [minFunding, setMinFunding] = useState<number | null>(null)
  const [fundingGoal, setFundingGoal] = useState<number | null>(null)
  const [verdictDate, setVerdictDate] = useState(
    format(add(new Date(), { months: 1 }), 'yyyy-MM-dd')
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const editor = useTextEditor(DEFAULT_DESCRIPTION)

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
      }),
    })
    const newProject = await response.json()
    router.push(`/projects/${newProject.slug}`)
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
        <label htmlFor="description">
          Description
          <RequiredStar />
        </label>
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
      <Col className="gap-1">
        <label htmlFor="fundingGoal">
          Funding goal (USD)
          <RequiredStar />
        </label>
        <p className="text-sm text-gray-600">
          Until this amount is raised, the project will be marked for donors as
          not fully funded.
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
        <label htmlFor="auction-close">
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
