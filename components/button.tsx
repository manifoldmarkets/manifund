import { MouseEventHandler, ReactNode } from 'react'
import clsx from 'clsx'

export type SizeType = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ColorType =
  | 'emerald'
  | 'emerald-outline'
  | 'rose'
  | 'rose-outline'
  | 'blue'
  | 'orange'
  | 'light-orange'
  | 'yellow'
  | 'gray'
  | 'gray-outline'
  | 'orange-outline'
  | 'gradient'
  | 'gray-white'

const sizeClasses = {
  '2xs': 'px-2 py-1.5 text-xs font-medium',
  xs: 'px-2.5 py-1.5 text-sm font-medium',
  sm: 'px-3 py-2 text-sm font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-4 py-2 text-base font-medium',
  xl: 'px-6 py-2.5 text-base font-semibold',
  '2xl': 'px-6 py-3 text-xl font-semibold',
}

export function buttonClass(size: SizeType, color: ColorType | 'override') {
  return clsx(
    'font-md inline-flex items-center justify-center rounded-md ring-inset shadow-sm transition-colors disabled:cursor-not-allowed text-center',
    sizeClasses[size],
    color === 'emerald' &&
      'disabled:bg-gray-200 bg-emerald-500 text-white hover:bg-emerald-600',
    color === 'emerald-outline' &&
      'disabled:bg-gray-200 bg-white ring-emerald-500 ring-2 text-emerald-500 hover:bg-emerald-500 hover:text-white',
    color === 'rose' &&
      'disabled:bg-gray-200 bg-rose-500 text-white hover:bg-rose-600',
    color === 'rose-outline' &&
      'disabled:bg-gray-200 bg-white ring-rose-500  ring-2 text-rose-500 hover:bg-rose-500 hover:text-white',
    color === 'orange' &&
      'disabled:bg-gray-200 bg-orange-500 text-white hover:bg-orange-600',
    color === 'orange-outline' &&
      'disabled:bg-gray-200 ring-2 ring-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
    color === 'light-orange' &&
      'disabled:bg-gray-100 disabled:text-gray-400 bg-orange-100 text-orange-600 hover:bg-orange-200',
    color === 'gray' &&
      'bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50',
    color === 'gray-outline' &&
      'ring-2 ring-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white disabled:opacity-50',
    color === 'gradient' &&
      'disabled:bg-gray-200 bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-700 hover:to-rose-700',
    color === 'gray-white' &&
      'text-gray-600 hover:bg-gray-200 shadow-none disabled:opacity-50'
  )
}

export function Button(props: {
  className?: string
  onClick?: MouseEventHandler<any> | undefined
  children?: ReactNode
  size?: SizeType
  color?: ColorType | 'override'
  type?: 'button' | 'reset' | 'submit'
  disabled?: boolean
  loading?: boolean
}) {
  const {
    children,
    className,
    onClick,
    size = 'md',
    color = 'orange',
    type = 'button',
    disabled = false,
    loading,
  } = props

  return (
    <button
      type={type}
      className={clsx(buttonClass(size, color), className)}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function IconButton(props: {
  className?: string
  onClick?: MouseEventHandler<any> | undefined
  children?: ReactNode
  size?: SizeType
  type?: 'button' | 'reset' | 'submit'
  disabled?: boolean
  loading?: boolean
}) {
  const {
    children,
    className,
    onClick,
    size = 'md',
    type = 'button',
    disabled = false,
    loading,
  } = props

  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed',
        sizeClasses[size],
        'text-gray-500 hover:text-gray-600 disabled:text-gray-200',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
