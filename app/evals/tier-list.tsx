'use client'
import { useState } from 'react'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { Tier } from './tier'

export type ProjectMap = { [key: string]: string[] }

export function TierList() {
  const [projectMap, setProjectMap] = useState<ProjectMap>({
    root: ['1', '2', '3'],
    container1: ['4', '5', '6'],
    container2: ['7', '8', '9'],
    container3: [],
  })

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        // dropped outside the list
        if (!destination) {
          return
        }

        setProjectMap(reorderColors(projectMap, source, destination))
      }}
    >
      <div>
        {Object.entries(projectMap).map(([key, value]) => (
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

function reorderColors(
  colors: ProjectMap,
  source: DraggableLocation,
  destination: DraggableLocation
) {
  const current = [...colors[source.droppableId]]
  const next = [...colors[destination.droppableId]]
  const target = current[source.index]

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index)
    return {
      ...colors,
      [source.droppableId]: reordered,
    }
  }

  // moving to different list
  // remove from original
  current.splice(source.index, 1)
  // insert into next
  next.splice(destination.index, 0, target)

  return {
    ...colors,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  }
}
