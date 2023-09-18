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
    <div
      className={clsx(
        'rounded border-2 bg-gray-100 shadow',
        `border-${tier.color}`
      )}
    >
      <Row
        className={clsx(
          'h-8 w-fit items-center gap-2 rounded-br px-2 text-sm text-white',
          `bg-${tier.color}`
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
                  className="my-1 min-h-[6rem] min-w-[80vw] items-start lg:min-w-[40rem]"
                  ref={dropProvided.innerRef}
                >
                  {tier.projects.map((project, index) => (
                    <EvalsProjectCard
                      key={project.id}
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

const COLORS = [
  'border-rose-800',
  'border-rose-600',
  'border-rose-500',
  'border-rose-400',
  'border-rose-300',
  'border-emerald-800',
  'border-emerald-600',
  'border-emerald-500',
  'border-emerald-400',
  'border-emerald-300',
  'border-gray-500',
  'border-gray-300',
  'bg-rose-800',
  'bg-rose-600',
  'bg-rose-500',
  'bg-rose-400',
  'bg-rose-300',
  'bg-emerald-800',
  'bg-emerald-600',
  'bg-emerald-500',
  'bg-emerald-400',
  'bg-emerald-300',
  'bg-gray-500',
  'bg-gray-300',
]
