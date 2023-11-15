'use client'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Json } from '@/db/database.types'
import { RichContent } from '@/components/editor'
import { useSafeLayoutEffect } from '@/hooks/use-safe-layout-effect'

export function Description(props: { description: Json }) {
  const { description } = props
  const [showExpandButton, setShowExpandButton] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const contentElement = useRef<any>(null)
  useSafeLayoutEffect(() => {
    if (contentElement.current && contentElement.current.scrollHeight > 600) {
      setShowExpandButton(true)
    }
  }, [contentElement])
  return (
    <div className="px-3 text-gray-500">
      <div
        className={clsx(
          expanded || !showExpandButton ? 'max-h-fit' : 'line-clamp-[16]'
        )}
        ref={contentElement}
      >
        <RichContent content={description} className="text-sm" />
      </div>
      {showExpandButton && (
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
      )}
    </div>
  )
}
