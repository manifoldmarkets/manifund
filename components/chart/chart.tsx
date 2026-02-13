import { bisector, extent } from 'd3-array'
import { axisBottom, axisRight } from 'd3-axis'
import { ScaleContinuousNumeric, ScaleTime } from 'd3-scale'
import { CurveFactory, curveLinear, curveStepAfter, curveStepBefore } from 'd3-shape'
import { range } from 'es-toolkit'
import { Key, ReactNode, useCallback, useId, useMemo, useState } from 'react'
import { AxisConstraints, HistoryPoint, Point, ValueKind, compressPoints } from '@/utils/chart'
import { useEvent } from '@/hooks/use-event'
import { formatMoney, roundToNearestFive } from '@/utils/formatting'
import { Profile } from '@/db/profile'
import {
  AreaWithTopStroke,
  computeColorStops,
  SliceMarker,
  SVGChart,
  TooltipProps,
  useViewScale,
} from './helpers'

export type TradePoint = HistoryPoint<Profile>

const Y_AXIS_CONSTRAINTS: Record<ValueKind, AxisConstraints> = {
  percent: { min: 0, max: 1, minExtent: 0.04 },
  Ṁ: { minExtent: 10 },
  amount: { minExtent: 0.04 },
}

const interpolateY = (
  curve: CurveFactory,
  x: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
) => {
  if (curve === curveLinear) {
    if (x1 == x0) {
      return y0
    } else {
      const p = (x - x0) / (x1 - x0)
      return y0 * (1 - p) + y1 * p
    }
  } else if (curve === curveStepAfter) {
    return y0
  } else if (curve === curveStepBefore) {
    return y1
  } else {
    return 0
  }
}

const constrainExtent = (extent: [number, number], constraints: AxisConstraints) => {
  // first clamp the extent to our min and max
  const min = constraints.min ?? -Infinity
  const max = constraints.max ?? Infinity
  const minExtent = constraints.minExtent ?? 0
  const start = Math.max(extent[0], min)
  const end = Math.min(extent[1], max)

  const size = end - start
  if (size >= minExtent) {
    return [start, end]
  } else {
    // compute how much padding we need to get to the min extent
    const halfPad = Math.max(0, minExtent - size) / 2
    const paddedStart = start - halfPad
    const paddedEnd = end + halfPad
    // we would like to return [start - halfPad, end + halfPad], but if our padding
    // is making us go past the min and max, we need to readjust it to the other end
    if (paddedStart < min) {
      const underflow = min - paddedStart
      return [min, paddedEnd + underflow]
    } else if (paddedEnd > max) {
      const overflow = paddedEnd - max
      return [paddedStart - overflow, max]
    } else {
      return [paddedStart, paddedEnd]
    }
  }
}

const getTickValues = (min: number, max: number, n: number, negativeThreshold?: number) => {
  let step = (max - min) / (n - 1)
  let theMin = min
  let theMax = max
  if (step > 10) {
    theMin = roundToNearestFive(min)
    theMax = roundToNearestFive(max)
    step = (theMax - theMin) / (n - 1)
  }
  const defaultRange = [theMin, ...range(1, n - 1).map((i) => theMin + step * i), theMax]
  if (negativeThreshold) {
    return defaultRange
      .filter((n) => Math.abs(negativeThreshold - n) > Math.max(step / 4, 1))
      .concat(negativeThreshold)
      .sort((a, b) => a - b)
  }
  return defaultRange
}

const dataAtTimeSelector = <Y, P extends Point<number, Y>>(
  data: P[],
  xScale: ScaleTime<number, number>
) => {
  const bisect = bisector((p: P) => p.x)
  return (posX: number) => {
    const x = xScale.invert(posX)
    const i = bisect.left(data, x)
    const prev = data[i - 1] as P | undefined
    const next = data[i] as P | undefined
    const nearest = data[bisect.center(data, x)]
    return { prev, next, nearest, x: posX }
  }
}

export const SingleValueHistoryChart = <P extends HistoryPoint>(props: {
  data: P[]
  w: number
  h: number
  color: string | ((p: P) => string)
  xScale: ScaleTime<number, number>
  yScale: ScaleContinuousNumeric<number, number>
  showZoomer?: boolean
  yKind?: ValueKind
  curve?: CurveFactory
  onMouseOver?: (p: P | undefined) => void
  Tooltip?: (props: TooltipProps<P>) => ReactNode
  noAxes?: boolean
  pct?: boolean
  negativeThreshold?: number
}) => {
  const { data, w, h, color, Tooltip, noAxes, negativeThreshold } = props
  const { viewXScale, setViewXScale, viewYScale, setViewYScale } = useViewScale()
  const yKind = props.yKind ?? 'amount'
  const xScale = viewXScale ?? props.xScale
  const yScale = viewYScale ?? props.yScale

  const [xMin, xMax] = xScale?.domain().map((d: { getTime: () => any }) => d.getTime()) ?? [
    data[0].x,
    data[data.length - 1].x,
  ]

  const { points, isCompressed } = useMemo(
    () => compressPoints(data, xMin, xMax),
    [data, xMin, xMax]
  )

  const curve = (props.curve ?? isCompressed) ? curveLinear : curveStepAfter

  const [mouse, setMouse] = useState<TooltipProps<P>>()

  const px = useCallback((p: P) => xScale(p.x), [xScale])
  const py0 = yScale(0)
  const py1 = useCallback((p: P) => yScale(p.y), [yScale])
  const { xAxis, yAxis } = useMemo(() => {
    const [min, max] = yScale.domain()
    const nTicks = noAxes ? 0 : h < 200 ? 3 : 5
    const customTickValues = noAxes ? [] : getTickValues(min, max, nTicks, negativeThreshold)
    const xAxis = axisBottom<Date>(xScale).ticks(noAxes ? 0 : w / 100)
    const yAxis = negativeThreshold
      ? axisRight<number>(yScale)
          .tickValues(customTickValues)
          .tickFormat((n) => formatMoney(n))
      : axisRight<number>(yScale)
          .ticks(nTicks)
          .tickFormat((n) => formatMoney(n))
    // : axisRight<number>(yScale).ticks(nTicks)
    return { xAxis, yAxis }
  }, [w, h, yKind, xScale, yScale, noAxes])

  const selector = dataAtTimeSelector(points, xScale)
  const onMouseOver = useEvent((mouseX: number) => {
    const p = selector(mouseX)
    props.onMouseOver?.(p.prev)
    if (p.prev) {
      const x0 = xScale(p.prev.x)
      const x1 = p.next ? xScale(p.next.x) : x0
      const y0 = yScale(p.prev.y)
      const y1 = p.next ? yScale(p.next.y) : y0
      const markerY = interpolateY(curve, mouseX, x0, x1, y0, y1)
      setMouse({ ...p, x: mouseX, y: markerY })
    } else {
      setMouse(undefined)
    }
  })

  const onMouseLeave = useEvent(() => {
    props.onMouseOver?.(undefined)
    setMouse(undefined)
  })

  const rescale = useCallback((newXScale: ScaleTime<number, number> | null) => {
    if (newXScale) {
      setViewXScale(() => newXScale)
      if (yKind === 'percent') return

      const [xMin, xMax] = newXScale.domain()

      const bisect = bisector((p: P) => p.x)
      const iMin = bisect.right(data, xMin)
      const iMax = bisect.right(data, xMax)

      // don't zoom axis if they selected an area with only one value
      if (iMin != iMax) {
        const visibleYs = range(iMin - 1, iMax).map((i) => data[i]?.y)
        const [yMin, yMax] = extent(visibleYs) as [number, number]
        // try to add extra space on top and bottom before constraining
        const padding = (yMax - yMin) * 0.1
        const domain = constrainExtent([yMin - padding, yMax + padding], Y_AXIS_CONSTRAINTS[yKind])
        setViewYScale(() => yScale.copy().domain(domain).nice())
      }
    } else {
      setViewXScale(undefined)
      setViewYScale(undefined)
    }
  }, [])

  const gradientId = useId()
  const stops = useMemo(
    () => (typeof color !== 'string' ? computeColorStops(points, color, px) : null),
    [color, points, px]
  )

  return (
    <SVGChart
      w={w}
      h={h}
      xAxis={xAxis}
      yAxis={yAxis}
      ttParams={mouse}
      fullScale={props.xScale}
      onRescale={rescale}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      Tooltip={Tooltip}
      negativeThreshold={negativeThreshold}
    >
      {stops && (
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={gradientId}>
            {stops.map((s: { x: number; color: string | undefined }, i: Key | null | undefined) => (
              <stop key={i} offset={`${s.x / w}`} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
      )}
      <AreaWithTopStroke
        color={typeof color === 'string' ? color : `url(#${gradientId})`}
        data={data}
        px={px}
        py0={py0}
        py1={py1}
        curve={curve ?? curveLinear}
      />
      {mouse && <SliceMarker color="#5BCEFF" x={mouse.x} y0={py0} y1={mouse.y} />}
    </SVGChart>
  )
}
