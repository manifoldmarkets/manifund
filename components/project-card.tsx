'use client'
import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatLargeNumber, getValuation, Project } from '@/db/project'
import Link from 'next/link'
import { Avatar } from './avatar'
import { RoundTag } from './round-tag'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
}) {
  const { creator, project, bids } = props
  return (
    <Link
      className="rounded-md border border-orange-200 bg-white px-4 pb-1 shadow hover:cursor-pointer hover:bg-orange-200"
      href={`projects/${project.slug}`}
    >
      <div className="flex justify-between">
        <div className="mt-2 flex items-center">
          <Avatar
            className="mr-2"
            username={creator?.username}
            id={creator?.id}
            noLink
            size={'xs'}
          />
          <p>{creator?.username}</p>
        </div>
        <div className="relative top-2">
          <RoundTag round={project.round} />
        </div>
      </div>
      <h1 className="mt-2 text-xl font-bold">{project.title}</h1>
      <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      <p>
        Raising ${formatLargeNumber(project.min_funding)} @ $
        {getValuation(project)}
      </p>
    </Link>
  )
}
