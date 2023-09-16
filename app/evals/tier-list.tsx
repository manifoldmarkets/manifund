'use client'
import { Col } from '@/components/layout/col'
import { MiniProject } from '@/db/project'
import { sortBy } from 'lodash'
import { useState } from 'react'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { Tier } from './tier'

export type Tier = {
  id: string
  color: string
  description?: string
  multiplier?: number
  projects: MiniProject[]
}
export type ConfidenceMap = { [key: string]: number }

export function TierList(props: { projects: MiniProject[] }) {
  const { projects } = props
  const [tiers, setTiers] = useState<Tier[]>([
    { id: 'unsorted', projects: projects, color: 'gray-500' },
    {
      id: '5',
      description: 'outstanding',
      multiplier: 10,
      color: 'emerald-800',
      projects: [],
    },
    {
      id: '4',
      description: 'great',
      multiplier: 3,
      color: 'emerald-600',
      projects: [],
    },
    {
      id: '3',
      description: 'good (~LTFF funding bar)',
      multiplier: 1,
      color: 'emerald-500',
      projects: [],
    },
    {
      id: '2',
      description: 'ok',
      multiplier: 0.3,
      color: 'emerald-400',
      projects: [],
    },
    {
      id: '1',
      description: 'net positive',
      multiplier: 0.1,
      color: 'emerald-300',
      projects: [],
    },
    {
      id: '0',
      description: 'net 0',
      multiplier: 0,
      color: 'gray-300',
      projects: [],
    },
    {
      id: '-1',
      description: 'net negative',
      multiplier: -0.1,
      color: 'rose-300',
      projects: [],
    },
    {
      id: '-2',
      description: 'bad',
      multiplier: -0.3,
      color: 'rose-400',
      projects: [],
    },
    {
      id: '-3',
      description: 'more bad',
      multiplier: -1,
      color: 'rose-500',
      projects: [],
    },
    {
      id: '-4',
      description: 'possibly really bad',
      multiplier: -3,
      color: 'rose-600',
      projects: [],
    },
    {
      id: '-5',
      description: 'probably really bad',
      multiplier: -10,
      color: 'rose-800',
      projects: [],
    },
  ])
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
        setTiers(reorderProjects(tiers, source, destination))
      }}
    >
      <Col className="gap-2 rounded px-6">
        {tiers.map((tier) => (
          <Tier
            key={tier.id}
            tier={tier}
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
  tiers: Tier[],
  source: DraggableLocation,
  destination: DraggableLocation
) {
  const current = tiers.find((tier) => tier.id === source.droppableId)
  const next = tiers.find((tier) => tier.id === destination.droppableId)
  const target = current?.projects[source.index]
  if (!current || !next || !target) {
    return tiers
  }
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current.projects, source.index, destination.index)
    return tiers.map((tier) => {
      if (tier.id === source.droppableId) {
        return {
          ...tier,
          projects: reordered,
        }
      }
      return tier
    })
  }
  current.projects.splice(source.index, 1)
  next.projects.splice(destination.index, 0, target)
  return tiers.map((tier) => {
    if (tier.id === source.droppableId) {
      return {
        ...tier,
        projects: current.projects,
      }
    }
    if (tier.id === destination.droppableId) {
      return {
        ...tier,
        projects: next.projects,
      }
    }
    return tier
  })
}
