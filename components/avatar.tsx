'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { MouseEvent } from 'react'
import Image from 'next/image'
import { UserCircleIcon, UserIcon, UsersIcon } from '@heroicons/react/20/solid'

export function Avatar(props: {
  username: string
  avatarUrl: string | null
  noLink?: boolean
  size?: number | 'xxs' | 'xs' | 'sm'
  className?: string
}) {
  const { username, avatarUrl, noLink, size, className } = props
  const router = useRouter()
  const s =
    size == 'xxs' ? 4 : size == 'xs' ? 6 : size === 'sm' ? 8 : size || 12
  const sizeInPx = s * 4

  const onClick = (e: MouseEvent) => {
    if (!noLink && username) {
      e.stopPropagation()
      router.push(`/${username}`)
    }
  }

  // There can be no avatar URL or username in the feed, we show a "submit comment"
  // Item with a fake grey user circle guy even if you aren't signed in
  return avatarUrl ? (
    <Image
      width={sizeInPx * 2}
      height={sizeInPx * 2}
      className={clsx(
        'my-0 flex-shrink-0 rounded-full bg-white object-cover',
        `w-${s} h-${s}`,
        !noLink && 'cursor-pointer',
        className
      )}
      style={{ maxWidth: `${s * 0.25}rem` }}
      src={avatarUrl}
      onClick={onClick}
      alt={`${username ?? 'Unknown user'} avatar`}
    />
  ) : (
    <UserCircleIcon
      className={clsx(
        `flex-shrink-0 rounded-full bg-white w-${s} h-${s} cursor-pointer text-gray-500`,
        className
      )}
      aria-hidden="true"
      onClick={onClick}
    />
  )
}

export function EmptyAvatar(props: {
  className?: string
  size?: number
  multi?: boolean
}) {
  const { className, size = 8, multi } = props
  const insize = size - 3
  const Icon = multi ? UsersIcon : UserIcon

  return (
    <div
      className={clsx(
        `flex flex-shrink-0 h-${size} w-${size} items-center justify-center rounded-full bg-gray-200`,
        className
      )}
    >
      <Icon className={`h-${insize} w-${insize} text-gray-500`} aria-hidden />
    </div>
  )
}
