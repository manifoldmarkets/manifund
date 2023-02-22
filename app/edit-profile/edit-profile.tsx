'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { StringDecoder } from 'string_decoder'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase } = useSupabase()
  const [username, setUsername] = useState<string>(profile.username)
  const [bio, setBio] = useState<string>(profile.bio)
  const [website, setWebsite] = useState<string | null>(profile.website)
  const [first_name, setFirstName] = useState<string>(profile.first_name)
  const [last_name, setLastName] = useState<string>(profile.last_name)
  const [avatar, setAvatar] = useState<File | null>(null)
  const router = useRouter()

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
      <label htmlFor="first_name">First name</label>
      <Input
        type="text"
        id="first_name"
        autoComplete="off"
        required
        value={first_name ? first_name : ''}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <label htmlFor="last_name">Last name</label>
      <Input
        type="text"
        id="last_name"
        autoComplete="off"
        required
        value={last_name ? last_name : ''}
        onChange={(event) => setLastName(event.target.value)}
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
      <label htmlFor="avatar">Choose a profile picture:</label>
      <div className="flex space-x-2">
        <div className="h-24 w-24">
          <Avatar
            username={username ? username : undefined}
            id={profile.id}
            noLink
            size={24}
          />
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

      <AccreditationInfoBox />

      <Button
        type="submit"
        className="max-w-xs"
        onClick={async () => {
          await saveProfile(
            { id: profile.id, username, bio, website, first_name, last_name },
            avatar,
            supabase
          )
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
          Fill out this form to get verified as an accredited investor:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://airtable.com/shrZVLeo6f34NBfR0"
            className="font-bold hover:underline"
          >
            verification form
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
  saveAvatar(avatar, new_profile.id, supabase)
  const { error } = await supabase
    .from('profiles')
    .update({
      username: new_profile.username
        ?.replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''),
      bio: new_profile.bio,
      website: new_profile.website,
      first_name: new_profile.first_name,
      last_name: new_profile.last_name,
    })
    .eq('id', new_profile.id)
  if (error) {
    throw error
  }
}

async function saveAvatar(
  avatar: File | null,
  id: string,
  supabase: SupabaseClient
) {
  if (!avatar) return
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${id}/avatar`, avatar)
  if (error) {
    throw error
  }
}
