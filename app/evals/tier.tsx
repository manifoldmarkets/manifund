import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './sortable-item'

export default function Tier(props: { id: string; items: string[] }) {
  const { id, items } = props

  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="rounded border-2 border-dashed border-gray-500 p-6"
      >
        {items.map((id) => (
          <SortableItem key={id} id={id}>
            <div className="m-1 rounded bg-rose-500 p-4 text-white shadow">
              Item #{id}
            </div>
          </SortableItem>
        ))}
      </div>
    </SortableContext>
  )
}
