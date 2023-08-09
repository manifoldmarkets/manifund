'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { MouseEvent } from 'react'
import Image from 'next/image'
import { UserIcon, UsersIcon } from '@heroicons/react/20/solid'

export function Avatar(props: {
  username: string
  avatarUrl: string | null
  id: string
  noLink?: boolean
  size?: number | 'xxs' | 'xs' | 'sm'
  className?: string
}) {
  const { username, avatarUrl, id, noLink, size, className } = props
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
    <div onClick={onClick}>
      <GeneratedAvatar uuid={id} size={s} aria-hidden="true" />
    </div>
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
  const [fromString, toString, emojiString, directionString] = [
    uuid.substring(9, 13),
    uuid.substring(14, 18),
    uuid.substring(19, 23),
    uuid.substring(0, 4),
  ]
  const [fromNum, toNum, emojiNum, directionNum] = [
    parseInt(fromString, 16),
    parseInt(toString, 16),
    parseInt(emojiString, 16),
    parseInt(directionString, 16),
  ]
  const [fromIdx, toIdx, emojiIdx] = [
    fromNum % 32,
    toNum % 32,
    emojiNum % emojis.length,
  ]
  const [fromColor, toColor, emoji, direction] = [
    fromColors[fromIdx],
    toColors[toIdx === fromIdx ? (toIdx + 12) % 32 : toIdx],
    emojis[emojiIdx],
    directionNum % 3
      ? gradientDirections[directionNum % 4]
      : 'bg-gradient-radial',
  ]
  const textSize =
    size < 8
      ? 'text-xs'
      : size < 12
      ? 'text-lg'
      : size < 16
      ? 'text-xl'
      : size < 24
      ? 'text-3xl'
      : 'text-5xl'
  console.log(fromColor, toColor)
  console.log(direction)
  return (
    <div
      className={clsx(
        `flex flex-shrink-0 h-${size} w-${size} items-center justify-center rounded-full`,
        direction,
        fromColor,
        toColor,
        textSize
      )}
    >
      {emoji}
    </div>
  )
}

const gradientDirections = [
  'bg-gradient-to-t',
  'bg-gradient-to-tr',
  'bg-gradient-to-r',
  'bg-gradient-to-br',
]

const fromColors = [
  'from-red-200',
  'from-red-400',
  'from-orange-200',
  'from-orange-400',
  'from-amber-200',
  'from-amber-400',
  'from-lime-200',
  'from-lime-400',
  'from-green-200',
  'from-green-400',
  'from-emerald-200',
  'from-emerald-400',
  'from-teal-200',
  'from-teal-400',
  'from-cyan-200',
  'from-cyan-400',
  'from-sky-200',
  'from-sky-400',
  'from-blue-200',
  'from-blue-400',
  'from-indigo-200',
  'from-indigo-400',
  'from-violet-200',
  'from-violet-400',
  'from-purple-200',
  'from-purple-400',
  'from-fuchsia-200',
  'from-fuchsia-400',
  'from-pink-200',
  'from-pink-400',
  'from-rose-200',
  'from-rose-400',
]

const toColors = [
  'to-red-200',
  'to-red-400',
  'to-orange-200',
  'to-orange-400',
  'to-amber-200',
  'to-amber-400',
  'to-lime-200',
  'to-lime-400',
  'to-green-200',
  'to-green-400',
  'to-emerald-200',
  'to-emerald-400',
  'to-teal-200',
  'to-teal-400',
  'to-cyan-200',
  'to-cyan-400',
  'to-sky-200',
  'to-sky-400',
  'to-blue-200',
  'to-blue-400',
  'to-indigo-200',
  'to-indigo-400',
  'to-violet-200',
  'to-violet-400',
  'to-purple-200',
  'to-purple-400',
  'to-fuchsia-200',
  'to-fuchsia-400',
  'to-pink-200',
  'to-pink-400',
  'to-rose-200',
  'to-rose-400',
]

const emojis = [
  '🍉',
  '🍎',
  '🍇',
  '🍊',
  '🍋',
  '🍍',
  '🍒',
  '🍓',
  '🫐',
  '🥥',
  '🥭',
  '🥑',
  '🥕',
  '🌽',
  '🌶',
  '🥦',
  '🍄',
  '🥨',
  '🍩',
  '🌸',
  '🌻',
  '🌳',
  '🌷',
  '🌴',
  '🐳',
  '🦋',
  '🦄',
  '🐙',
  '🐝',
  '🐞',
  '🦀',
  '🐢',
  '🐠',
  '🐬',
  '🐸',
  '🐌',
  '🦑',
  '🐭',
  '🐶',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐷',
  '🐹',
  '🐮',
  '🐵',
  '🐔',
  '🐧',
  '🐤',
  '🐰',
]
