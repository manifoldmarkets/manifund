import clsx from 'clsx'
import { ReactNode } from 'react'

export function Card(props: { children: ReactNode; className?: string }) {
  const { children, className } = props
  return (
    <div
      className={clsx(
        className,
        'overflow-hidden rounded-md border border-gray-300 bg-white p-4 shadow'
      )}
    >
      {children}
    </div>
  )
}
