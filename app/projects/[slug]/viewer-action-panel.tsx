'use client'

import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { LinkIcon, EyeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ViewerActionPanel(props: {
  projectId: string
  currentlyFollowing: boolean
}) {
  const { projectId, currentlyFollowing } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <Row className="flex items-center justify-end gap-3">
      <LinkIcon className="h-5 w-5 stroke-2 text-gray-500" />
      <Tooltip text={currentlyFollowing ? 'Unfollow' : 'Follow'}>
        <button
          className="hover:cursor-pointer disabled:cursor-not-allowed"
          disabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true)
            await fetch('/api/toggle-follow', {
              method: 'POST',
              body: JSON.stringify({ projectId: projectId }),
            })
            router.refresh()
            setIsSubmitting(false)
          }}
        >
          <EyeIcon
            className={clsx(
              'h-5 w-5 stroke-2',
              currentlyFollowing ? 'text-orange-600' : 'text-gray-500'
            )}
          />
        </button>
      </Tooltip>
    </Row>
  )
}
