'use client'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'

export function Description(props: { children: ReactNode }) {
  const { children } = props
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="text-gray-500">
      <div className={clsx(!expanded && 'line-clamp-[20]')}>{children}</div>
      <Row className="mt-3 justify-center pt-2 text-sm">
        <button onClick={() => setExpanded(!expanded)} className="flex">
          See {expanded ? 'less' : 'more'}
          {expanded ? (
            <ChevronUpIcon className="relative top-1 h-4 w-4 " />
          ) : (
            <ChevronDownIcon className="relative top-1 h-4 w-4" />
          )}
        </button>
      </Row>
    </div>
  )
}
