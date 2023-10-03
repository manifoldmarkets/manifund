import { Avatar } from '@/components/avatar'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { shortenName } from '@/components/user-link'
import { MiniProject } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import Link from 'next/link'
import { Draggable } from 'react-beautiful-dnd'
import { ConfidenceMap } from './evals-form'
import { RightCarrotIcon } from '@/components/icons'
import { Col } from '@/components/layout/col'
import clsx from 'clsx'

const DragHandleIcon = (
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
)

export function EvalsProjectCard(props: {
  project: MiniProject
  index: number
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
  sorted?: boolean
}) {
  const { project, index, confidenceMap, setConfidenceMap, sorted } = props
  const creator = project.profiles
  const shortName = shortenName(creator.full_name)
  const amountRaised =
    project.type === 'dummy' ||
    project.stage === 'proposal' ||
    project.stage === 'not funded'
      ? project.funding_goal
      : getAmountRaised(project, [], project.txns)
  return (
    <Draggable key={project.id} draggableId={project.id} index={index}>
      {(dragProvided) => (
        <div
          {...dragProvided.dragHandleProps}
          {...dragProvided.draggableProps}
          ref={dragProvided.innerRef}
        >
          <Card
            className={clsx(
              'relative m-1 flex flex-col justify-between px-3 py-2',
              sorted ? 'h-28' : 'h-24'
            )}
          >
            {DragHandleIcon}
            <Link
              className="line-clamp-3 w-40 pl-3 text-xs font-semibold leading-tight hover:underline"
              href={
                project.type === 'dummy' && !!project.external_link
                  ? project.external_link
                  : `/projects/${project.slug}`
              }
              target="_blank"
            >
              {project.title}
            </Link>
            {sorted && (
              <Col className="items-center text-gray-700">
                <Row className="justify-center gap-1">
                  <button
                    onClick={() =>
                      setConfidenceMap({
                        ...confidenceMap,
                        [project.id]:
                          confidenceMap[project.id] === 0.1
                            ? 0.01
                            : (confidenceMap[project.id] * 10 - 1) / 10,
                      })
                    }
                    disabled={confidenceMap[project.id] < 0.1}
                    className="disabled:opacity-50"
                  >
                    <RightCarrotIcon className="rotate-180" color="#6b7280" />
                  </button>
                  <p className="text-xs">{confidenceMap[project.id] * 100}%</p>
                  <button
                    onClick={() =>
                      setConfidenceMap({
                        ...confidenceMap,
                        [project.id]:
                          confidenceMap[project.id] === 0.01
                            ? 0.1
                            : (confidenceMap[project.id] * 10 + 1) / 10,
                      })
                    }
                    disabled={confidenceMap[project.id] > 0.9}
                    className="disabled:opacity-50"
                  >
                    <RightCarrotIcon color="#6b7280" />
                  </button>
                </Row>
                <p className="text-[0.6rem]">confidence</p>
              </Col>
            )}
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
              <p
                className={clsx(
                  'rounded-2xl px-1 py-0.5 text-center text-xs font-medium',
                  project.profiles.username === 'LongTermFutureFund'
                    ? 'bg-teal-100 text-teal-600'
                    : 'bg-orange-100 text-orange-600'
                )}
              >
                {formatMoney(amountRaised)}
              </p>
            </Row>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
