import { Row } from '@/components/layout/row'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'

export function Tier(props: { tierId: string; projectTitles: string[] }) {
  const { tierId, projectTitles } = props
  return (
    <Droppable
      droppableId={tierId}
      type="CARD"
      direction="horizontal"
      isCombineEnabled={false}
    >
      {(dropProvided) => (
        <div {...dropProvided.droppableProps}>
          <Row className="flex-2 w-full items-center gap-3 rounded border-2 border-dashed border-gray-500 p-4">
            <p className="w-24 text-center">{tierId}</p>
            <Row
              className="col-span-3 w-full overflow-auto"
              ref={dropProvided.innerRef}
            >
              {projectTitles.map((title, index) => (
                <EvalsProjectCard key={title} title={title} index={index} />
              ))}
              {dropProvided.placeholder}
            </Row>
          </Row>
        </div>
      )}
    </Droppable>
  )
}
