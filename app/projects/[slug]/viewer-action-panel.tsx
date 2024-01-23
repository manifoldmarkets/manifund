'use client'

import { Button } from '@/components/button'
import { Row } from '@/components/layout/row'
import { LinkIcon, EyeIcon } from '@heroicons/react/20/solid'
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
      <Button
        className="flex gap-0.5"
        color="light-orange"
        size="2xs"
        onClick={async () => {
          await navigator.clipboard.writeText(
            `${window.location.origin}/projects/${projectSlug}`
          )
        }}
      >
        <LinkIcon className="relative right-0.5 h-4 w-4 stroke-2" />
        Share
      </Button>
      <Button
        className="flex gap-0.5"
        color={displayAsFollowing ? 'light-orange' : 'gray'}
        size="2xs"
        disabled={displayAsFollowing !== currentlyFollowing}
        onClick={async () => {
          setDisplayAsFollowing(!currentlyFollowing)
          const response = await fetch('/api/toggle-follow', {
            method: 'POST',
            body: JSON.stringify({ projectId: projectId }),
          })
          console.log('response', response)
          router.refresh()
        }}
      >
        <EyeIcon className="relative right-0.5 h-4 w-4 stroke-2" />
        {displayAsFollowing ? 'Following' : 'Follow'}
      </Button>
    </Row>
  )
}
