'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Checkbox, Input } from '@/components/input'
import { toTitleCase } from '@/utils/formatting'
import clsx from 'clsx'
import Link from 'next/link'
import { ProfileRoles } from '@/db/profile'
import { useRouter } from 'next/navigation'
import AlertBox from '@/components/alert-box'

function RoleInput(props: {
  label: string
  name: string
  handleChange: (name: string, value: boolean | string | undefined) => void
  // Value is undefined if the checkbox is unchecked; true or string if checked.
  value?: boolean | string | undefined
  type: 'checkbox' | 'textarea'
  placeholder?: string
  disabled?: boolean
}) {
  const { label, name, handleChange, value, type, placeholder, disabled } = props
  const DEFAULT_CHECK = type === 'checkbox' ? true : ''
  return (
    <div className="mb-4">
      <div className="flex flex-col">
        <label className="flex flex-row">
          <Checkbox
            checked={value !== undefined}
            disabled={disabled}
            onChange={(e) => handleChange(name, e.target.checked ? DEFAULT_CHECK : undefined)}
            className="mr-2"
          />
          <div>
            <span className="font-bold">{toTitleCase(name)}</span>
            <p className="text-gray-600">{label}</p>
          </div>
        </label>
      </div>

      {type === 'textarea' && value !== undefined && (
        <Input
          value={value as string}
          onChange={(e) => handleChange(name, e.target.value)}
          disabled={disabled}
          className={clsx(
            'mt-1 w-full rounded border p-2',
            value === '' && 'border-2 border-red-500'
          )}
          placeholder={placeholder ?? `Provide details about your ${name} role`}
        />
      )}
    </div>
  )
}

export function ClaimRoles(props: {
  // If provided, indicates that the user already claimed roles
  profileRoles?: ProfileRoles
}) {
  const { profileRoles } = props
  const [roles, setRoles] = useState({
    donor: profileRoles?.donor || undefined,
    organizer: profileRoles?.organizer || undefined,
    scholar: profileRoles?.scholar || undefined,
    volunteer: profileRoles?.volunteer || undefined,
    worker: profileRoles?.worker || undefined,
    senior: profileRoles?.senior || undefined,
    insider: profileRoles?.insider || undefined,
  })

  const formUnfilled = Object.values(roles).some((role) => role === '')
  // Base is $100, +$100 for each role
  const totalGrant = (Object.values(roles).filter(Boolean).length + 1) * 100

  type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState<string>('')

  const router = useRouter()

  const handleChange = (name: string, value: boolean | string | undefined) => {
    setRoles((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitState('submitting')

    try {
      const response = await fetch('/api/submit-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roles),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit roles')
      }

      const data = await response.json()
      setSubmitState('success')
      setMessage(data.message)
      // Refresh the page
      router.refresh()
    } catch (error) {
      setSubmitState('error')
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="m-6 space-y-8">
      <h1 className="mb-6 text-2xl font-bold">EA Community Roles</h1>
      <div className="prose rounded-lg bg-gray-200 p-4">
        <AlertBox title="Update 2024-08-21, 17:00 PT: Funds paused">
          We&apos;ve sent out the initial $100k in funds! We&apos;re happy there&apos;s so much
          interest, but are now pausing new claims while trying to fundraise for more.
          <br />
          <br />
          Join{' '}
          <Link href="https://airtable.com/appucH86FmSMha33p/pag9fHXZoBXj61ZIN/form">
            the waitlist
          </Link>{' '}
          to be notified if & when we receive more funding, or email{' '}
          <a href="mailto:austin@manifund.org">austin@manifund.org</a> if you know someone might
          contribute!
        </AlertBox>
        <br />
        <br />
        Thanks for participating in{' '}
        <Link href="https://manifund.substack.com/p/announcing-the-200k-ea-community">
          EA Community Choice
        </Link>
        !
        <ul>
          <li>You get $100 to donate, plus $100 for each role you qualify for below</li>
          <li>Your responses below may be displayed publicly on your Manifund profile</li>
          <li>You can&apos;t update your responses once you submit</li>
          <li>
            Please share EA Community Choice with other EAs!
            <ul>
              <li>(But please don&apos;t game the quadratic funding match)</li>
            </ul>
          </li>
          <li>
            Other questions? Ask us on <Link href="https://discord.gg/ZGsDMWSA5Q">Discord</Link>!
          </li>
        </ul>
      </div>
      <RoleInput
        label="I have taken the GWWC 🔸10% Pledge"
        name="donor"
        value={roles.donor}
        type="checkbox"
        handleChange={handleChange}
        disabled={!!profileRoles}
      />
      <RoleInput
        label="I have organized an EA group"
        name="organizer"
        value={roles.organizer}
        type="textarea"
        handleChange={handleChange}
        disabled={!!profileRoles}
        placeholder="Which group?"
      />
      <RoleInput
        label="I have 100 or more karma on the EA Forum"
        name="scholar"
        value={roles.scholar}
        type="textarea"
        handleChange={handleChange}
        disabled={!!profileRoles}
        placeholder="Link to your EA Forum profile eg https://forum.effectivealtruism.org/users/..."
      />
      <RoleInput
        label="I have volunteered at an event for EAs like EAG(x), Future Forum, or Manifest"
        name="volunteer"
        value={roles.volunteer}
        type="textarea"
        handleChange={handleChange}
        disabled={!!profileRoles}
        placeholder="Which event?"
      />
      <RoleInput
        label="I've worked fulltime at an EA org or on an EA grant"
        name="worker"
        value={roles.worker}
        type="textarea"
        handleChange={handleChange}
        disabled={!!profileRoles}
        placeholder="What org or grant?"
      />
      <RoleInput
        label="I have done any of the above prior to 2022"
        name="senior"
        value={roles.senior}
        type="textarea"
        handleChange={handleChange}
        disabled={!!profileRoles}
        placeholder="Which role(s) above?"
      />
      <RoleInput
        label="I had a Manifund account before August 2024"
        name="insider"
        value={roles.insider}
        type="checkbox"
        handleChange={handleChange}
        disabled={!!profileRoles}
      />
      {submitState === 'error' && <div className="mt-4 text-red-500">{message}</div>}
      {profileRoles ? (
        <div className="mt-4 italic text-orange-600">
          You&apos;ve claimed ${totalGrant}. Now browse the{' '}
          <Link className="underline" href="/causes/ea-community-choice">
            EA Community Choice projects
          </Link>{' '}
          and start donating!
        </div>
      ) : (
        <Button
          type="submit"
          // disabled={formUnfilled || submitState === 'submitting'}
          disabled={true}
          className="w-full"
        >
          {submitState === 'submitting'
            ? 'Submitting...'
            : formUnfilled
              ? 'Fill in all fields'
              : `Claim $${totalGrant} to donate`}
        </Button>
      )}
    </form>
  )
}
