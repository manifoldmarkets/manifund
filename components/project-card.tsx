'use client'
import { Profile } from '@/db/profile'
import { formatLargeNumber, getValuation, Project } from '@/db/project'
import Link from 'next/link'
import { Avatar } from './avatar'

export function ProjectCard(props: { project: Project; creator: Profile }) {
  const { creator, project } = props
  console.log('creator', creator)
  return (
    <Link
      className="rounded-md border border-orange-200 bg-white p-4 shadow hover:cursor-pointer hover:bg-orange-200"
      href={`projects/${project.slug}`}
    >
      <h1 className="text-2xl font-bold">{project.title}</h1>
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
      <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      <p>
        Raising ${formatLargeNumber(project.min_funding)} @ $
        {getValuation(project)}
      </p>
    </Link>
  )
}
