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

export function GeneratedAvatar(props: { uuid: string; size?: number }) {
  const { uuid, size = 8 } = props
  const [fromString, viaString, toString] = [
    uuid.substring(9, 13),
    uuid.substring(14, 18),
    uuid.substring(19, 23),
  ]
  const [fromNum, viaNum, toNum] = [
    parseInt(fromString, 16),
    parseInt(viaString, 16),
    parseInt(toString, 16),
  ]
  const [fromIdx, viaIdx, toIdx] = [fromNum % 48, viaNum % 48, toNum % 48]
  const [fromColor, viaColor, toColor] = [
    fromColors[fromIdx],
    viaColors[viaIdx],
    toColors[toIdx],
  ]
  console.log(fromColor, viaColor, toColor)
  const directionNum = parseInt(uuid.substring(0, 4), 16)
  const direction =
    directionNum % 3
      ? gradientDirections[directionNum % 8]
      : 'bg-gradient-radial'
  console.log(direction)
  return (
    <div
      className={clsx(
        `flex flex-shrink-0 h-${size} w-${size} items-center justify-center rounded-full`,
        direction,
        fromColor,
        viaColor,
        toColor
      )}
    />
  )
}

const gradientDirections = [
  'bg-gradient-to-t',
  'bg-gradient-to-tr',
  'bg-gradient-to-r',
  'bg-gradient-to-br',
  'bg-gradient-to-b',
  'bg-gradient-to-bl',
  'bg-gradient-to-l',
  'bg-gradient-to-tl',
]

const fromColors = [
  'from-red-200',
  'from-red-500',
  'from-red-800',
  'from-orange-200',
  'from-orange-500',
  'from-orange-800',
  'from-amber-200',
  'from-amber-500',
  'from-amber-800',
  'from-lime-200',
  'from-lime-500',
  'from-lime-800',
  'from-green-200',
  'from-green-500',
  'from-green-800',
  'from-emerald-200',
  'from-emerald-500',
  'from-emerald-800',
  'from-teal-200',
  'from-teal-500',
  'from-teal-800',
  'from-cyan-200',
  'from-cyan-500',
  'from-cyan-800',
  'from-sky-200',
  'from-sky-500',
  'from-sky-800',
  'from-blue-200',
  'from-blue-500',
  'from-blue-800',
  'from-indigo-200',
  'from-indigo-500',
  'from-indigo-800',
  'from-violet-200',
  'from-violet-500',
  'from-violet-800',
  'from-purple-200',
  'from-purple-500',
  'from-purple-800',
  'from-fuchsia-200',
  'from-fuchsia-500',
  'from-fuchsia-800',
  'from-pink-200',
  'from-pink-500',
  'from-pink-800',
  'from-rose-200',
  'from-rose-500',
  'from-rose-800',
]

const viaColors = [
  'via-red-200',
  'via-red-500',
  'via-red-800',
  'via-orange-200',
  'via-orange-500',
  'via-orange-800',
  'via-amber-200',
  'via-amber-500',
  'via-amber-800',
  'via-lime-200',
  'via-lime-500',
  'via-lime-800',
  'via-green-200',
  'via-green-500',
  'via-green-800',
  'via-emerald-200',
  'via-emerald-500',
  'via-emerald-800',
  'via-teal-200',
  'via-teal-500',
  'via-teal-800',
  'via-cyan-200',
  'via-cyan-500',
  'via-cyan-800',
  'via-sky-200',
  'via-sky-500',
  'via-sky-800',
  'via-blue-200',
  'via-blue-500',
  'via-blue-800',
  'via-indigo-200',
  'via-indigo-500',
  'via-indigo-800',
  'via-violet-200',
  'via-violet-500',
  'via-violet-800',
  'via-purple-200',
  'via-purple-500',
  'via-purple-800',
  'via-fuchsia-200',
  'via-fuchsia-500',
  'via-fuchsia-800',
  'via-pink-200',
  'via-pink-500',
  'via-pink-800',
  'via-rose-200',
  'via-rose-500',
  'via-rose-800',
]

const toColors = [
  'to-red-200',
  'to-red-500',
  'to-red-800',
  'to-orange-200',
  'to-orange-500',
  'to-orange-800',
  'to-amber-200',
  'to-amber-500',
  'to-amber-800',
  'to-lime-200',
  'to-lime-500',
  'to-lime-800',
  'to-green-200',
  'to-green-500',
  'to-green-800',
  'to-emerald-200',
  'to-emerald-500',
  'to-emerald-800',
  'to-teal-200',
  'to-teal-500',
  'to-teal-800',
  'to-cyan-200',
  'to-cyan-500',
  'to-cyan-800',
  'to-sky-200',
  'to-sky-500',
  'to-sky-800',
  'to-blue-200',
  'to-blue-500',
  'to-blue-800',
  'to-indigo-200',
  'to-indigo-500',
  'to-indigo-800',
  'to-violet-200',
  'to-violet-500',
  'to-violet-800',
  'to-purple-200',
  'to-purple-500',
  'to-purple-800',
  'to-fuchsia-200',
  'to-fuchsia-500',
  'to-fuchsia-800',
  'to-pink-200',
  'to-pink-500',
  'to-pink-800',
  'to-rose-200',
  'to-rose-500',
  'to-rose-800',
]
