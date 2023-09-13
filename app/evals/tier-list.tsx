'use client'
import { MiniProject, Project } from '@/db/project'
import { sortBy } from 'lodash'
import { useState } from 'react'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { Tier } from './tier'

export type TierMap = { [key: string]: string[] }
export type ConfidenceMap = { [key: string]: number[] }

export function TierList(props: { projects: MiniProject[] }) {
  const { projects } = props
  const [tierMap, setTierMap] = useState<TierMap>({
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
    unsorted: projects.map((project) => project.title),
  })

  const [confidenceMap, setConfidenceMap] = useState<ConfidenceMap>(
    projects.reduce((obj, project) => {
      return {
        ...obj,
        [project.id]: 0.5,
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
      <div>
        {sortBy(Object.entries(tierMap), (tier) => {
          return -parseInt(tier[0])
        }).map(([key, value]) => (
          <Tier key={key} tierId={key} projectTitles={value} />
        ))}
      </div>
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
  tierMap: TierMap,
  source: DraggableLocation,
  destination: DraggableLocation
) {
  const current = [...tierMap[source.droppableId]]
  const next = [...tierMap[destination.droppableId]]
  const target = current[source.index]

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index)
    return {
      ...tierMap,
      [source.droppableId]: reordered,
    }
  }

  // moving to different list
  // remove from original
  current.splice(source.index, 1)
  // insert into next
  next.splice(destination.index, 0, target)

  return {
    ...tierMap,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  }
}
