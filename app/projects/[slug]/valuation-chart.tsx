import _, { last, sortBy } from 'es-toolkit/compat'
import { scaleTime, scaleLinear } from 'd3-scale'
import { calculateAMMPorfolio, calculateValuation } from '@/utils/amm'
import { Row } from '@/components/layout/row'
import { Avatar } from '@/components/avatar'
import { formatMoney } from '@/utils/formatting'
import { Txn } from '@/db/txn'
import { SingleValueHistoryChart, TradePoint } from '@/components/chart/chart'
import { useMemo } from 'react'
import {
  formatDateInRange,
  getRightmostVisibleDate,
  TooltipProps,
} from '@/components/chart/helpers'
import { SizedContainer } from '@/components/layout/sized-container'
import clsx from 'clsx'

const ValuationChartTooltip = (
  props: TooltipProps<TradePoint> & { dateLabel: string }
) => {
  const { prev, next, dateLabel } = props
  if (!prev) return null
  const profile = prev.obj
  return (
    <Row className="items-center gap-2">
      {!!profile && (
        <Avatar
          size="xs"
          avatarUrl={profile.avatar_url}
          id={profile.id}
          username={profile.username}
        />
      )}
      <span className="font-semibold">{next ? dateLabel : 'Now'}</span>
      <span className="text-ink-600">{formatMoney(prev.y)}</span>
    </Row>
  )
}

export const CertValuationChart = (props: {
  ammTxns: Txn[]
  ammId: string
  tradePoints: TradePoint[]
  size: 'sm' | 'lg'
  className?: string
}) => {
  const { ammTxns, ammId, size, tradePoints, className } = props
  const sortedAmmTxns = sortBy(ammTxns, 'created_at')
  const [start, end] = [
    new Date(sortedAmmTxns[0]?.created_at)?.getTime() ?? 0,
    new Date().getTime(),
  ]
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const currValuation = calculateValuation(ammShares, ammUSD)
  const now = useMemo(() => Date.now(), [tradePoints])
  const data = useMemo(() => {
    return [...tradePoints, { y: currValuation, x: now }]
  }, [end, currValuation, tradePoints])
  const rightmostDate = getRightmostVisibleDate(end, last(tradePoints)?.x, now)
  const maxValuation = _.max(data.map((p) => p.y)) ?? 100
  if (sortedAmmTxns.length === 0) return null
  return (
    <SizedContainer
      className={clsx(
        ' w-full pb-3 pr-10',
        size === 'sm' ? 'h-[100px]' : 'h-[150px] sm:h-[250px]',
        className
      )}
    >
      {(w, h) => {
        const xScale = scaleTime([start, rightmostDate], [0, w])
        const yScale = scaleLinear([0, maxValuation], [h, 0])
        return (
          <SingleValueHistoryChart
            w={w}
            h={h}
            xScale={xScale}
            yScale={yScale}
            data={data}
            color="#ea580c"
            Tooltip={(props) => (
              <ValuationChartTooltip
                {...props}
                dateLabel={formatDateInRange(
                  // eslint-disable-next-line react/prop-types
                  xScale.invert(props.x),
                  start,
                  rightmostDate
                )}
              />
            )}
          />
        )
      }}
    </SizedContainer>
  )
}
