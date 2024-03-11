'use client'
import clsx from 'clsx'

export const Select = (props: JSX.IntrinsicElements['select']) => {
  const { className, children, ...rest } = props

  return (
    <select
      className={clsx(
        'h-12 cursor-pointer self-start overflow-hidden rounded-md border border-gray-300 pl-4 pr-10 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500',
        className
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
