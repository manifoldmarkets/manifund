'use client'

import { useState, useMemo, memo } from 'react'
import { CircleStackIcon } from '@heroicons/react/24/solid'
import { supabaseProjectRowUrl } from '@/utils/supabase-admin-url'
import { RestoreProject } from '../restore-project'

export type ProjectRow = {
  id: string
  slug: string
  title: string
  username: string | null
  minFunding: number
  stage: string
}

export function ProjectTable(props: { projects: ProjectRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return props.projects
    const q = search.toLowerCase()
    return props.projects.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.username?.toLowerCase().includes(q) ?? false)
    )
  }, [search, props.projects])

  return (
    <>
      <div className="w-full">
        <input
          type="text"
          className="mb-2 w-64 rounded border border-gray-300 px-2 py-1 text-xs placeholder-gray-400 focus:border-orange-500 focus:outline-none"
          placeholder="Search title or creator"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full table-fixed text-left text-xs">
        <colgroup>
          <col style={{ width: 24 }} />
          <col />
          <col style={{ width: 130 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 90 }} />
          <col style={{ width: 110 }} />
        </colgroup>
        <thead className="border-b text-[10px] uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="py-0.5"></th>
            <th className="py-0.5">Title</th>
            <th className="whitespace-nowrap py-0.5">Creator</th>
            <th className="whitespace-nowrap py-0.5">Stage</th>
            <th className="whitespace-nowrap py-0.5 text-right">Min</th>
            <th className="whitespace-nowrap py-0.5">Restore</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((project, i) => (
            <MemoRow key={project.id} project={project} odd={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </>
  )
}

const MemoRow = memo(function ProjectRowComponent({
  project,
  odd,
}: {
  project: ProjectRow
  odd: boolean
}) {
  return (
    <tr className={odd ? 'bg-zinc-100 hover:bg-zinc-200/60' : 'hover:bg-zinc-100/60'}>
      <td className="py-px">
        <a
          href={supabaseProjectRowUrl(project.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-600"
        >
          <CircleStackIcon className="inline h-2.5 w-2.5" />
        </a>
      </td>
      <td className="truncate py-px pr-2">
        <a href={`/projects/${project.slug}`} className="text-orange-600 hover:underline">
          {project.title}
        </a>
      </td>
      <td className="truncate py-px pr-2">
        {project.username ? (
          <a href={`/${project.username}`} className="text-zinc-500 hover:underline">
            {project.username}
          </a>
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>
      <td className="truncate py-px pr-2 text-zinc-500">{project.stage}</td>
      <td className="py-px pr-2 text-right font-mono tabular-nums text-zinc-500">
        {project.minFunding}
      </td>
      <td className="py-px">
        <RestoreProject projectId={project.id} stage={project.stage} />
      </td>
    </tr>
  )
})
