'use client'

import { useSupabase } from '@/db/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { Profile } from '@/db/profile'
import uuid from 'react-uuid'
import Image from 'next/image'
import { SUPABASE_BUCKET_URL } from '@/db/env'
import { TextEditor, useTextEditor } from '@/components/editor'
import clsx from 'clsx'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase, session } = useSupabase()
  const [username, setUsername] = useState<string>(profile.username)
  const [bio, setBio] = useState<string>(profile.bio)
  const [website, setWebsite] = useState<string | null>(profile.website)
  const [fullName, setFullName] = useState<string>(profile.full_name)
  const editor = useTextEditor(profile.long_description)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [regranterStatus, setRegranterStatus] = useState(
    profile.regranter_status
  )
  const router = useRouter()

  const user = session?.user
  const isNewUser = username === user?.id
  // Grab fullname from Google signups
  if (isNewUser && user?.user_metadata.full_name) {
    const googleFullname = user.user_metadata.full_name
    // Remove nonword characters from name
    const newUsername = googleFullname.replace(/\W/g, '')
    setUsername(newUsername)
    setFullName(googleFullname)
    // Just save their profile now, in the background.
    /* no await */ saveProfile(
      {
        ...profile,
        username: newUsername,
        full_name: googleFullname,
      },
      avatar,
      supabase
    )
    // TODO: Upload their avatar from user.user_metadata.avatar_url
  }
  // Otherwise, if they signed in with email, use that for their name
  else if (isNewUser && user?.email) {
    const email = user.email
    setUsername(email.replace(/\W/g, ''))
    setFullName(email.split('@')[0])
  }

  let errorMessage = null
  if (!fullName) {
    errorMessage = 'Please enter your full name.'
  } else if (regranterStatus) {
    if (!bio) {
      errorMessage =
        'Please enter a bio. As a regranter, this will be shown in your profile preview.'
    }
    if (!avatar && !profile.avatar_url) {
      errorMessage =
        'Please upload an avatar. As a regranter, this will be shown in your profile preview.'
    }
  } else {
    errorMessage = null
  }

  return (
    <Col className="gap-4 p-4">
      <Col className="gap-1">
        <label htmlFor="username">Username</label>
        <Input
          type="text"
          id="username"
          autoComplete="off"
          required
          value={username ? username : ''}
          onChange={(event) => setUsername(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="full_name">Full, legal name</label>
        <Input
          type="text"
          id="full_name"
          autoComplete="off"
          required
          value={fullName ? fullName : ''}
          onChange={(event) => setFullName(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="bio">Bio</label>
        <Input
          type="text"
          id="bio"
          autoComplete="off"
          required
          value={bio ? bio : ''}
          onChange={(event) => setBio(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="website">
          Website (e.g. LinkedIn, Twitter, personal website)
        </label>
        {regranterStatus && (
          <p className="text-sm text-gray-500">
            We strongly recommend regranters add a website here. This will be
            shown in your profile preview.
          </p>
        )}
        <Input
          type="text"
          id="website"
          autoComplete="off"
          required
          value={website ? website : ''}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="long_description">About you</label>
        {regranterStatus && (
          <p className="text-sm text-gray-500">
            We stongly recommend regranters include key information about their
            background, values, cause prioritization, and grant-making history
            to help potential grantees and donors.
          </p>
        )}
        <TextEditor editor={editor} />
      </Col>
      <Col className="gap-1">
        <label htmlFor="regranterStatus">Regranter status</label>
        <div className="rounded-md border border-gray-300 bg-white p-5 shadow-md">
          <Row className="w-full justify-between">
            <p className="font-medium">
              {regranterStatus ? 'Regranter' : 'Non-regranter'}
            </p>
            <button
              type="button"
              id="regranterStatus"
              className={clsx(
                'relative mb-3 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2' +
                  (regranterStatus ? ' bg-orange-500' : ' bg-gray-200'),
                'focus:ring-offset-gray-100'
              )}
              role="switch"
              aria-checked="false"
              onClick={() =>
                setRegranterStatus((regranterStatus) => !regranterStatus)
              }
            >
              <span className="sr-only">Use auction</span>
              <span
                aria-hidden="true"
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  regranterStatus ? 'translate-x-5' : 'translate-x-0'
                )}
              ></span>
            </button>
          </Row>
          {regranterStatus ? (
            <div className="mt-3 rounded-md bg-emerald-100 p-3 text-center text-emerald-600">
              You will be listed as a regranter. Other users will be able to
              transfer funds to you, and you will be expected to regrant those
              funds to other projects, including projects not listed on
              Manifund, to the best of your ability.
            </div>
          ) : (
            <div className="mt-3 rounded-md bg-rose-100 p-3 text-center text-rose-600">
              You will not be listed as a regranter. You can still give to
              projects listed on Manifund, but cannot create grants for projects
              not listed on Manifund.
            </div>
          )}
        </div>
      </Col>
      <Col className="gap-1">
        <label>Investor status</label>
        <div className="rounded-md border border-gray-300 bg-white p-5 shadow-md">
          <p className="font-medium">
            {profile.accreditation_status ? 'Accredited' : 'Not Accredited'}
          </p>
          {profile.accreditation_status ? (
            <div className="mt-3 rounded-md bg-emerald-100 p-3 text-center text-emerald-600">
              You can invest in impact certificates with real money and withdraw
              your profits.
            </div>
          ) : (
            <div className="mt-3 rounded-md bg-rose-100 p-3 text-center text-rose-600">
              You can invest in impact certificates with money in your Manifund
              account, grow your portfolio, and donate your balance to real
              charities, but you cannot withdraw your money. Deposits to your
              Manifund account are tax-deductible donations, which is not true
              of accredited investors. If you want to withdraw your profits, you
              will need to fill out{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://airtable.com/shrZVLeo6f34NBfR0"
                className="font-bold hover:underline"
              >
                this form
              </a>{' '}
              to get verified as an accredited investor.
              <br />
              <br />
              <p className="font-bold">
                You need to hold $0 on your Manifund account to be verified as
                an accredited investor.
              </p>
            </div>
          )}
        </div>
      </Col>
      <label htmlFor="avatar">Choose a profile picture:</label>
      <div className="flex space-x-2">
        <div className="h-24 w-24">
          {avatar ? (
            <Image
              width={24}
              height={24}
              className="my-0 h-24 w-24 max-w-[6-rem] flex-shrink-0 rounded-full bg-white object-cover"
              src={URL.createObjectURL(avatar)}
              alt="Your new avatar"
            />
          ) : (
            <Avatar
              username={profile.username}
              avatarUrl={profile.avatar_url}
              noLink
              size={24}
            />
          )}
        </div>
      </div>
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg"
        onChange={(event) => {
          setAvatar(event.target.files ? event.target.files[0] : null)
        }}
      ></input>
      <p className="text-center text-rose-500">{errorMessage}</p>
      <Button
        type="submit"
        disabled={errorMessage !== null}
        loading={submitting}
        className="max-w-xs"
        onClick={async () => {
          setSubmitting(true)
          await saveProfile(
            {
              ...profile,
              username,
              bio,
              long_description: editor?.getJSON() ?? null,
              website,
              full_name: fullName,
              regranter_status: regranterStatus,
            },
            avatar,
            supabase
          )
          setSubmitting(false)
          router.push(`/${username}`)
        }}
      >
        Save
      </Button>
    </Col>
  )
}

async function saveProfile(
  new_profile: Profile,
  avatar: File | null,
  supabase: SupabaseClient
) {
  let avatarUrl = new_profile.avatar_url
  if (avatar) {
    const avatarSlug = uuid()
    avatarUrl = `${SUPABASE_BUCKET_URL}/storage/v1/object/public/avatars/${new_profile.id}/${avatarSlug}`
    await saveAvatar(supabase, new_profile.id, avatarSlug, avatar)
  }
  const { error } = await supabase
    .from('profiles')
    .update({
      username: new_profile.username
        ?.replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''),
      bio: new_profile.bio,
      long_description: new_profile.long_description,
      website: new_profile.website,
      full_name: new_profile.full_name,
      avatar_url: avatarUrl,
      regranter_status: new_profile.regranter_status,
    })
    .eq('id', new_profile.id)
  if (error) {
    throw error
  }
}

async function saveAvatar(
  supabase: SupabaseClient,
  userId: string,
  avatarSlug: string,
  avatar: File
) {
  const { error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/${avatarSlug}`, avatar)
  if (error) {
    throw error
  }
}
