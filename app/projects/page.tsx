import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'
import { formatLargeNumber, getValuation, Project } from '@/db/project'
import { getProfileById, Profile } from '@/db/profile'
import { Avatar } from '@/components/avatar'
import { ProjectCard } from '@/components/project-card'

type ProjectAndCreator = Project & { profiles: Profile }

export default async function Projects() {
  const projects = await listProjects()

  return (
    <div className="bg-dark-200 max-w-4xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              creator={project.profiles}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

async function listProjects() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles(*)')
  if (error) {
    throw error
  }
  return data as ProjectAndCreator[]
}
