import { Avatar } from '@/components/avatar'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { shortenName } from '@/components/user-link'
import { MiniProject } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import Link from 'next/link'
import { MySlider } from '@/components/slider'
import { Draggable } from 'react-beautiful-dnd'
import { ConfidenceMap } from './tier-list'
import { Input } from '@/components/input'
import clsx from 'clsx'

export function EvalsProjectCard(props: {
  project: MiniProject
  index: number
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
}) {
  const { project, index, confidenceMap, setConfidenceMap } = props
  const creator = project.profiles
  const shortName = shortenName(creator.full_name)
  const amountRaised = getAmountRaised(project, [], project.txns)
  console.log(confidenceMap[project.slug])
  return (
    <Draggable key={project.slug} draggableId={project.slug} index={index}>
      {(dragProvided) => (
        <div
          {...dragProvided.dragHandleProps}
          {...dragProvided.draggableProps}
          ref={dragProvided.innerRef}
        >
          <Card className="relative m-2 flex h-40 flex-col justify-between px-3 py-2">
            <svg
              className="absolute left-1 top-2 opacity-50"
              height={16}
              width={16}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              id="drag-indicator"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
            </svg>
            <Link
              className="line-clamp-3 w-40 pl-3 text-sm font-semibold hover:underline"
              href={`/projects/${project.slug}`}
              target="_blank"
            >
              {project.title}
            </Link>
            <Row className="flex-2 items-center justify-between gap-2">
              <Link
                className="flex gap-1"
                href={`/${creator.username}`}
                target="_blank"
              >
                <Avatar
                  username={creator.username}
                  avatarUrl={creator.avatar_url}
                  id={creator.id}
                  noLink
                  size="xxs"
                />
                <p className="inline text-xs text-gray-600">
                  {shortName}
                  {shortName !== creator.full_name ? '...' : ''}
                </p>
              </Link>
              <p className="rounded-2xl bg-orange-100 px-1 py-0.5 text-center text-xs font-medium text-orange-600">
                {formatMoney(amountRaised)}
              </p>
            </Row>
            <Row className="justify-center gap-1">
              <button
                onClick={() =>
                  setConfidenceMap({
                    ...confidenceMap,
                    [project.slug]: (confidenceMap[project.slug] * 10 - 1) / 10,
                  })
                }
                disabled={confidenceMap[project.slug] < 0.1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-caret-right-fill rotate-180"
                  viewBox="0 0 16 16"
                >
                  <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                </svg>
              </button>
              <input
                className="w-10 rounded border-0 p-0 text-center ring-0 [appearance:textfield] focus:border-0 focus:ring-2 focus:ring-orange-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                value={confidenceMap[project.slug]}
                onChange={(e) => {
                  setConfidenceMap({
                    ...confidenceMap,
                    [project.slug]: Number(e.target.value),
                  })
                }}
              />
              <button
                onClick={() =>
                  setConfidenceMap({
                    ...confidenceMap,
                    [project.slug]: (confidenceMap[project.slug] * 10 + 1) / 10,
                  })
                }
                disabled={confidenceMap[project.slug] > 0.9}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-caret-right-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                </svg>
              </button>
            </Row>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
