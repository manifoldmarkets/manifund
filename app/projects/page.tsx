import { createClient } from '@/db/supabase-server'
import { Profile } from '../edit-profile/edit-profile'
import Link from 'next/link'
import { formatLargeNumber, getValuation, Project } from '@/db/project'

export default async function Projects() {
  const projects = await listProjects()

  return (
    <div className="bg-dark-200 max-w-4xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="mt-2 grid grid-cols-2 gap-4">
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
      className="rounded-md border border-orange-200 bg-white p-4 shadow hover:cursor-pointer hover:bg-orange-200"
      href={`projects/${project.slug}`}
    >
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p>By {creator.username}</p>
      <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
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
