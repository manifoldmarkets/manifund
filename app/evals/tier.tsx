import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tier } from './tier-list'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'
import { ConfidenceMap } from './tier-list'
import clsx from 'clsx'

export function Tier(props: {
  tier: Tier
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
}) {
  const { tier, confidenceMap, setConfidenceMap } = props
  return (
    <div>
      <Col
        className={clsx(
          'text-bold left-2 top-0 w-fit justify-center rounded-b px-2 py-1 text-sm text-white',
          tier.color
        )}
      >
        {tier.id}
        {tier.description ? ` - ${tier.description}` : ''}
      </Col>
      <div className="flex-inline flex-2 relative min-h-[8rem] w-full items-center p-1">
        <Droppable
          droppableId={tier.id}
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
                  {tier.projects.map((project, index) => (
                    <EvalsProjectCard
                      key={project.slug}
                      project={project}
                      index={index}
                      confidenceMap={confidenceMap}
                      setConfidenceMap={setConfidenceMap}
                      sorted={tier.id !== 'unsorted'}
                    />
                  ))}
                  {dropProvided.placeholder}
                </Row>
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
}
