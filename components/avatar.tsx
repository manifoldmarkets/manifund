'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { MouseEvent } from 'react'
import Image from 'next/image'
import { UserIcon, UsersIcon } from '@heroicons/react/20/solid'
import alea from 'alea'

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
      <GeneratedAvatar seed={id} size={s} aria-hidden="true" />
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
        `flex flex-shrink-0 h-${size} w-${size} items-center justify-center rounded-full bg-gray-100`,
        className
      )}
    >
      <Icon className={`h-${insize} w-${insize} text-gray-500`} aria-hidden />
    </div>
  )
}

export function GeneratedAvatar(props: { seed: string; size?: number }) {
  const { seed, size = 8 } = props
  const num = alea(seed)()
  console.log('num', num)

  const [fromNum, toNum, emojiNum, directionNum] = [
    Math.round(num * Math.pow(10, 16)),
    Math.round(num * Math.pow(10, 12)),
    Math.round(num * Math.pow(10, 8)),
    Math.round(num * Math.pow(10, 4)),
  ]
  console.log('from num', fromNum)
  console.log('to num', toNum)
  console.log('emoji num', emojiNum)
  console.log('direction num', directionNum)

  const [fromIdx, toIdx, emojiIdx] = [
    fromNum % 16,
    toNum % 16,
    emojiNum % emojis.length,
  ]
  const [fromColor, toColor, emoji, direction] = [
    fromColors[fromIdx],
    toColors[Math.abs(toIdx - fromIdx) % 16 < 4 ? (toIdx + 8) % 16 : toIdx],
    emojis[emojiIdx],
    directionNum % 3
      ? gradientDirections[directionNum % 8]
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
  console.log(emojis.length)
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
  'bg-gradient-to-b',
  'bg-gradient-to-bl',
  'bg-gradient-to-l',
  'bg-gradient-to-tl',
]

const fromColors = [
  'to-red-100',
  'to-orange-100',
  'to-amber-100',
  'to-lime-100',
  'to-green-100',
  'to-emerald-100',
  'to-teal-100',
  'to-cyan-100',
  'to-sky-100',
  'to-blue-100',
  'to-indigo-100',
  'to-violet-100',
  'to-purple-100',
  'to-fuchsia-100',
  'to-pink-100',
  'to-rose-100',
]

const toColors = [
  'from-red-400',
  'from-orange-400',
  'from-amber-400',
  'from-lime-400',
  'from-green-400',
  'from-emerald-400',
  'from-teal-400',
  'from-cyan-400',
  'from-sky-400',
  'from-blue-400',
  'from-indigo-400',
  'from-violet-400',
  'from-purple-400',
  'from-fuchsia-400',
  'from-pink-400',
  'from-rose-400',
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
