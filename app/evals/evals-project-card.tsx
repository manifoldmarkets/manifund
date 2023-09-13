import { Avatar } from '@/components/avatar'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { UserLink } from '@/components/user-link'
import { MiniProject } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
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
            <p className="line-clamp-3 w-40 text-sm font-semibold">
              {project.title}
            </p>
            <Row className="flex-2 items-center justify-between gap-2">
              <Row className="gap-1">
                <Avatar
                  username={creator.username}
                  avatarUrl={creator.avatar_url}
                  id={creator.id}
                  size="xxs"
                />
                <UserLink
                  name={creator.full_name}
                  username={creator.username}
                  short
                  className="inline  truncate text-xs text-gray-600"
                />
              </Row>
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
