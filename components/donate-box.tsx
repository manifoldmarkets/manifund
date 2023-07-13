'use client'
import { WriteComment } from '@/app/projects/[slug]/comments'
import { Button, IconButton } from '@/components/button'
import { Card } from '@/components/card'
import { Input } from '@/components/input'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { XCircleIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTextEditor } from './editor'
import { Col } from './layout/col'
import { Row } from './layout/row'
import { Modal } from './modal'
import { Tooltip } from './tooltip'

export function DonateBox(props: {
  charity?: Profile
  project?: Project
  profile: Profile
  maxDonation: number
}) {
  const { charity, project, profile, maxDonation } = props
  const [amount, setAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCommentPrompt, setShowCommentPrompt] = useState(false)
  const router = useRouter()
  const isBid = project && project.stage === 'proposal'

  let errorMessage = null
  if (amount && amount > maxDonation) {
    errorMessage = `You don't have enough funds to donate $${amount}. You can donate up to $${maxDonation}.`
  } else if (amount && amount < 10) {
    errorMessage = `You must donate at least $10.`
  }
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-lg font-bold">
          {isBid ? 'Offer to donate' : 'Donate'}
        </h2>
        {isBid && (
          <p className="text-sm text-gray-500">
            You are offering to donate this amount to the project on the
            condition that it eventually becomes active. Otherwise, your funds
            will remain in your Manifund account.
          </p>
        )}
        {charity?.type === 'individual' && (
          <p className="text-sm text-gray-500">
            You are donating to this user&apos;s regranting budget, which is not
            withdrawable.
          </p>
        )}
      </div>
      <Row className="items-center justify-between gap-2">
        <Input
          type="number"
          id="amount"
          autoComplete="off"
          value={amount !== 0 ? amount : ''}
          placeholder="Amount (USD)"
          onChange={(event) => setAmount(Number(event.target.value))}
          className="w-48 max-w-full"
        />
        <Tooltip text={errorMessage ?? ''}>
          <Button
            onClick={async () => {
              setIsSubmitting(true)
              if (project && project.stage === 'proposal') {
                await fetch('/api/place-bid', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    projectId: project.id,
                    valuation: 0,
                    amount,
                    type: 'donate',
                  }),
                })
              } else if (project || charity) {
                await fetch('/api/transfer-money', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    fromId: profile.id,
                    toId: charity?.id ?? project?.creator,
                    amount,
                    projectId: project?.id,
                  }),
                })
              }
              setIsSubmitting(false)
              router.refresh()
              setShowCommentPrompt(true)
            }}
            className="font-semibold"
            disabled={!amount || errorMessage !== null}
            loading={isSubmitting}
          >
            Donate
          </Button>
        </Tooltip>
      </Row>
      {project && showCommentPrompt && (
        <Col className="rounded bg-orange-100 p-4">
          <Row className="justify-between">
            <p className="font-medium text-orange-500">
              Comment explaining your donation!
            </p>
            <IconButton
              className="relative bottom-3 left-4"
              onClick={() => setShowCommentPrompt(false)}
            >
              <XCircleIcon className="h-7 w-7 text-orange-500" />
            </IconButton>
          </Row>
          <WriteComment
            project={project}
            commenter={profile}
            onSubmit={() => setShowCommentPrompt(false)}
          />
        </Col>
      )}
    </Card>
  )
}
