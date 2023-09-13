import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Draggable } from 'react-beautiful-dnd'

export function EvalsProjectCard(props: { title: string; index: number }) {
  const { title, index } = props
  return (
    <Draggable key={title} draggableId={title} index={index}>
      {(dragProvided) => (
        <div
          {...dragProvided.dragHandleProps}
          {...dragProvided.draggableProps}
          ref={dragProvided.innerRef}
        >
          <Card className="m-2 h-28">
            <p className="line-clamp-3">{title}</p>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
