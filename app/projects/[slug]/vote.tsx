'use client'
import { Col } from '@/components/layout/col'
import { ProjectVote } from '@/db/project'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

export function Vote(props: {
  projectId: string
  userId?: string
  votes: ProjectVote[]
}) {
  const { projectId, userId, votes } = props
  const userVote = votes.find((vote) => vote.voter_id === userId)

  const vote = async (vote: number) => {
    if (!userId) return
    const res = await fetch(`/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        vote,
      }),
    })
  }
  return (
    <Col className="relative items-center gap-2">
      <ChevronUpIcon
        className="h-8 w-8 cursor-pointer stroke-2 text-gray-400"
        onClick={() => vote(1)}
      />
      <span className="absolute top-6 text-gray-400">
        {votes.reduce((acc, vote) => vote.vote + acc, 0)}
      </span>
      <ChevronDownIcon
        className="h-8 w-8 cursor-pointer stroke-2 text-gray-400"
        onClick={() => vote(-1)}
      />
    </Col>
  )
}
