'use client'
import { Col } from '@/components/layout/col'
import { MiniProject } from '@/db/project'
import { sortBy } from 'lodash'
import { useState } from 'react'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { Tier } from './tier'

export type TierMap = { [key: string]: MiniProject[] }
export type ConfidenceMap = { [key: string]: number }

export function TierList(props: { projects: MiniProject[] }) {
  const { projects } = props
  const [tierMap, setTierMap] = useState<TierMap>({
    unsorted: projects,
    '5': [],
    '4': [],
    '3': [],
    '2': [],
    '1': [],
    '0': [],
    '-1': [],
    '-2': [],
    '-3': [],
    '-4': [],
    '-5': [],
  })
  const [confidenceMap, setConfidenceMap] = useState<ConfidenceMap>(
    projects.reduce((object, project) => {
      return {
        ...object,
        [project.slug]: 0.5,
      }
    }, {})
  )

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        // dropped outside the list
        if (!destination) {
          return
        }
        setTierMap(reorderProjects(tierMap, source, destination))
      }}
    >
      <Col className="gap-2 divide-y-2 divide-dotted divide-gray-500">
        {sortBy(Object.entries(tierMap), (tier) => {
          const tierInt = parseInt(tier[0])
          return isNaN(tierInt) ? -6 : -parseInt(tier[0])
        }).map(([key, value]) => (
          <Tier
            key={key}
            tierId={key}
            projects={value}
            confidenceMap={confidenceMap}
            setConfidenceMap={setConfidenceMap}
          />
        ))}
      </Col>
    </DragDropContext>
  )
}

function reorder(list: any[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

function reorderProjects(
  TierMap: TierMap,
  source: DraggableLocation,
  destination: DraggableLocation
) {
  const current = [...TierMap[source.droppableId]]
  const next = [...TierMap[destination.droppableId]]
  const target = current[source.index]

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index)
    return {
      ...TierMap,
      [source.droppableId]: reordered,
    }
  }

  // moving to different list
  // remove from original
  current.splice(source.index, 1)
  // insert into next
  next.splice(destination.index, 0, target)

  return {
    ...TierMap,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  }
}
