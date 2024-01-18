'use client'

import { Row } from '@/components/layout/row'
import { LinkIcon, EyeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

export function ViewerActionPanel(props: {
  projectId: string
  currentlyFollowing: boolean
}) {
  const { projectId, currentlyFollowing } = props
  const router = useRouter()
  return (
    <Row className="flex items-center justify-end gap-3">
      <LinkIcon className="h-5 w-5 stroke-2 text-gray-500" />
      <button
        className="hover:cursor-pointer"
        onClick={async () => {
          await fetch('/api/follow-project', {
            method: 'POST',
            body: JSON.stringify({ projectId: projectId }),
          })
          router.refresh()
        }}
      >
        <EyeIcon
          className={clsx(
            'h-5 w-5 stroke-2',
            currentlyFollowing ? 'text-orange-600' : 'text-gray-500'
          )}
        />
      </button>
    </Row>
  )
}
