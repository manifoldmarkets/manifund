'use client'

import { useSupabase } from '@/db/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { Profile } from '@/db/profile'
import { Select } from '@/components/select'
import uuid from 'react-uuid'
import Image from 'next/image'

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase, session } = useSupabase()
  const [username, setUsername] = useState<string>(profile.username)
  const [bio, setBio] = useState<string>(profile.bio)
  const [website, setWebsite] = useState<string | null>(profile.website)
  const [fullName, setFullName] = useState<string>(profile.full_name)
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <label htmlFor="username">Username</label>
      <Input
        type="text"
        id="username"
        autoComplete="off"
        required
        value={username ? username : ''}
        onChange={(event) => setUsername(event.target.value)}
      />
      <label htmlFor="full_name">Full name</label>
      <Input
        type="text"
        id="full_name"
        autoComplete="off"
        required
        value={fullName ? fullName : ''}
        onChange={(event) => setFullName(event.target.value)}
      />
      <label htmlFor="bio">Bio</label>
      <Input
        type="text"
        id="bio"
        autoComplete="off"
        required
        value={bio ? bio : ''}
        onChange={(event) => setBio(event.target.value)}
      />
      <label htmlFor="website">
        Website (e.g. LinkedIn, Twitter, personal website)
      </label>
      <Input
        type="text"
        id="website"
        autoComplete="off"
        required
        value={website ? website : ''}
        onChange={(event) => setWebsite(event.target.value)}
      />
      <label>Investor status</label>
      <Select disabled value={profile.accreditation_status ? 'y' : 'n'}>
        <option value="y">Accredited</option>
        <option value="n">Not accredited</option>
      </Select>

      <AccreditationInfoBox />

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
            <Avatar profile={profile} noLink size={24} />
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

      <Button
        type="submit"
        disabled={submitting}
        loading={submitting}
        className="max-w-xs"
        onClick={async () => {
          setSubmitting(true)
          await saveProfile(
            {
              ...profile,
              username,
              bio,
              website,
              full_name: fullName,
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
    </div>
  )
}

function AccreditationInfoBox() {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            className="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <p className="ml-3 text-sm font-light text-blue-600">
          Anyone may create projects, but only accredited investors may invest
          in projects.
          <br />
          To get verified as an accredited investor, fill out{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://airtable.com/shrZVLeo6f34NBfR0"
            className="font-bold hover:underline"
          >
            this form
          </a>
        </p>
      </div>
    </div>
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
    avatarUrl = `https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/${new_profile.id}/${avatarSlug}`
    await saveAvatar(supabase, new_profile.id, avatarSlug, avatar)
  }
  const { error } = await supabase
    .from('profiles')
    .update({
      username: new_profile.username
        ?.replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''),
      bio: new_profile.bio,
      website: new_profile.website,
      full_name: new_profile.full_name,
      avatar_url: avatarUrl,
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
