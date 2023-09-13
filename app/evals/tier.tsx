import React from 'react'
import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './sortable-item'
import { Row } from '@/components/layout/row'

export default function Tier(props: { id: string; items: UniqueIdentifier[] }) {
  const { id, items } = props

  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <Row className="rounded border-2 border-dashed border-gray-500 p-6 text-gray-500">
      {id}
      <SortableContext
        id={id}
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef}>
          {items.map((id) => (
            <SortableItem key={id} id={id}>
              <div className="m-1 rounded bg-rose-500 p-4 text-white shadow">
                Item #{id}
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </Row>
  )
}
