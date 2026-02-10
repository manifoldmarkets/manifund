import { createAdminClient } from '@/db/edge'
import { listProjects } from '@/db/project'
import { AddTags } from '../add-tags'
import { ActivateProject } from '../activate-project'
import Link from 'next/link'
import { CircleStackIcon } from '@heroicons/react/24/solid'
import { Table } from '@/components/table-catalyst'

export const revalidate = 300

export default async function ProjectsPage() {
  const supabaseAdmin = createAdminClient()
  const projects = await listProjects(supabaseAdmin)

  return (
    <Table>
      <thead>
        <tr>
          <th className="p-2">DB</th>
          <th className="p-2">Title</th>
          <th className="p-2">Creator</th>
          <th className="p-2">Min funding</th>
          <th className="p-2">Add tag</th>
          <th className="p-2">Activate project</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <td className="pr-2">
              <Link
                href={`https://supabase.com/dashboard/project/fkousziwzbnkdkldjper/editor/27111?filter=id%3Aeq%3A${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                <CircleStackIcon className="inline h-3 w-3" />
              </Link>
            </td>
            <td className="max-w-sm overflow-hidden hover:underline">
              <Link href={`/projects/${project.slug}`}>{project.title}</Link>
            </td>
            <td>{project.profiles.username}</td>
            <td>{project.min_funding}</td>
            <td>
              <AddTags
                projectId={project.id}
                causeSlug={'gcr'}
                currentCauseSlugs={project.causes.map((cause) => cause.slug)}
              />
            </td>
            <td>
              <ActivateProject projectId={project.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
