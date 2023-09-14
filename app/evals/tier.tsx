import { Row } from '@/components/layout/row'
import { MiniProject } from '@/db/project';
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'
import { ConfidenceMap } from './tier-list';

export function Tier(props: { tierId: string; projects: MiniProject[]; confidenceMap: ConfidenceMap; setConfidenceMap: (confidenceMap: any) => void }) {
  const { tierId, projects, confidenceMap, setConfidenceMap } = props
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
              className="items-start min-w-[100vw] min-h-[10rem]"
              ref={dropProvided.innerRef}
            >
              {projects.map((project, index) => (
                <EvalsProjectCard key={project.slug} project={project} index={index} confidence={confidenceMap[project.slug]} setConfidenceMap={setConfidenceMap} />
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
