'use client'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { MiniProject } from '@/db/project'
import useLocalStorage, {
  clearLocalStorageItem,
} from '@/hooks/use-local-storage'
import { cloneDeep } from 'lodash'
import { useEffect, useState } from 'react'
import { resetServerContext } from 'react-beautiful-dnd'
import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { TbInnerShadowLeft } from 'react-icons/tb'
import { ProjectEval } from './page'
import { Tier } from './tier'

export type Tier = {
  id: string
  color: string
  description?: string
  multiplier?: number
  projects: MiniProject[]
}
export type ConfidenceMap = { [key: string]: number }

export function TierList(props: {
  projects: MiniProject[]
  evals: ProjectEval[]
}) {
  // From https://github.com/atlassian/react-beautiful-dnd/issues/1756#issuecomment-599388505
  resetServerContext()
  const { projects, evals } = props
  const madeTiers = makeTiers(projects, evals)
  const { value: tiers, saveValue: saveTiers } = useLocalStorage<Tier[]>(
    madeTiers,
    'tiers'
  )
  const blankConfidenceMap = projects.reduce((object, project) => {
    return {
      ...object,
      [project.id]: 0.5,
    }
  }, {})
  const { value: confidenceMap, saveValue: saveConfidenceMap } =
    useLocalStorage<ConfidenceMap>(blankConfidenceMap, 'confidenceMap')
  useEffect(() => {
    saveConfidenceMap({ ...blankConfidenceMap, ...confidenceMap })
  }, [projects])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = async () => {
    setIsSubmitting(true)
    await fetch('/api/save-evals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tiers,
        confidenceMap,
      }),
    })
    clearLocalStorageItem('confidenceMap')
    clearLocalStorageItem('tiers')
    setIsSubmitting(false)
  }
  return (
    <>
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          // Dropped outside the list
          if (!destination) {
            return
          }
          saveTiers(reorderProjects(tiers, source, destination))
        }}
      >
        <Col className="gap-2 rounded px-6">
          {tiers?.map((tier) => (
            <Tier
              key={tier.id}
              tier={tier}
              confidenceMap={confidenceMap}
              setConfidenceMap={saveConfidenceMap}
            />
          ))}
        </Col>
      </DragDropContext>
      <Button onClick={handleSubmit} loading={isSubmitting}>
        Save tiers
      </Button>
    </>
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

const EMPTY_TIERS: Tier[] = [
  { id: 'unsorted', projects: [], color: 'gray-500' },
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
]

function makeTiers(projects: MiniProject[], projectEvals: ProjectEval[]) {
  const tiers = cloneDeep(EMPTY_TIERS)
  projects.forEach((project) => {
    const projectEval = projectEvals.find(
      (projectEval) => projectEval.project_id === project.id
    )
    if (projectEval) {
      const tierId = projectEval.score.toString()
      const tier = tiers.find((tier) => tier.id === tierId)
      if (tier) {
        tier.projects.push(project)
      }
    } else {
      const tier = tiers.find((tier) => tier.id === 'unsorted')
      if (tier) {
        tier.projects.push(project)
      }
    }
  })
  return tiers
}
