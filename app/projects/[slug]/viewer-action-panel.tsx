'use client'

import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { LinkIcon, EyeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ViewerActionPanel(props: {
  projectId: string
  projectSlug: string
  currentlyFollowing: boolean
}) {
  const { projectId, projectSlug, currentlyFollowing } = props
  const [displayAsFollowing, setDisplayAsFollowing] =
    useState(currentlyFollowing)
  const router = useRouter()
  return (
    <Row className="flex items-center justify-end gap-2">
      <Tooltip text="Copy link to project">
        <button
          className="hover:cursor-pointer"
          onClick={async () => {
            await navigator.clipboard.writeText(
              `${window.location.origin}/projects/${projectSlug}`
            )
          }}
        >
          <LinkIcon className="h-5 w-5 stroke-2 text-gray-500" />
        </button>
      </Tooltip>
      <Tooltip text={currentlyFollowing ? 'Unfollow' : 'Follow'}>
        <button
          className="hover:cursor-pointer disabled:cursor-not-allowed"
          disabled={displayAsFollowing !== currentlyFollowing}
          onClick={async () => {
            setDisplayAsFollowing(!currentlyFollowing)
            await fetch('/api/toggle-follow', {
              method: 'POST',
              body: JSON.stringify({ projectId: projectId }),
            })
            router.refresh()
          }}
        >
          <EyeIcon
            className={clsx(
              'h-5 w-5 stroke-2',
              displayAsFollowing ? 'text-orange-600' : 'text-gray-500'
            )}
          />
        </button>
      </Tooltip>
    </Row>
  )
}
