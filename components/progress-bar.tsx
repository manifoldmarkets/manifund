import { formatMoney } from '@/utils/formatting'
import { Tooltip } from './tooltip'

export function ProgressBar(props: {
  amountRaised: number
  fundingGoal: number
  minFunding: number
}) {
  const { amountRaised, fundingGoal, minFunding } = props
  const percentFunded = Math.min((amountRaised / fundingGoal) * 100, 100)
  const minPercent = (minFunding / fundingGoal) * 100
  return (
    <div className="relative h-2 w-full rounded-full bg-gray-200">
      <div
        style={{
          background: '#f97316', // orange-500
          width: `${percentFunded > 0 ? Math.max(percentFunded, 1.5) : 0}%`,
          height: '0.5rem',
          borderRadius: '0.5rem',
          zIndex: 30,
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
            <div className="h-2 w-1 rounded bg-gray-400" />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
