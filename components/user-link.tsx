import { SiteLink } from './site-link'
import clsx from 'clsx'
import { Tooltip } from './tooltip'
import { Avatar } from './avatar'
import { ShieldCheckIcon, StarIcon } from '@heroicons/react/20/solid'
import { Profile } from '@/db/profile'

export function shortenName(name: string) {
  const firstName = name.split(' ')[0]
  const maxLength = 11
  const shortName =
    firstName.length >= 3 && name.length > maxLength
      ? firstName.length < maxLength
        ? firstName
        : firstName.substring(0, maxLength - 3) + '...'
      : name.length > maxLength
      ? name.substring(0, maxLength - 3) + '...'
      : name
  return shortName
}

export function UserAvatarAndBadge(props: {
  profile: Profile
  className?: string
  short?: boolean
  creatorBadge?: boolean
}) {
  const { profile, className, short, creatorBadge } = props
  return (
    <div className={clsx('flex flex-row items-center gap-1', className)}>
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={6}
      />
      <UserLink
        name={profile.full_name}
        username={profile.username}
        short={short}
        creatorBadge={creatorBadge}
      />
    </div>
  )
}

export function UserLink(props: {
  name: string
  username: string
  className?: string
  short?: boolean
  noLink?: boolean
  createdTime?: number
  hideBadge?: boolean
  creatorBadge?: boolean
}) {
  const {
    name,
    username,
    className,
    short,
    noLink,
    createdTime,
    hideBadge,
    creatorBadge,
  } = props
  const shortName = short ? shortenName(name) : name
  return (
    <SiteLink
      href={`/${username}`}
      className={clsx(
        'inline-flex max-w-[120px] flex-row items-center gap-0.5 truncate min-[480px]:max-w-[220px]',
        className,
        noLink && 'pointer-events-none'
      )}
      followsLinkClass
    >
      <p className="truncate">{shortName}</p>
      {!hideBadge && <UserBadge username={username} />}
      {creatorBadge && <CreatorBadge />}
    </SiteLink>
  )
}

export function UserBadge(props: { username: string }) {
  const { username } = props

  if (['Austin', 'Rachel'].includes(username)) {
    return <CoreBadge />
  }
  return null
}

// Show a special checkmark next to Core team members
function CoreBadge() {
  return (
    <Tooltip text="I work on Manifund!" placement="right">
      <ShieldCheckIcon className="h-4 w-4 text-orange-600" aria-hidden="true" />
    </Tooltip>
  )
}

function CreatorBadge() {
  return (
    <Tooltip text="Project creator" placement="right">
      <StarIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
    </Tooltip>
  )
}
