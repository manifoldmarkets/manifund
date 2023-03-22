import { Round } from '@/db/round'
import { getRoundTheme } from '@/utils/constants'
import clsx from 'clsx'

export function RoundTag(props: { roundTitle: string; size?: 'sm' | 'xl' }) {
  const { roundTitle, size } = props
  const roundTheme = getRoundTheme(roundTitle)
  return (
    <p
      className={clsx(
        'inline-flex rounded-full font-semibold leading-5',
        `text-${roundTheme}-700 bg-${roundTheme}-200 opacity-100`,
        size === 'xl' ? 'max-h-24 p-3 text-2xl' : 'max-h-6 px-2 text-xs'
      )}
    >
      {roundTitle}
    </p>
  )
}
