import { getRoundTheme } from '@/utils/constants'
import clsx from 'clsx'
import Link from 'next/link'

const COLORS = [
  'bg-indigo-200',
  'bg-gray-200',
  'bg-cyan-200',
  'bg-indigo-400',
  'bg-gray-400',
  'bg-cyan-400',
  'text-indigo-700',
  'text-gray-700',
  'text-cyan-700',
]

export function RoundTag(props: {
  roundTitle: string
  size?: 'xl'
  roundSlug?: string
}) {
  const { roundTitle, size, roundSlug } = props
  const roundTheme = getRoundTheme(roundTitle)
  if (roundSlug) {
    return (
      <Link href={`/rounds/${roundSlug}`}>
        <p
          className={clsx(
            'inline-flex rounded-full font-semibold leading-5 hover:underline hover:decoration-2',
            `text-${roundTheme}-700`,
            `bg-${roundTheme}-200`,
            size === 'xl' ? 'max-h-24 p-3 text-2xl' : 'max-h-6 px-2 text-xs'
          )}
        >
          {roundTitle}
        </p>
      </Link>
    )
  }
  return (
    <p
      className={clsx(
        'inline-flex rounded-full font-semibold leading-5 hover:underline hover:decoration-2',
        `text-${roundTheme}-700`,
        `bg-${roundTheme}-200`,
        size === 'xl' ? 'max-h-24 p-3 text-2xl' : 'max-h-6 px-2 text-xs'
      )}
    >
      {roundTitle}
    </p>
  )
}
