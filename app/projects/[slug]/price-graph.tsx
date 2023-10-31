import { last } from 'lodash'
import { scaleTime, scaleLinear } from 'd3-scale'
import { calculateAMMPorfolio, calculateValuation } from '@/utils/amm'
import { Row } from '@/components/layout/row'
import { Avatar } from '@/components/avatar'

const YES_GRAPH_COLOR = '#ea580c'

export type TradePoint = HistoryPoint<{ profile?: Profile }>

const ValuationChartTooltip = (
  props: TooltipProps<TradePoint> & { dateLabel: string }
) => {
  const { prev, next, dateLabel } = props
  if (!prev) return null
  const profile = prev.obj?.profile
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
      <span className="text-ink-600">{formatPct(prev.y)}</span>
    </Row>
  )
}

export const CertValuationChart = (props: {
  ammTxns: Txn[]
  ammId: string
  tradePoints: TradePoint[]
  width: number
  height: number
  controlledStart?: number
  percentBounds?: { max?: number; min?: number }
  showZoomer?: boolean
}) => {
  const {
    ammTxns,
    ammId,
    width,
    height,
    controlledStart,
    percentBounds,
    tradePoints,
  } = props
  const [start, end] = [
    new Date(ammTxns[0].created_at).getTime(),
    new Date().getTime(),
  ]
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const endP = calculateValuation(ammShares, ammUSD)
  const rangeStart = controlledStart ?? start

  const now = useMemo(() => Date.now(), [tradePoints])

  const data = useMemo(() => {
    return [...tradePoints, { x: end ?? now, y: endP }]
  }, [end, endP, tradePoints])

  const rightmostDate = getRightmostVisibleDate(end, last(tradePoints)?.x, now)
  const maxValuation = _.max(data.map((p) => p.y)) ?? 100
  const xScale = scaleTime([rangeStart, rightmostDate], [0, width])
  const yScale = scaleLinear([0, maxValuation], [height, 0])

  return (
    <SingleValueHistoryChart
      w={width}
      h={height}
      xScale={xScale}
      yScale={yScale}
      data={data}
      color={YES_GRAPH_COLOR}
      Tooltip={(props) => (
        <ValuationChartTooltip
          {...props}
          dateLabel={formatDateInRange(
            // eslint-disable-next-line react/prop-types
            xScale.invert(props.x),
            rangeStart,
            rightmostDate
          )}
        />
      )}
    />
  )
}

import { bisector, extent } from 'd3-array'
import { axisBottom, axisRight } from 'd3-axis'
import { ScaleContinuousNumeric, ScaleTime } from 'd3-scale'
import {
  CurveFactory,
  curveLinear,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape'
import { range } from 'lodash'
import { ReactNode, useCallback, useId, useMemo, useState } from 'react'

import {
  AxisConstraints,
  HistoryPoint,
  Point,
  ValueKind,
  compressPoints,
  viewScale,
} from '@/utils/chart'
import { useEvent } from '@/hooks/use-event'
import { roundToNearestFive } from '@/utils/formatting'
import clsx from 'clsx'

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

const constrainExtent = (
  extent: [number, number],
  constraints: AxisConstraints
) => {
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

const getTickValues = (
  min: number,
  max: number,
  n: number,
  negativeThreshold?: number
) => {
  let step = (max - min) / (n - 1)
  let theMin = min
  let theMax = max
  if (step > 10) {
    theMin = roundToNearestFive(min)
    theMax = roundToNearestFive(max)
    step = (theMax - theMin) / (n - 1)
  }
  const defaultRange = [
    theMin,
    ...range(1, n - 1).map((i) => theMin + step * i),
    theMax,
  ]
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

export const ControllableSingleValueHistoryChart = <
  P extends HistoryPoint
>(props: {
  data: P[]
  w: number
  h: number
  color: string | ((p: P) => string)
  xScale: ScaleTime<number, number>
  yScale: ScaleContinuousNumeric<number, number>
  viewScaleProps: viewScale
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
  const { viewXScale, setViewXScale, viewYScale, setViewYScale } =
    props.viewScaleProps
  const yKind = props.yKind ?? 'amount'
  const xScale = viewXScale ?? props.xScale
  const yScale = viewYScale ?? props.yScale

  const [xMin, xMax] = xScale?.domain().map((d) => d.getTime()) ?? [
    data[0].x,
    data[data.length - 1].x,
  ]

  const { points, isCompressed } = useMemo(
    () => compressPoints(data, xMin, xMax),
    [data, xMin, xMax]
  )

  const curve = props.curve ?? isCompressed ? curveLinear : curveStepAfter

  const [mouse, setMouse] = useState<TooltipProps<P>>()

  const px = useCallback((p: P) => xScale(p.x), [xScale])
  const py0 = yScale(0)
  const py1 = useCallback((p: P) => yScale(p.y), [yScale])
  const { xAxis, yAxis } = useMemo(() => {
    const [min, max] = yScale.domain()
    const nTicks = noAxes ? 0 : h < 200 ? 3 : 5
    const customTickValues = noAxes
      ? []
      : getTickValues(min, max, nTicks, negativeThreshold)
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
        const domain = constrainExtent(
          [yMin - padding, yMax + padding],
          Y_AXIS_CONSTRAINTS[yKind]
        )
        setViewYScale(() => yScale.copy().domain(domain).nice())
      }
    } else {
      setViewXScale(undefined)
      setViewYScale(undefined)
    }
  }, [])

  const gradientId = useId()
  const stops = useMemo(
    () =>
      typeof color !== 'string' ? computeColorStops(points, color, px) : null,
    [color, points, px]
  )

  return (
    <>
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
              {stops.map((s, i) => (
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
        {mouse && (
          <SliceMarker color="#5BCEFF" x={mouse.x} y0={py0} y1={mouse.y} />
        )}
      </SVGChart>
    </>
  )
}

export const SingleValueHistoryChart = <P extends HistoryPoint>(
  props: Omit<
    Parameters<typeof ControllableSingleValueHistoryChart<P>>[0],
    'viewScaleProps'
  >
) => {
  const viewScaleProps = useViewScale()

  return (
    <ControllableSingleValueHistoryChart
      {...props}
      viewScaleProps={viewScaleProps}
    />
  )
}

import { Axis, AxisScale } from 'd3-axis'
import { pointer, select } from 'd3-selection'
import { area, line } from 'd3-shape'
import { zoom } from 'd3-zoom'
import React, { SVGProps, useDeferredValue, useEffect, useRef } from 'react'
import { useMeasureSize } from '@/hooks/use-measure-size'
import { clamp } from 'lodash'
import { formatMoney } from '@/utils/formatting'
import {
  add,
  differenceInHours,
  isAfter,
  isBefore,
  isSameDay,
  isSameYear,
  sub,
  format,
} from 'date-fns'
import { Profile } from '@/db/profile'
import { Txn } from '@/db/txn'
import _ from 'lodash'

const XAxis = <X,>(props: { w: number; h: number; axis: Axis<X> }) => {
  const { h, axis } = props
  const axisRef = useRef<SVGGElement>(null)
  useEffect(() => {
    if (axisRef.current != null) {
      select(axisRef.current)
        .call(axis)
        .select('.domain')
        .attr('stroke-width', 0)
    }
  }, [h, axis])
  return <g ref={axisRef} transform={`translate(0, ${h})`} />
}

const SimpleYAxis = <Y,>(props: { w: number; axis: Axis<Y> }) => {
  const { w, axis } = props
  const axisRef = useRef<SVGGElement>(null)
  useEffect(() => {
    if (axisRef.current != null) {
      select(axisRef.current)
        .call(axis)
        .select('.domain')
        .attr('stroke-width', 0)
    }
  }, [w, axis])
  return <g ref={axisRef} transform={`translate(${w}, 0)`} />
}

// horizontal gridlines
const YAxis = <Y,>(props: {
  w: number
  h: number
  axis: Axis<Y>
  negativeThreshold?: number
}) => {
  const { w, h, axis, negativeThreshold = 0 } = props
  const axisRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (axisRef.current != null) {
      select(axisRef.current)
        .call(axis)
        .call((g) =>
          g.selectAll('.tick').each(function (d) {
            const tick = select(this)
            if (negativeThreshold && d === negativeThreshold) {
              const color = negativeThreshold >= 0 ? '#0d9488' : '#FF2400'
              tick
                .select('line') // Change stroke of the line
                .attr('x2', w)
                .attr('stroke-opacity', 1)
                .attr('stroke-dasharray', '10,5') // Make the line dotted
                .attr('transform', `translate(-${w}, 0)`)
                .attr('stroke', color)

              tick
                .select('text') // Change font of the text
                .style('font-weight', 'bold') // Adjust this to your needs
                .attr('fill', color)
            } else {
              tick
                .select('line')
                .attr('x2', w)
                .attr('stroke-opacity', 0.1)
                .attr('transform', `translate(-${w}, 0)`)
            }
          })
        )
        .select('.domain')
        .attr('stroke-width', 0)
    }
  }, [w, h, axis, negativeThreshold])

  return <g ref={axisRef} transform={`translate(${w}, 0)`} />
}

const LinePath = <P,>(
  props: {
    data: P[]
    px: number | ((p: P) => number)
    py: number | ((p: P) => number)
    curve: CurveFactory
  } & SVGProps<SVGPathElement>
) => {
  const { px, py, curve, data: propData, ...rest } = props
  const data = useDeferredValue(propData)
  const d = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => line<P>(px, py).curve(curve)(data)!,
    [px, py, curve, data]
  )
  return <path {...rest} fill="none" d={d} />
}

const AreaPath = <P,>(
  props: {
    data: P[]
    px: number | ((p: P) => number)
    py0: number | ((p: P) => number)
    py1: number | ((p: P) => number)
    curve: CurveFactory
  } & SVGProps<SVGPathElement>
) => {
  const { px, py0, py1, curve, data: propData, ...rest } = props
  const data = useDeferredValue(propData)
  const d = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => area<P>(px, py0, py1).curve(curve)(data)!,
    [px, py0, py1, curve, data]
  )
  return <path {...rest} d={d} />
}

const AreaWithTopStroke = <P,>(props: {
  data: P[]
  color: string
  px: number | ((p: P) => number)
  py0: number | ((p: P) => number)
  py1: number | ((p: P) => number)
  curve: CurveFactory
  className?: string
}) => {
  const { data, color, px, py0, py1, curve, className } = props
  const last = data[data.length - 1]
  const lastX = typeof px === 'function' ? px(last) : px
  const lastY = typeof py1 === 'function' ? py1(last) : py1

  return (
    <g>
      <AreaPath
        data={data}
        px={px}
        py0={py0}
        py1={py1}
        curve={curve}
        fill={color}
        opacity={0.2}
        className={className}
      />
      <LinePath data={data} px={px} py={py1} curve={curve} stroke={color} />
      {/* a little extension so that the current value is always visible */}
      <path
        fill="none"
        d={`M${lastX},${lastY} L${lastX + 2},${lastY}`}
        stroke={color}
      />
    </g>
  )
}

const SliceMarker = (props: {
  color: string
  x: number
  y0: number
  y1: number
}) => {
  const { color, x, y0, y1 } = props
  return (
    <g>
      <line stroke="white" strokeWidth={1} x1={x} x2={x} y1={y0} y2={y1} />
      <circle
        stroke="white"
        strokeWidth={1}
        fill={color}
        cx={x}
        cy={y1}
        r={5}
      />
    </g>
  )
}

const SVGChart = <
  X,
  TT extends { x: number; y: number },
  S extends AxisScale<X>
>(props: {
  children: ReactNode
  w: number
  h: number
  xAxis: Axis<X>
  yAxis: Axis<number>
  ttParams?: TT | undefined
  fullScale?: S
  onRescale?: (xScale: S | null) => void
  onMouseOver?: (mouseX: number, mouseY: number) => void
  onMouseLeave?: () => void
  Tooltip?: (props: TT) => ReactNode
  negativeThreshold?: number
  noGridlines?: boolean
  className?: string
}) => {
  const {
    children,
    w,
    h,
    xAxis,
    yAxis,
    ttParams,
    fullScale,
    onRescale,
    onMouseOver,
    onMouseLeave,
    Tooltip,
    negativeThreshold,
    noGridlines,
    className,
  } = props
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (fullScale != null && onRescale != null && svgRef.current) {
      const zoomer = zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 100])
        .extent([
          [0, 0],
          [w, h],
        ])
        .translateExtent([
          [0, 0],
          [w, h],
        ])
        .on('zoom', (ev) => onRescale(ev.transform.rescaleX(fullScale)))
        .filter((ev) => {
          if (ev instanceof WheelEvent) {
            return ev.ctrlKey || ev.metaKey || ev.altKey
          } else if (ev instanceof TouchEvent) {
            // disable on touch devices entirely for now to not interfere with scroll
            return false
          }
          return !ev.button
        })

      select(svgRef.current)
        .call(zoomer)
        .on('dblclick.zoom', () => onRescale?.(null))
    }
  }, [w, h, fullScale, onRescale])

  const onPointerMove = (ev: React.PointerEvent) => {
    if (ev.pointerType === 'mouse' || ev.pointerType === 'pen') {
      const [x, y] = pointer(ev)
      onMouseOver?.(x, y)
    }
  }

  const onPointerLeave = () => {
    onMouseLeave?.()
  }

  if (w <= 0 || h <= 0) {
    // i.e. chart is smaller than margin
    return null
  }

  return (
    <div
      className={clsx(className, 'relative')}
      onPointerEnter={onPointerMove}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {ttParams && Tooltip && (
        <TooltipContainer
          calculatePos={(ttw, tth) =>
            getTooltipPosition(ttParams.x, ttParams.y, w, h, ttw, tth)
          }
        >
          {Tooltip(ttParams)}
        </TooltipContainer>
      )}
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        overflow="visible"
        ref={svgRef}
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <mask id="mask">
            <rect
              x={-8}
              y={-8}
              width={w + 16}
              height={h + 16}
              fill="white"
              filter="url(#blur)"
            />
          </mask>
          <clipPath id="clip">
            <rect x={-32} y={-32} width={w + 64} height={h + 64} />
          </clipPath>
        </defs>

        <g>
          <XAxis axis={xAxis} w={w} h={h} />
          {noGridlines ? (
            <SimpleYAxis axis={yAxis} w={w} />
          ) : (
            <YAxis
              axis={yAxis}
              w={w}
              h={h}
              negativeThreshold={negativeThreshold}
            />
          )}
          {/* clip to stop pointer events outside of graph, and mask for the blur to indicate zoom */}
          <g clipPath="url(#clip)">
            <g mask="url(#mask)">{children}</g>
          </g>
        </g>
      </svg>
    </div>
  )
}

type TooltipPosition = { left: number; bottom: number }

const getTooltipPosition = (
  mouseX: number,
  mouseY: number,
  containerWidth: number,
  containerHeight: number,
  tooltipWidth: number,
  tooltipHeight: number
) => {
  let left = mouseX + 6
  let bottom = containerHeight - mouseY + 6

  left = clamp(left, 0, containerWidth - tooltipWidth)
  bottom = clamp(bottom, 0, containerHeight - tooltipHeight)

  return { left, bottom }
}

type TooltipProps<T> = {
  x: number
  y: number
  prev: T | undefined
  next: T | undefined
  nearest: T
}

const TooltipContainer = (props: {
  calculatePos: (width: number, height: number) => TooltipPosition
  className?: string
  children: React.ReactNode
}) => {
  const { calculatePos, className, children } = props

  const { elemRef, width, height } = useMeasureSize()
  const pos = calculatePos(width ?? 0, height ?? 0)

  return (
    <div
      ref={elemRef}
      className={clsx(
        className,
        'bg-canvas-0/70 pointer-events-none absolute z-10 whitespace-pre rounded border border-ink-200 px-4 py-2 text-sm'
      )}
      style={{ ...pos }}
    >
      {children}
    </div>
  )
}

const getRightmostVisibleDate = (
  contractEnd: number | null | undefined,
  lastActivity: number | null | undefined,
  now: number
) => {
  if (contractEnd != null) {
    return contractEnd
  } else if (lastActivity != null) {
    // client-DB clock divergence may cause last activity to be later than now
    return Math.max(lastActivity, now)
  } else {
    return now
  }
}

const formatPct = (n: number) => {
  return `${(n * 100).toFixed(0)}%`
}

const formatDate = (
  date: Date | number,
  opts?: {
    includeYear?: boolean
    includeHour?: boolean
    includeMinute?: boolean
  }
) => {
  const { includeYear, includeHour, includeMinute } = opts ?? {}
  const d = new Date(date.valueOf())
  const now = Date.now()
  if (
    isAfter(add(d, { minutes: 1 }), now) &&
    isBefore(sub(d, { minutes: 1 }), now)
  ) {
    return 'Now'
  } else {
    const dayName = isSameDay(now, d)
      ? 'Today'
      : isSameDay(now, add(d, { days: 1 }))
      ? 'Yesterday'
      : null
    let dateFormat = 'MMM d'
    if (includeMinute) {
      dateFormat += ', h:mma'
    } else if (includeHour) {
      dateFormat += ', ha'
    } else if (includeYear) {
      dateFormat += ', YYYY'
    }
    return dayName ? `[${dayName}]` : format(d, dateFormat)
  }
}

const formatDateInRange = (
  d: Date | number,
  start: Date | number,
  end: Date | number
) => {
  const opts = {
    includeYear: !isSameYear(start, end),
    includeHour: isAfter(add(start, { days: 8 }), end),
    includeMinute: differenceInHours(end, start) < 2,
  }
  return formatDate(d, opts)
}

// assumes linear interpolation
const computeColorStops = <P extends HistoryPoint>(
  data: P[],
  pc: (p: P) => string,
  px: (p: P) => number
) => {
  const segments: { x: number; color: string }[] = []

  if (data.length === 0) return segments

  segments.push({ x: px(data[0]), color: pc(data[0]) })

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1]
    const curr = data[i]
    if (pc(prev) !== pc(curr)) {
      // given a line through points (x0, y0) and (x1, y1), find the x value where y = 0 (intersects with x axis)
      const xIntersect =
        prev.x + (prev.y * (curr.x - prev.x)) / (prev.y - curr.y)

      segments.push({ x: px({ ...prev, x: xIntersect }), color: pc(curr) })
    }
  }

  const stops: { x: number; color: string }[] = []
  stops.push({ x: segments[0].x, color: segments[0].color })
  for (const s of segments.slice(1)) {
    stops.push({ x: s.x, color: stops[stops.length - 1].color })
    stops.push({ x: s.x, color: s.color })
  }
  return stops
}

const useViewScale = () => {
  const [viewXScale, setViewXScale] = useState<ScaleTime<number, number>>()
  const [viewYScale, setViewYScale] =
    useState<ScaleContinuousNumeric<number, number>>()
  return {
    viewXScale,
    setViewXScale,
    viewYScale,
    setViewYScale,
  }
}
