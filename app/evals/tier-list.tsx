'use client'
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ReactNode, useState } from 'react'

export function TierList() {
  const [isDropped, setIsDropped] = useState(false)
  const draggableMarkup = (
    <Draggable>
      <div className="rounded bg-rose-500 p-2 text-white shadow">Drag me</div>
    </Draggable>
  )
  function handleDragEnd(event: DragEndEvent) {
    if (event.over && event.over.id === 'droppable') {
      setIsDropped(true)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <h1>Tier List</h1>
      {!isDropped ? draggableMarkup : null}
      <Droppable>
        <div className="w-fit rounded border-2 border-dashed border-gray-500 p-6">
          {isDropped ? draggableMarkup : 'Drop here'}
        </div>
      </Droppable>
    </DndContext>
  )
}

function Draggable(props: { children: ReactNode }) {
  const { children } = props
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  })
  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  )
}

function Droppable(props: { children: ReactNode }) {
  const { children } = props
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  })
  const style = {
    color: isOver ? 'green' : undefined,
  }
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}
