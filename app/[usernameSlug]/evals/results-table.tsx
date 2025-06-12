'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Project } from '@/db/project'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { sortBy } from 'es-toolkit/compat'
import Link from 'next/link'
import { useState } from 'react'
import { Result } from './page'

type ResultKey = 'insideScore' | 'outsideScore' | 'confidence' | 'overallScore'

const columns: Record<ResultKey, string> = {
  insideScore: 'Inside',
  outsideScore: 'Outside',
  confidence: 'Conf',
  overallScore: 'Overall',
}

export function ResultsTable(props: {
  resultsMap: { [k: string]: Result | null }
  projects: Project[]
}) {
  const { resultsMap, projects } = props
  const [sort, setSort] = useState<ResultKey>('overallScore')
  const sortedProjects = sortBy(projects, (project) => {
    const result = resultsMap[project.id]
    if (!result) return 0
    return -result[sort]
  })
  return (
    <Col className="mt-5 divide-y divide-gray-200">
      <div className="grid grid-cols-7 gap-2 py-2 text-sm">
        <p className="col-span-3">Project</p>
        {Object.keys(columns).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key as ResultKey)}
            className={clsx(
              'flex items-center',
              sort === key ? 'text-orange-600' : ' text-gray-600'
            )}
          >
            {columns[key as ResultKey]}
            <ChevronUpDownIcon className="h-4 w-4" />
          </button>
        ))}
      </div>
      {sortedProjects.map((project) => {
        if (!!resultsMap[project.id]) {
          return (
            <ResultRow
              key={project.id}
              project={project}
              result={resultsMap[project.id] as Result}
            />
          )
        }
      })}
    </Col>
  )
}

function ResultRow(props: { project: Project; result: Result }) {
  const { result, project } = props

  return (
    <div className="grid grid-cols-7 gap-4 py-2 text-sm">
      <Link
        className="col-span-3 line-clamp-1 hover:underline"
        href={`/projects/${project.slug}`}
      >
        {project.title}
      </Link>
      <p>{Math.round(result.insideScore * 10) / 10}</p>
      <p>
        {isNaN(result.outsideScore)
          ? 'N/A'
          : Math.round(result.outsideScore * 10) / 10}
      </p>
      <p>{result.confidence}</p>
      <p className="font-bold">{Math.round(result.overallScore * 10) / 10}</p>
    </div>
  )
}
