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
  return (
    <Col className="relative items-center gap-2">
      <ChevronUpIcon className="h-8 w-8 stroke-2 text-gray-400" />
      <span className="absolute top-6 text-gray-400">
        {votes.reduce((acc, vote) => vote.vote + acc, 0)}
      </span>
      <ChevronDownIcon className="h-8 w-8 stroke-2 text-gray-400" />
    </Col>
  )
}
