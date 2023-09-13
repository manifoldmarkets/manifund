import { Avatar } from '@/components/avatar'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { MiniProject } from '@/db/project'
import { Draggable } from 'react-beautiful-dnd'

export function EvalsProjectCard(props: {
  project: MiniProject
  index: number
}) {
  const { project, index } = props
  return (
    <Draggable key={project.slug} draggableId={project.slug} index={index}>
      {(dragProvided) => (
        <div
          {...dragProvided.dragHandleProps}
          {...dragProvided.draggableProps}
          ref={dragProvided.innerRef}
        >
          <Card className="m-2 flex h-28 flex-col justify-between">
            <p className="line-clamp-3 w-40 text-sm font-semibold">
              {project.title}
            </p>
            <Row className="gap-1">
              <Avatar
                username={project.profiles.username}
                avatarUrl={project.profiles.avatar_url}
                id={project.profiles.id}
                size="xxs"
              />
              <p className="text-xs text-gray-600">
                {project.profiles.full_name}
              </p>
            </Row>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
