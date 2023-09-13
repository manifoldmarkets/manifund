import { Row } from '@/components/layout/row'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'

export function Tier(props: { tierId: string; titles: string[] }) {
  const { tierId, titles } = props
  return (
    <Droppable
      droppableId={tierId}
      type={'CARD'}
      direction="horizontal"
      isCombineEnabled={false}
    >
      {(dropProvided) => (
        <div {...dropProvided.droppableProps}>
          <div className="grid w-full grid-cols-4 items-center gap-3 rounded border-2 border-dashed border-gray-500 p-4">
            {tierId}
            <Row
              className="col-span-3 w-full flex-wrap"
              ref={dropProvided.innerRef}
            >
              {titles.map((title, index) => (
                <EvalsProjectCard key={title} title={title} index={index} />
              ))}
              {dropProvided.placeholder}
            </Row>
          </div>
        </div>
      )}
    </Droppable>
  )
}
