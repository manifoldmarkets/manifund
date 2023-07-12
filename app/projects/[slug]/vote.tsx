'use client'
import { Col } from '@/components/layout/col'
import { ProjectVote } from '@/db/project'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

export function Vote(props: {
  projectId: string
  userId?: string
  votes: ProjectVote[]
}) {
  const { projectId, userId, votes } = props
  const userVote = votes.find((vote) => vote.voter_id === userId)
  const userVoteMagnitude = userVote?.magnitude ?? 0
  const router = useRouter()

  const vote = async (magnitude: number) => {
    if (!userId) return
    await fetch(`/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        magnitude,
      }),
    })
    router.refresh()
  }
  return (
    <Col className="relative items-center gap-2">
      <ChevronUpIcon
        className={clsx(
          'h-8 w-8 cursor-pointer stroke-2',
          userVoteMagnitude > 0 ? 'text-orange-500' : ' text-gray-400'
        )}
        onClick={async () => await vote(1)}
      />
      <span
        className="absolute top-6 cursor-pointer text-gray-400"
        onClick={async () => await vote(0)}
      >
        {votes.reduce((acc, vote) => vote.magnitude + acc, 0)}
      </span>
      <ChevronDownIcon
        className={clsx(
          'h-8 w-8 cursor-pointer stroke-2',
          userVoteMagnitude < 0 ? 'text-orange-500' : ' text-gray-400'
        )}
        onClick={async () => await vote(-1)}
      />
    </Col>
  )
}
