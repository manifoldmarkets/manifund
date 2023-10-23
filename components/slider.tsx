import clsx from 'clsx'
import * as RxSlider from '@radix-ui/react-slider'
import { ReactNode } from 'react'

const colors = {
  emerald: ['bg-emerald-400', 'focus:outline-emerald-600/30 bg-emerald-600'],
  rose: ['bg-rose-400', 'focus:outline-rose-600/30 bg-rose-600'],
  orange: ['bg-orange-300', 'focus:outline-orange-500/30 bg-orange-500'],
  'reverse-orange': ['bg-gray-300', 'focus:outline-gray-500/30 bg-gray-500'],
} as const

export function Slider(props: {
  amount: number
  onChange: (newAmount: number) => void
  min?: number
  max?: number
  step?: number
  marks?: { value: number; label: string }[]
  color?: keyof typeof colors
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
    color = 'orange',
  } = props

  const [trackClasses, thumbClasses] = colors[color]

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
      <Track className={trackClasses}>
        <div className="absolute left-2.5 right-2.5 h-full">
          {marks?.map(({ value, label }) => (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${value}%` }}
              key={value}
            >
              <div
                className={clsx(
                  amount >= value ? trackClasses : 'bg-gray-400',
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
      <Thumb className={thumbClasses} />
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
  color?: keyof typeof colors
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
    color = 'orange',
    className,
  } = props

  const [trackClasses, thumbClasses] = colors[color]

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
      disabled={disabled}
    >
      <RxSlider.Track className="relative h-1 grow rounded-full bg-orange-300 -z-10">
        <div className="absolute left-2.5 right-2.5 h-full">
          {marks?.map(({ value, label }) => (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${value}%` }}
              key={value}
            >
              <div
                className={clsx(
                  (lowValue >= value || highValue <= value)
                    ? '!bg-orange-500'
                    : 'bg-gray-400',
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
      </RxSlider.Track>
      <Thumb className={thumbClasses} />
      <Thumb className={thumbClasses} />
    </RxSlider.Root>
  )
}

const Track = (props: { className: string; children?: ReactNode }) => {
  const { className, children } = props
  return (
    <RxSlider.Track className="relative h-1 grow rounded-full bg-gray-300">
      {children}
      <RxSlider.Range
        className={clsx(className, 'absolute h-full rounded-full')}
      />
    </RxSlider.Track>
  )
}

const Thumb = (props: { className: string }) => (
  <RxSlider.Thumb
    className={clsx(
      props.className,
      'block h-4 w-4 cursor-col-resize rounded-full outline outline-4 outline-transparent transition-colors'
    )}
  />
)
