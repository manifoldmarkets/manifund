'use client'
import { Col } from '@/components/layout/col'
import { ProjectVote } from '@/db/project'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const revalidate = 0

export function Vote(props: {
  projectId: string
  votes: ProjectVote[]
  userId?: string
}) {
  const { projectId, votes, userId } = props
  const oldVote = votes.find((vote) => vote.voter_id === userId)
  const oldMagnitude = oldVote?.magnitude ?? 0
  const [newMagnitude, setNewMagnitude] = useState<null | number>(null)
  const router = useRouter()
  const displayMagnitude = newMagnitude ?? oldMagnitude

  const vote = async (magnitude: number) => {
    if (!userId) return
    setNewMagnitude(displayMagnitude === magnitude ? 0 : magnitude)
    await fetch(`/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        newMagnitude,
      }),
    })
    router.refresh()
  }
  return (
    <Col
      className={clsx(
        'relative items-center gap-2',
        userId && 'cursor-pointer'
      )}
    >
      <ChevronUpIcon
        className={clsx(
          'h-8 w-8 stroke-2',
          displayMagnitude > 0 ? 'text-orange-500' : ' text-gray-400'
        )}
        onClick={async () => await vote(1)}
      />
      <span className="absolute top-6 text-gray-400">
        {votes
          .filter((vote) => vote.voter_id !== userId)
          .reduce((acc, vote) => vote.magnitude + acc, 0) + displayMagnitude}
      </span>
      <ChevronDownIcon
        className={clsx(
          'h-8 w-8 stroke-2',
          displayMagnitude < 0 ? 'text-orange-500' : ' text-gray-400'
        )}
        onClick={async () => await vote(-1)}
      />
    </Col>
  )
}
