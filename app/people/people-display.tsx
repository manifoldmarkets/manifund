'use client'
import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
import { Profile } from '@/db/profile'
import Link from 'next/link'
import { Row } from '@/components/layout/row'
import { ProfileAndProjectTitles } from '@/db/profile'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { sortBy } from 'lodash'
import { Tooltip } from '@/components/tooltip'
import {
  CheckBadgeIcon,
  CurrencyDollarIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid'

export function PeopleDisplay(props: { profiles: ProfileAndProjectTitles[] }) {
  const { profiles } = props
  const eligibleProfiles = sortProfiles(
    profiles
      ?.filter((profile) => profile.type === 'individual')
      .filter((profile) => checkProfileComplete(profile))
  )
  const [search, setSearch] = useState('')
  const selectedProfiles = searchProfiles(eligibleProfiles, search)
  return (
    <div className="w-fit">
      <div className="relative rounded-md shadow-sm lg:w-8/12">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          autoComplete="off"
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:leading-6"
          placeholder="Search..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
          }}
        />
      </div>
      {selectedProfiles?.map((profile) => (
        <ProfileRow
          key={profile.id}
          profile={profile}
          isCreator={profile.projects.length > 0}
        />
      ))}
    </div>
  )
}

// TODO: use on other profile complete checks
export function checkProfileComplete(profile: Profile) {
  return profile.username !== profile.id && profile.full_name
}

function ProfileRow(props: { profile: Profile; isCreator?: boolean }) {
  const { profile, isCreator } = props
  return (
    <Link
      className="flex-2 flex w-fit items-center gap-3 rounded p-3 hover:bg-gray-100"
      href={`/${profile.username}`}
    >
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={12}
        className="hidden sm:block"
      />
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={8}
        className="sm:hidden"
      />
      <Col className="w-72 truncate overflow-ellipsis sm:w-96">
        <Row className="text-md w-full items-center gap-2 font-semibold text-gray-900 sm:text-lg">
          {profile.full_name}
          <Row className="gap-1">
            {profile.regranter_status && <MiniProfileTag role="regrantor" />}
            {isCreator && <MiniProfileTag role="creator" />}
            {profile.accreditation_status && (
              <MiniProfileTag role="accredited" />
            )}
          </Row>
        </Row>
        <span className="truncate overflow-ellipsis text-xs text-gray-500">
          {profile.bio}
        </span>
      </Col>
    </Link>
  )
}

function searchProfiles(profiles: ProfileAndProjectTitles[], search: string) {
  if (!search) return profiles
  const check = (field: string) => {
    return field.toLowerCase().includes(search.toLowerCase())
  }
  return (
    profiles?.filter((profile) => {
      // Not currently checking description
      return (
        check(profile.username) ||
        check(profile.bio) ||
        !!profile.projects.find((project) => check(project.title))
      )
    }) ?? []
  )
}

function sortProfiles(profiles: ProfileAndProjectTitles[]) {
  const sortedProfiles = sortBy(profiles, (profile) => {
    if (profile.regranter_status) return 0
    else if (profile.projects.length > 0) return 1
    else if (profile.bio) return 2
    else if (profile.accreditation_status) return 3
    else return 4
  })
  return sortedProfiles
}

export function MiniProfileTag(props: { role: string }) {
  const { role } = props
  switch (role) {
    case 'regrantor':
      return (
        <Tooltip text="Regrantor">
          <div className="rounded-full bg-orange-500 p-0.5 text-orange-100 shadow">
            <CheckBadgeIcon className="m-auto h-3 w-3 stroke-2" />
          </div>
        </Tooltip>
      )
    case 'accredited':
      return (
        <Tooltip text="Accredited Investor">
          <div className="rounded-full bg-emerald-500 p-0.5 text-emerald-100 shadow">
            <CurrencyDollarIcon className="m-auto h-3 w-3 stroke-2" />
          </div>
        </Tooltip>
      )
    case 'creator':
      return (
        <Tooltip text="Creator">
          <div className="rounded-full bg-blue-500 p-0.5 text-blue-100 shadow">
            <WrenchIcon className="m-auto h-3 w-3 stroke-2" />
          </div>
        </Tooltip>
      )
    default:
      return null
  }
}
