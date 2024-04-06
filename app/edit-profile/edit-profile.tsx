'use client'

import { useSupabase } from '@/db/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { Profile } from '@/db/profile'
import uuid from 'react-uuid'
import Image from 'next/image'
import { SUPABASE_BUCKET_URL } from '@/db/env'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { RequiredStar } from '@/components/tags'

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase, session } = useSupabase()
  const [username, setUsername] = useState<string>(
    profile.username === profile.id ? '' : profile.username
  )
  const [bio, setBio] = useState<string>(profile.bio)
  const [website, setWebsite] = useState<string | null>(profile.website)
  const [fullName, setFullName] = useState<string>(profile.full_name)
  const editor = useTextEditor(profile.long_description ?? '')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

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
    // Just save their profile now, in the background. No await here.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    saveProfile(
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
  if (!username) {
    errorMessage = 'Please enter a username.'
  } else if (!fullName) {
    errorMessage = 'Please enter your full name.'
  } else if (profile.regranter_status) {
    if (!bio) {
      errorMessage =
        'Please enter a bio. As a regranter, this will be shown in your profile preview.'
    }
    // Breaks on dev because storage issues on dev db
    if (!avatar && !profile.avatar_url) {
      errorMessage =
        'Please upload an avatar. As a regranter, this will be shown in your profile preview.'
    }
  } else {
    errorMessage = null
  }

  const params = useSearchParams()
  const redirect = params?.get('redirect')
  const Save = async () => {
    setSubmitting(true)
    const formattedUsername = username
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
    const longDescription =
      editor?.getJSON() && editor.getHTML() !== '<p></p>'
        ? editor.getJSON()
        : null
    await saveProfile(
      {
        ...profile,
        username: formattedUsername,
        bio,
        long_description: longDescription,
        website,
        full_name: fullName,
      },
      avatar,
      supabase
    )
    setSubmitting(false)
    router.push(redirect ?? `/${formattedUsername}`)
    router.refresh()
  }

  return (
    <Col className="gap-4 p-4">
      <Col className="gap-1">
        <label htmlFor="username">
          Username
          <RequiredStar />
        </label>
        <Input
          type="text"
          id="username"
          autoComplete="off"
          value={username ? username : ''}
          onChange={(event) => setUsername(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="full_name">
          Full name
          <RequiredStar />
        </label>
        <Input
          type="text"
          id="full_name"
          autoComplete="off"
          value={fullName ? fullName : ''}
          onChange={(event) => setFullName(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="bio">Short bio</label>
        <Input
          type="text"
          id="bio"
          autoComplete="off"
          value={bio ? bio : ''}
          onChange={(event) => setBio(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="website">
          Website (e.g. LinkedIn, Twitter, personal website)
        </label>
        {profile.regranter_status && (
          <p className="text-sm text-gray-500">
            We strongly recommend regrantors add a website here. This will be
            shown in your profile preview.
          </p>
        )}
        <Input
          type="text"
          id="website"
          autoComplete="off"
          value={website ? website : ''}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </Col>
      <Col className="gap-1">
        <label htmlFor="long_description">More about you</label>
        {profile.regranter_status && (
          <p className="text-sm text-gray-500">
            We strongly recommend regrantors include key information about their
            background, values, cause prioritization, and grant-making history
            to help potential grantees and donors.
          </p>
        )}
        <TextEditor editor={editor} />
      </Col>
      <label htmlFor="avatar">Choose a profile picture</label>
      <Row className="flex space-x-2">
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
              id={profile.id}
              size={24}
            />
          )}
        </div>
      </Row>
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
        onClick={async () => await Save()}
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
      username: new_profile.username,
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
