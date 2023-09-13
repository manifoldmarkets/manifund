import { Avatar } from '@/components/avatar'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { UserLink } from '@/components/user-link'
import { MiniProject } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import Link from 'next/link'
import { Draggable } from 'react-beautiful-dnd'

export function EvalsProjectCard(props: {
  project: MiniProject
  index: number
}) {
  const { project, index } = props
  const creator = project.profiles
  const amountRaised = getAmountRaised(project, [], project.txns)
  return (
    <Draggable key={project.slug} draggableId={project.slug} index={index}>
      {(dragProvided) => (
        <div
          {...dragProvided.dragHandleProps}
          {...dragProvided.draggableProps}
          ref={dragProvided.innerRef}
        >
          <Card className="m-2 flex h-32 flex-col justify-between !p-3">
            <Link className="line-clamp-3 w-40 text-sm font-semibold hover:underline" href={`/projects/${project.slug}`} target="_blank">
              {project.title}
            </Link>
            <Row className="flex-2 items-center justify-between gap-2">
              <Link className="flex gap-1" href={`/${creator.username}`} target="_blank">
                <Avatar
                  username={creator.username}
                  avatarUrl={creator.avatar_url}
                  id={creator.id}
                  noLink
                  size="xxs"
                />
                <UserLink
                  name={creator.full_name}
                  username={creator.username}
                  short
                  noLink
                  className="inline truncate text-xs text-gray-600"
                />
              </Link>
              <p className="rounded-2xl bg-orange-100 px-1 py-0.5 text-center text-xs font-medium text-orange-600">
                {formatMoney(amountRaised)}
              </p>
            </Row>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
