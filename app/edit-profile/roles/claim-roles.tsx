'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Checkbox, Input } from '@/components/input'
import { toTitleCase } from '@/utils/formatting'
import clsx from 'clsx'
import Link from 'next/link'
import { ProfileRoles } from '@/db/profile'

function RoleInput(props: {
  label: string
  name: string
  // Value is null if the checkbox is unchecked; true or string if checked.
  value?: boolean | string | null
  onChange: (name: string, value: boolean | string | null) => void
  type: 'checkbox' | 'textarea'
  placeholder?: string
}) {
  const { label, name, value, onChange, type, placeholder } = props
  const DEFAULT_CHECK = type === 'checkbox' ? true : ''
  return (
    <div className="mb-4">
      <div className="flex flex-col">
        <label className="flex flex-row">
          <Checkbox
            checked={value !== null}
            onChange={(e) =>
              onChange(name, e.target.checked ? DEFAULT_CHECK : null)
            }
            className="mr-2"
          />
          <div>
            <span className="font-bold">{toTitleCase(name)}</span>
            <p>{label}</p>
          </div>
        </label>
      </div>

      {type === 'textarea' && value !== null && (
        <Input
          value={value as string}
          onChange={(e) => onChange(name, e.target.value)}
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

export function ClaimRoles(props: { profileRoles?: ProfileRoles }) {
  const { profileRoles } = props
  console.log('profileRoles', profileRoles)
  const [roles, setRoles] = useState({
    donor: profileRoles?.donor,
    organizer: profileRoles?.organizer,
    scholar: profileRoles?.scholar,
    volunteer: profileRoles?.volunteer,
    worker: profileRoles?.worker,
    senior: profileRoles?.senior,
    insider: profileRoles?.insider,
  })
  type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState<string>('')

  const handleChange = (name: string, value: boolean | string | null) => {
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
      console.log('Form submitted successfully:', data)
    } catch (error) {
      setSubmitState('error')
      console.error('Error submitting form:', error)
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const formUnfilled = Object.values(roles).some((role) => role === '')
  // Base is $100, +$100 for each role
  const totalGrant = (Object.values(roles).filter(Boolean).length + 1) * 100

  return (
    <form onSubmit={handleSubmit} className="m-6 space-y-8">
      <h1 className="mb-6 text-2xl font-bold">
        Select your EA community roles
      </h1>
      <div className="prose">
        Thanks for participating in{' '}
        <Link href="https://manifund.substack.com/p/announcing-the-200k-ea-community">
          EA Community Choice
        </Link>
        !
        <ul>
          <li>
            You get $100 to donate, plus $100 for each role you qualify for
            below
          </li>
          <li>
            Your responses below may be displayed publicly on your Manifund
            profile
          </li>
          <li>You can&apos;t update your responses once you submit</li>
          <li>
            Share EA Community Choice with other EAs!
            <ul>
              <li>(But please don&apos;t game the quadratic funding match)</li>
            </ul>
          </li>
        </ul>
      </div>
      <RoleInput
        label="I have taken the GWWC 🔸10% Pledge"
        name="donor"
        value={roles.donor}
        onChange={handleChange}
        type="checkbox"
      />
      <RoleInput
        label="I have organized an EA group"
        name="organizer"
        value={roles.organizer}
        onChange={handleChange}
        type="textarea"
        placeholder="Which group?"
      />
      <RoleInput
        label="I have 100 or more karma on the EA Forum"
        name="scholar"
        value={roles.scholar}
        onChange={handleChange}
        type="textarea"
        placeholder="Link to your EA Forum profile"
      />
      <RoleInput
        label="I have volunteered at an event for EAs like EAG(x), Future Forum, or Manifest"
        name="volunteer"
        value={roles.volunteer}
        onChange={handleChange}
        type="textarea"
        placeholder="Which event?"
      />
      <RoleInput
        label="I've worked fulltime at an EA org or on an EA grant"
        name="worker"
        value={roles.worker}
        onChange={handleChange}
        type="textarea"
        placeholder="What org or grant?"
      />
      <RoleInput
        label="I have done any of the above prior to 2022"
        name="senior"
        value={roles.senior}
        onChange={handleChange}
        type="textarea"
        placeholder="Which role(s) above?"
      />
      <RoleInput
        label="I had a Manifund account before August 2024"
        name="insider"
        value={roles.insider}
        onChange={handleChange}
        type="checkbox"
      />
      {submitState === 'error' && (
        <div className="mt-4 text-red-500">{message}</div>
      )}
      {submitState === 'success' && (
        <div className="mt-4 text-green-500">
          Roles submitted successfully! You can now use your funds to donate.
        </div>
      )}
      {/* Show submit button if profileRoles is undefined aka not already claimed */}
      {profileRoles ? (
        <div>You&apos;ve claimed ${totalGrant} to donate!</div>
      ) : (
        <Button
          type="submit"
          disabled={formUnfilled || submitState === 'submitting'}
          className="w-full"
        >
          {submitState === 'submitting'
            ? 'Submitting...'
            : `Claim $${totalGrant}`}
        </Button>
      )}
    </form>
  )
}
