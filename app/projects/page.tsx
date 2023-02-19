import { Database } from '@/db/database.types'
import { createClient } from '@/db/supabase-server'
import { Profile } from '../edit-profile/edit-profile'
import Link from 'next/link'
import { formatLargeNumber, getValuation, Project } from '@/db/project'

export default async function Projects() {
  const projects = await listProjects()

  return (
    <div className="max-w-4xl bg-dark-200">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {projects.map((project) => (
            // @ts-expect-error Server Component
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}

async function ProjectCard(props: { project: Project }) {
  const { project } = props
  const creator = await getProfile(project.creator)
  return (
    <Link
      className="p-4 bg-white border border-orange-200 shadow rounded-md hover:bg-orange-200 hover:cursor-pointer"
      href={`projects/${project.slug}`}
    >
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p>By {creator.username}</p>
      <p className="text-gray-500 font-light mb-2">{project.blurb}</p>
      <p>
        Raising ${formatLargeNumber(project.min_funding)} @ $
        {getValuation(project)}
      </p>
    </Link>
  )
}

async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
  if (error) {
    throw error
  }
  return data[0] as Profile
}

async function listProjects() {
  const supabase = createClient()
  const { data, error } = await supabase.from('projects').select('*')
  if (error) {
    throw error
  }
  return data as Project[]
}
