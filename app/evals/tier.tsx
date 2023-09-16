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
    <div className={clsx('rounded shadow', tier.bgColor)}>
      <Row
        className={clsx(
          'h-8 w-fit items-center gap-2 rounded-b px-2 text-sm text-white',
          tier.labelColor
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
      <div className="flex-inline relative w-full items-center">
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
                  className="my-1 min-h-[6rem] min-w-[80vw] items-start gap-2 lg:min-w-[40rem]"
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
