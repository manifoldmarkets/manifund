import { formatMoney } from '@/utils/formatting'
import clsx from 'clsx'
import { Tooltip } from './tooltip'

export function ProgressBar(props: {
  amountRaised: number
  fundingGoal: number
  minFunding: number
  small?: boolean
}) {
  const { amountRaised, fundingGoal, minFunding, small } = props
  const percentFunded = Math.min((amountRaised / fundingGoal) * 100, 100)
  const minPercent = (minFunding / fundingGoal) * 100
  return (
    <div
      className={clsx(
        'relative w-full rounded-full bg-gray-200 ring-2 ring-gray-200',
        small ? 'h-1.5' : 'h-2'
      )}
    >
      <div
        style={{
          background: '#f97316', // orange-500
          width: `${percentFunded > 0 ? Math.max(percentFunded, 1.5) : 0}%`,
          height: small ? '0.375rem' : '0.5rem',
          borderRadius: '0.5rem',
          position: 'absolute',
          bottom: '0px',
          left: '0px',
        }}
      />
      {amountRaised < minFunding && minFunding !== 0 && (
        <div
          style={{
            width: `${minPercent}%`,
          }}
          className="flex justify-end"
        >
          <Tooltip text={`min funding: ${formatMoney(minFunding)}`}>
            <div
              className={clsx(
                'w-0.5 rounded bg-gray-400 sm:w-1',
                small ? 'h-1.5' : 'h-2'
              )}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
