import { Tooltip } from './tooltip'

export function ProgressBar(props: {
  amountRaised: number
  fundingGoal: number
  minFunding: number
}) {
  const { amountRaised, fundingGoal, minFunding } = props
  const percentFunded = Math.min((amountRaised / fundingGoal) * 100, 100)
  const minPercent = (minFunding / fundingGoal) * 100
  const darkOrangePercent = Math.min(percentFunded, minPercent)
  return (
    <div className="relative h-2 w-full rounded-full bg-gray-200">
      <div
        style={{
          background: '#f97316', // orange-500
          width: `${darkOrangePercent}%`,
          height: '0.5rem',
          borderRadius: '0.5rem',
          zIndex: 30,
          position: 'absolute',
          bottom: '0px',
          left: '0px',
        }}
      />
      <div
        style={{
          background: '#fed7aa', // orange-200
          width: `${percentFunded}%`,
          height: '0.5rem',
          borderRadius: '0.5rem',
          zIndex: 20,
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
          <Tooltip text={`min funding: ${minFunding}`}>
            <div className="h-2 w-1 rounded bg-gray-400" />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
