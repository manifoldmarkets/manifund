import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { MiniProject } from '@/db/project'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'
import { ConfidenceMap } from './tier-list'

export function Tier(props: {
  tierId: string
  projects: MiniProject[]
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
}) {
  const { tierId, projects, confidenceMap, setConfidenceMap } = props
  return (
    <Row className="flex-inline flex-2 min-h-[8rem] w-full items-center rounded border-2 border-dashed border-gray-500 p-2">
      <Col className="text-bold justify-center rounded bg-orange-600 p-4 text-xl text-white">
        {tierId}
      </Col>
      <Droppable
        droppableId={tierId}
        type={'CARD'}
        direction="horizontal"
        isCombineEnabled={false}
      >
        {(dropProvided) => (
          <div
            {...dropProvided.droppableProps}
            className="flex flex-col overflow-auto"
          >
            <div className="inline-flex grow">
              <Row
                className="min-h-[8rem] min-w-[90vw] items-start lg:min-w-[40rem]"
                ref={dropProvided.innerRef}
              >
                {projects.map((project, index) => (
                  <EvalsProjectCard
                    key={project.slug}
                    project={project}
                    index={index}
                    confidenceMap={confidenceMap}
                    setConfidenceMap={setConfidenceMap}
                    sorted={tierId !== 'unsorted'}
                  />
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
