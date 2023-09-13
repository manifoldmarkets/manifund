import { Row } from '@/components/layout/row'
import { MiniProject } from '@/db/project';
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'

export function Tier(props: { tierId: string; projects: MiniProject[] }) {
  const { tierId, projects } = props
  return (
    <Row className="flex-inline flex-2 w-full rounded border-2 border-dashed border-gray-500">
      <p>{tierId}</p>
      <Droppable
        droppableId={tierId}
        type={'CARD'}
        direction="horizontal"
        isCombineEnabled={false}
      >
        {(dropProvided) => (
          <div {...dropProvided.droppableProps} className="flex flex-col overflow-auto">
            <div className="grow inline-flex">
            <Row
              className="items-start min-w-[20rem] min-h-[10rem]"
              ref={dropProvided.innerRef}
            >
              {projects.map((project, index) => (
                <EvalsProjectCard key={project.slug} title={project.title} index={index} />
              ))}
              {dropProvided.placeholder}
            </Row>
          </div>
          </div>
        )}
      </Droppable>
    </Row>
  )
}
