import clsx from 'clsx'
import React from 'react'

export const Card = React.forwardRef<
  HTMLDivElement,
  React.JSX.IntrinsicElements['div']
>(function Card({ children, className, ...rest }, ref) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-md bg-white p-4 shadow',
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  )
})
