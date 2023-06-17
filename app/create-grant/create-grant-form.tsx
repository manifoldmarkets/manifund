'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { useEffect, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import { MiniProfile } from '@/db/profile'
import { Row } from '@/components/layout/row'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { InfoTooltip } from '@/components/info-tooltip'

const DESCRIPTION_OUTLINE = `
<h3>Project summary</h3>
</br>
<h3>Project goals</h3>
</br>
<h3>How will this funding be used?</h3>
</br>
<h3>How could this project be actively harmful?</h3>
</br>
<h3>What other funding is this person or project getting?</h3>
</br>
`

const REASONING_OUTLINE = `
<h3>Main points in favor of this grant</h3>
</br>
<h3>Donor's main reservations</h3>
</br>
<h3>Process for deciding amount</h3>
</br>
<h3>Conflicts of interest</h3>
<p>Please disclose e.g. any romantic, professional, financial, housemate, or familial relationships you have with the grant recipient(s).</p>
</br>
`

export function CreateGrantForm(props: {
  profiles: MiniProfile[]
  regranterSpendableFunds: number
}) {
  const { profiles, regranterSpendableFunds } = props
  const [query, setQuery] = useState('')
  const filteredProfiles =
    query === ''
      ? profiles
      : profiles.filter((profile) => {
          return (
            profile.full_name.toLowerCase().includes(query.toLowerCase()) ||
            profile.username.toLowerCase().includes(query.toLowerCase())
          )
        })
  const [recipientFullName, setRecipientFullName] = useState('')
  const [recipientOnManifund, setRecipientOnManifund] = useState(false)
  const [recipient, setRecipient] = useState<MiniProfile | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [fundingOption, setFundingOption] = useState('fullyFund')
  const [donorContribution, setDonorContribution] = useState(0)
  const [fundingGoal, setFundingGoal] = useState(0)
  const [minFunding, setMinFunding] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const descriptionEditor = useTextEditor(DESCRIPTION_OUTLINE)
  const reasoningEditor = useTextEditor(REASONING_OUTLINE)
  const router = useRouter()

  const fundingOptions = {
    fullyFund: 'be fully funded',
    moreRoom: 'have room for more funding',
    needsMore: 'need more funding',
  }

  let recipientDoesExistError = false
  useEffect(() => {
    if (!recipientOnManifund) {
      if (
        profiles.find(
          (profile) =>
            profile.full_name === recipientFullName && recipientFullName !== ''
        )
      ) {
        recipientDoesExistError = true
      } else {
        recipientDoesExistError = false
      }
    } else {
      setRecipient(
        profiles.find((profile) => profile.full_name === recipientFullName) ??
          null
      )
      recipientDoesExistError = false
    }
  }, [recipientFullName, recipientOnManifund])

  useEffect(() => {
    if (fundingOption === 'fullyFund') {
      setFundingGoal(donorContribution)
      setMinFunding(donorContribution)
    } else if (fundingOption === 'moreRoom') {
      setMinFunding(donorContribution)
    }
  }, [fundingOption, donorContribution])

  let errorMessage = null
  if (!recipientOnManifund && !recipientFullName) {
    errorMessage = 'Please enter the name of the recipient.'
  } else if (!recipientOnManifund && !recipientEmail) {
    errorMessage = 'Please enter the email address of the recipient.'
  } else if (recipientOnManifund && recipient === null) {
    errorMessage = 'Please select the recipient.'
  } else if (!title) {
    errorMessage = 'Please enter a title for your grant.'
  } else if (donorContribution <= 0) {
    errorMessage = 'Please enter a positive donation amount.'
  } else if (minFunding <= 0) {
    errorMessage = 'Please enter a positive minimum funding amount.'
  } else if (
    fundingOption !== 'fullyFund' &&
    fundingGoal <= donorContribution
  ) {
    errorMessage =
      'The funding goal must be greater than your contribution. Otherwise, indicate that the project will be fully funded.'
  } else if (fundingOption === 'needsMore' && fundingGoal <= minFunding) {
    errorMessage = 'The funding goal must be greater than the minimum funding.'
  } else if (fundingOption === 'needsMore' && minFunding <= donorContribution) {
    errorMessage =
      'The minimum funding must be greater than your contribution. Otherwise, indicate that the project does not need more funding.'
  } else if (regranterSpendableFunds < donorContribution) {
    errorMessage = `You currently have $${regranterSpendableFunds} to give away. If you'd like to give a larger grant, you can add money to your account or raise more funds from other users on Manifund.`
  } else if (!agreedToTerms) {
    errorMessage =
      'Please confirm that you understand and agree to the terms of giving this grant.'
  } else {
    errorMessage = null
  }
  return (
    <Col className="gap-5 p-4">
      <div>
        <h1 className="text-2xl font-bold">Create grant</h1>
        <p className="my-1 text-sm text-gray-600">
          Use this form to give a grant for a project that is not already posted
          on Manifund. Note that all grants are public.
        </p>
        <p className="my-1 text-sm text-gray-600">
          We expect this writeup to take 0.5-2 hours, and ask that you take less
          time and include fewer details for small grants and spend more time
          and include more details for large grants.
        </p>
      </div>
      <Row
        className={clsx(
          recipientDoesExistError
            ? 'rounded-md border-2 border-rose-500 bg-rose-100 p-1'
            : ''
        )}
      >
        <Row className="h-6 items-center">
          <input
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
            checked={recipientOnManifund}
            onChange={() => setRecipientOnManifund(!recipientOnManifund)}
          />
        </Row>
        <span className="ml-2 leading-6 text-gray-900">
          Recipient is already a user on Manifund.
        </span>
      </Row>
      {!recipientOnManifund && (
        <>
          <Col className="gap-1">
            <label htmlFor="recipientFullName">Recipient full name</label>
            <Input
              type="text"
              id="recipientFullName"
              value={recipientFullName}
              onChange={(event) => setRecipientFullName(event.target.value)}
            />
            {recipientDoesExistError && (
              <p className="text-sm text-rose-500">
                This person is already a user on Manifund.
              </p>
            )}
          </Col>
          <Col className="gap-1">
            <label htmlFor="recipientEmail">Recipient email</label>
            <Input
              type="text"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
            />
          </Col>
        </>
      )}
      {recipientOnManifund && (
        <Col className="gap-1">
          <label>Recipient</label>
          <Combobox as="div" value={recipient} onChange={setRecipient}>
            <div className="relative">
              <Combobox.Input
                className="invalid:border-scarlet-500 invalid:text-scarlet-900 invalid:placeholder-scarlet-300 h-12 w-full rounded-md border border-gray-300 bg-white px-4 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(profile: MiniProfile | null) =>
                  profile?.full_name ?? ''
                }
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
              {filteredProfiles.length > 0 && (
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredProfiles.map((profile) => (
                    <Combobox.Option
                      key={profile.username}
                      value={profile}
                      className={({ active }) =>
                        clsx(
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                          active ? 'bg-orange-500 text-white' : 'text-gray-900'
                        )
                      }
                    >
                      {({ active, selected }) => (
                        <>
                          <Row className="gap-2">
                            <Avatar
                              avatarUrl={profile.avatar_url}
                              username={profile.username}
                              size={'xs'}
                              className="relative bottom-0.5"
                            />
                            <span
                              className={clsx(
                                'truncate',
                                selected && 'font-semibold'
                              )}
                            >
                              {profile.full_name}
                            </span>
                            <span
                              className={clsx(
                                'truncate text-gray-500',
                                active ? 'text-orange-100' : 'text-gray-500'
                              )}
                            >
                              @{profile.username}
                            </span>
                          </Row>

                          {selected && (
                            <span
                              className={clsx(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active ? 'text-white' : 'text-orange-500'
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>
        </Col>
      )}
      <Col className="gap-1">
        <label htmlFor="title">Title</label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="subtitle">Subtitle</label>
        <Input
          type="text"
          id="subtitle"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label>After recieving this grant, this project will...</label>
        <HorizontalRadioGroup
          value={fundingOption}
          onChange={(event) => setFundingOption(event)}
          options={fundingOptions}
          wide
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="donorContribution">Your contribution (USD)</label>
        <Input
          type="number"
          id="donorContribution"
          value={donorContribution}
          onChange={(event) => setDonorContribution(Number(event.target.value))}
        />
      </Col>
      {fundingOption !== 'fullyFund' && (
        <Col className="gap-1">
          <label htmlFor="amount">
            Funding goal (USD){' '}
            <InfoTooltip
              text="This will be displayed as the funding goal so other donors know their contributions are valuable.
"
            />
          </label>
          <Input
            type="number"
            id="fundingGoal"
            value={fundingGoal}
            onChange={(event) => setFundingGoal(Number(event.target.value))}
          />
        </Col>
      )}
      {fundingOption === 'needsMore' && (
        <Col className="gap-1">
          <label htmlFor="amount">
            Minimum funding (USD){' '}
            <InfoTooltip text="The project will not become active, and no funds will be transferred, until this minimum funding bar is met through your donations and others." />
          </label>
          <Input
            type="number"
            id="minFunding"
            value={minFunding}
            onChange={(event) => setMinFunding(Number(event.target.value))}
          />
        </Col>
      )}
      <Col className="gap-1">
        <label>Project description</label>
        <p className="text-sm text-gray-500">
          This will be displayed as the public description of this project, but
          can be edited by the grant recipient. In this section, please describe
          in objective terms the nature of the project.
        </p>
        <TextEditor editor={descriptionEditor} />
      </Col>
      <Col className="gap-1">
        <label>Grantmaker notes & reasoning</label>
        <p className="text-sm text-gray-500">
          This will be displayed as a public comment on this project. In this
          section, please describe in subjective terms why you are excited to
          fund this project.
        </p>
        <TextEditor editor={reasoningEditor} />
      </Col>
      <Row>
        <Row className="h-6 items-center">
          <input
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
          />
        </Row>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            Check this box to confirm:
          </label>{' '}
          <span id="terms-description" className="text-gray-500">
            all information provided is true and accurate to the best of my
            knowledge. This project is not-for-profit and not part of a
            political campaign. I understand that all of my answers here will be
            publicly accessible on Manifund.
          </span>
        </div>
      </Row>
      <p className="text-center text-rose-500">{errorMessage}</p>
      <Button
        type="submit"
        className="mt-4 w-full"
        disabled={errorMessage !== null}
        loading={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true)
          const description = descriptionEditor?.getJSON()
          const donorNotes = reasoningEditor?.getJSON()
          const response = await fetch('/api/create-grant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              subtitle,
              description,
              donorNotes,
              donorContribution,
              fundingGoal,
              minFunding,
              toEmail: recipientOnManifund ? undefined : recipientEmail,
              toUsername: recipientOnManifund ? recipient?.username : undefined,
            }),
          })
          const newProject = await response.json()
          setIsSubmitting(false)
          router.push(`/projects/${newProject.slug}`)
        }}
      >
        Create grant
      </Button>
    </Col>
  )
}
