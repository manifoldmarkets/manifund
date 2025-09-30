import clsx from 'clsx'
import React from 'react'

export const Col = React.forwardRef<
  HTMLDivElement,
  React.JSX.IntrinsicElements['div']
>(function Col({ children, className, ...rest }, ref) {
  return (
    <div className={clsx(className, 'flex flex-col')} ref={ref} {...rest}>
      {children}
    </div>
  )
})
