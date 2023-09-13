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
          <div className="m-2 rounded bg-rose-500 p-3 text-white shadow">
            {title}
          </div>
        </div>
      )}
    </Draggable>
  )
}
