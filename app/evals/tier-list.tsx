'use client'
import { sortBy } from 'lodash'
import { useState } from 'react'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { Tier } from './tier'

export type ProjectMap = { [key: string]: string[] }

export function TierList() {
  const [projectMap, setProjectMap] = useState<ProjectMap>({
    '5': ['1', '2', '3'],
    '4': ['4', '5', '6'],
    '3': ['7', '8', '9'],
    '2': [],
    '1': [],
    '0': [],
    '-1': [],
    '-2': [],
    '-3': [],
    '-4': [],
    '-5': [],
  })

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        // dropped outside the list
        if (!destination) {
          return
        }

        setProjectMap(reorderProjects(projectMap, source, destination))
      }}
    >
      <div>
        {sortBy(Object.entries(projectMap), (tier) => {
          return -parseInt(tier[0])
        }).map(([key, value]) => (
          <Tier key={key} tierId={key} titles={value} />
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
  projectMap: ProjectMap,
  source: DraggableLocation,
  destination: DraggableLocation
) {
  const current = [...projectMap[source.droppableId]]
  const next = [...projectMap[destination.droppableId]]
  const target = current[source.index]

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index)
    return {
      ...projectMap,
      [source.droppableId]: reordered,
    }
  }

  // moving to different list
  // remove from original
  current.splice(source.index, 1)
  // insert into next
  next.splice(destination.index, 0, target)

  return {
    ...projectMap,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  }
}
