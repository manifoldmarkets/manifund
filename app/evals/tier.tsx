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
      <Row
        className={clsx(
          'h-8 w-fit items-center gap-2 rounded-b px-2 text-sm text-white',
          tier.color
        )}
      >
        <span
          className={
            tier.id === 'unsorted' ? 'text-sm' : 'text-xl font-semibold'
          }
        >
          {tier.id}
        </span>
        {tier.description && tier.multiplier !== undefined && (
          <span className="text-sm">
            {tier.description} &#47;&#47; {tier.multiplier}x
          </span>
        )}
      </Row>
      <div className="flex-inline flex-2 relative w-full items-center p-1">
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
                  className="min-h-[6rem] min-w-[90vw] items-start lg:min-w-[40rem]"
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
