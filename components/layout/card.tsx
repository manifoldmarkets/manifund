import clsx from 'clsx'
import React from 'react'

export const Card = React.forwardRef(function Col(
  props: JSX.IntrinsicElements['div'],
  ref: React.Ref<HTMLDivElement>
) {
  const { children, className, ...rest } = props
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
