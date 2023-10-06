import { Row } from '@/components/layout/row'
import { TierObj } from './evals-form'
import React, { useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { EvalsProjectCard } from './evals-project-card'
import { ConfidenceMap } from './evals-form'
import clsx from 'clsx'
import { Input, SearchBar } from '@/components/input'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

export function Tier(props: {
  tier: TierObj
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
}) {
  const { tier, confidenceMap, setConfidenceMap } = props
  const [search, setSearch] = useState('')
  const filteredProjects =
    tier.id === 'unsorted'
      ? tier.projects.filter((project) => {
          return (
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.profiles.full_name
              .toLowerCase()
              .includes(search.toLowerCase())
          )
        })
      : tier.projects
  return (
    <div
      className={clsx(
        'rounded border-2 bg-gray-100 shadow',
        `border-${tier.color}`
      )}
    >
      <Row className="justify-between">
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
        {tier.id === 'unsorted' && (
          <SearchBar
            search={search}
            setSearch={setSearch}
            className="mr-1 mt-1 lg:w-8/12"
          />
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
                  {filteredProjects.map((project, index) => (
                    <EvalsProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      confidenceMap={confidenceMap}
                      setConfidenceMap={setConfidenceMap}
                      sorted={tier.id !== 'unsorted'}
                    />
                  ))}
                  {dropProvided.placeholder as React.ReactNode}
                </Row>
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
}

// For tailwind colors to compile
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
