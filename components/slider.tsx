import clsx from 'clsx'
import * as RxSlider from '@radix-ui/react-slider'
import { ReactNode } from 'react'

const colors = {
  emerald: ['bg-emerald-400', 'focus:outline-emerald-600/30 bg-emerald-600'],
  rose: ['bg-rose-400', 'focus:outline-rose-600/30 bg-rose-600'],
  orange: ['bg-orange-300', 'focus:outline-orange-500/30 bg-orange-500'],
  gray: ['bg-gray-300', 'focus:outline-gray-500/30 bg-gray-500'],
} as const

export function Slider(props: {
  amount: number
  onChange: (newAmount: number) => void
  min?: number
  max?: number
  step?: number
  marks?: { value: number; label: string }[]
  rangeColor?: keyof typeof colors
  trackColor?: keyof typeof colors
  className?: string
  disabled?: boolean
}) {
  const {
    amount,
    onChange,
    min,
    max,
    step,
    marks,
    className,
    disabled,
    rangeColor = 'orange',
    trackColor = 'gray',
  } = props
  const [rangeClass, thumbClass] = colors[rangeColor]
  const trackClass = colors[trackColor][0]

  return (
    <RxSlider.Root
      className={clsx(
        className,
        'relative flex h-5 touch-none select-none items-center'
      )}
      value={[amount]}
      onValueChange={([val]) => onChange(val)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <Track trackClass={trackClass} rangeClass={rangeClass}>
        <div className="absolute left-2.5 right-2.5 h-full">
          {marks?.map(({ value, label }) => (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${value}%` }}
              key={value}
            >
              <div
                className={clsx(
                  amount >= value ? rangeClass : trackClass,
                  'h-2 w-2 rounded-full'
                )}
              />
              <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-gray-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Track>
      <Thumb className={clsx(thumbClass, disabled ? '!h-2 !w-2' : '')} />
    </RxSlider.Root>
  )
}

export function RangeSlider(props: {
  lowValue: number
  highValue: number
  setValues: (low: number, high: number) => void
  min?: number
  max?: number
  marks?: { value: number; label: string }[]
  disabled?: boolean
  rangeColor?: keyof typeof colors
  trackColor?: keyof typeof colors
  handleSize?: number
  className?: string
}) {
  const {
    lowValue,
    highValue,
    setValues,
    min,
    max,
    marks,
    disabled,
    rangeColor = 'orange',
    trackColor = 'gray',
    className,
  } = props

  const [rangeClass, thumbClass] = colors[rangeColor]
  const trackClass = colors[trackColor][0]
  console.log(rangeClass, trackClass)
  return (
    <RxSlider.Root
      className={clsx(
        className,
        'relative flex h-7 touch-none select-none items-center'
      )}
      value={[lowValue, highValue]}
      minStepsBetweenThumbs={1}
      onValueChange={([low, high]) => setValues(low, high)}
      min={min}
      max={max}
    >
      <Track rangeClass={rangeClass} trackClass={trackClass}>
        <div className="absolute left-2.5 right-2.5 h-full">
          {marks?.map(({ value, label }) => (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${value}%` }}
              key={value}
            >
              <div
                className={clsx(
                  lowValue < value && highValue > value
                    ? rangeClass
                    : trackClass,
                  'h-2 w-2 rounded-full'
                )}
              />
              <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-gray-400">
                {label}
              </span>
            </div>
          ))}
        </div>
        <RxSlider.Range
          className={'absolute h-full rounded-full bg-gray-300'}
        />
      </Track>
      <Thumb className={clsx(thumbClass, disabled ? '!h-2 !w-2' : '')} />
      <Thumb className={clsx(thumbClass, disabled ? '!h-2 !w-2' : '')} />
    </RxSlider.Root>
  )
}

const Track = (props: {
  rangeClass: string
  trackClass: string
  children?: ReactNode
}) => {
  const { rangeClass, trackClass, children } = props
  return (
    <RxSlider.Track
      className={clsx(trackClass, 'relative h-1 grow rounded-full bg-gray-300')}
    >
      {children}
      <RxSlider.Range
        className={clsx(rangeClass, 'absolute h-full rounded-full')}
      />
    </RxSlider.Track>
  )
}

const Thumb = (props: { className: string }) => (
  <RxSlider.Thumb
    className={clsx(
      props.className,
      'relative block h-4 w-4 cursor-col-resize rounded-full outline outline-4 outline-transparent transition-colors'
    )}
  />
)
