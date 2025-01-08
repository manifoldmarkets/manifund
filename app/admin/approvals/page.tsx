import { createAdminClient } from '@/pages/api/_db'
import { GrantVerdict } from '../grant-verdict'
import Link from 'next/link'
import clsx from 'clsx'
import { Table } from '@/components/table-catalyst'

export const revalidate = 300

export default async function ApprovalsPage() {
  const supabaseAdmin = createAdminClient()
  // Instead of using listProjects, only fetch the fields out of the projects that we need
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select(
      'id, title, slug, stage, approved, min_funding, lobbying, signed_agreement, profiles!projects_creator_fkey(username, full_name), bids(amount, type)'
    )
    .eq('stage', 'proposal')
    .order('created_at', { ascending: false })
    .throwOnError()

  const projectsToApprove =
    projects?.filter(
      (project) =>
        project.stage === 'proposal' &&
        project.approved === null &&
        project.bids.reduce(
          (acc, bid) =>
            bid.type === 'assurance buy' || bid.type === 'donate'
              ? acc + bid.amount
              : acc,
          0
        ) >= project.min_funding
    ) ?? []

  return (
    <Table>
      <thead>
        <tr>
          <th className="p-2 text-center">Creator</th>
          <th className="p-2 text-center">Project</th>
          <th className="p-2 text-center">Grant verdict</th>
        </tr>
      </thead>
      <tbody className="p-2">
        {projectsToApprove.map((project) => (
          <tr key={project.id}>
            <td>
              <Link href={`/${project.profiles?.username}`}>
                {project.profiles?.full_name}
              </Link>
            </td>
            <td>
              <Link
                href={`/projects/${project.slug}`}
                className={clsx(
                  project.signed_agreement ? 'text-gray-900' : 'text-rose-600'
                )}
              >
                {project.title}
              </Link>
            </td>
            <td>
              <GrantVerdict
                projectId={project.id}
                lobbying={project.lobbying}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
