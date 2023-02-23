import { SiteLink } from './site-link'
import clsx from 'clsx'
import { Tooltip } from './tooltip'
import { Avatar } from './avatar'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'
import { ShieldCheckIcon } from '@heroicons/react/20/solid'

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
  name: string
  username: string
  id: string
  avatarUrl?: string
  className?: string
}) {
  const { name, username, id, avatarUrl, className } = props
  return (
    <div className={clsx('flex flex-row items-center gap-2', className)}>
      <Avatar username={username} size={6} id={id} />
      <UserLink name={name} username={username} />
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
}) {
  const { name, username, className, short, noLink, createdTime, hideBadge } =
    props
  const shortName = short ? shortenName(name) : name
  return (
    <SiteLink
      href={`/${username}`}
      className={clsx(
        'inline-flex max-w-[120px] flex-row items-center gap-1 truncate min-[480px]:max-w-[200px]',
        className,
        noLink && 'pointer-events-none'
      )}
      followsLinkClass
    >
      {shortName}
      {!hideBadge && <UserBadge username={username} />}
    </SiteLink>
  )
}

export function UserBadge(props: { username: string }) {
  const { username } = props

  if (['Austin', 'Rachel'].includes(username)) {
    return <CoreBadge />
  }
  if (['GavrielK'].includes(username)) {
    return <CheckBadge />
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

// Show a normal checkmark next to our trustworthy users
function CheckBadge() {
  return (
    <Tooltip text="Accredited investor" placement="right">
      <CheckBadgeIcon className="h-4 w-4 text-orange-600" aria-hidden="true" />
    </Tooltip>
  )
}
