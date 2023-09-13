import { Row } from '@/components/layout/row'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'

export function Tier(props: {
  listId: string
  listType?: string
  titles: string[]
}) {
  const { listId, listType, titles } = props
  return (
    <Droppable
      droppableId={listId}
      type={listType}
      direction="horizontal"
      isCombineEnabled={false}
    >
      {(dropProvided) => (
        <div {...dropProvided.droppableProps}>
          <div>
            <div>
              <Row
                className="flex-wrap rounded border-2 border-dashed border-gray-500 p-4"
                ref={dropProvided.innerRef}
              >
                {titles.map((title, index) => (
                  <EvalsProjectCard key={title} title={title} index={index} />
                ))}
                {dropProvided.placeholder}
              </Row>
            </div>
          </div>
        </div>
      )}
    </Droppable>
  )
}
