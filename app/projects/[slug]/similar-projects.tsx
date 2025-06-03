'use client'
import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import Link from 'next/link'
import { formatPercent } from '@/utils/formatting'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

export type SimilarProject = {
  id: string
  slug: string
  title: string
  blurb: string
  similarity: number
}

export function SimilarProjects({
  similarProjects,
}: {
  similarProjects: SimilarProject[]
}) {
  if (similarProjects.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No similar projects found yet. Check back later!
      </div>
    )
  }

  return (
    <Col className="gap-4">
      <p className="text-sm text-gray-600">
        Based on project description similarity, here are other projects you
        might be interested in:
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {similarProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <Col className="gap-3 p-4">
                <div className="flex items-start justify-between">
                  <h3 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-orange-600">
                    {project.title}
                  </h3>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </div>

                <p className="line-clamp-3 text-sm text-gray-600">
                  {project.blurb}
                </p>

                <Row className="items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-700">
                    {formatPercent(project.similarity)} match
                  </span>
                </Row>
              </Col>
            </Card>
          </Link>
        ))}
      </div>
    </Col>
  )
}
