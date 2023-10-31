import { DragDropContext, DraggableLocation } from 'react-beautiful-dnd'
import { ConfidenceMap, TierObj } from './evals-form'
import { Tier } from './tier'
import { Col } from '@/components/layout/col'

export function TierList(props: {
  tiers: TierObj[]
  setTiers: (tiers: TierObj[]) => void
  confidenceMap: ConfidenceMap
  setConfidenceMap: (confidenceMap: ConfidenceMap) => void
}) {
  const { tiers, setTiers, confidenceMap, setConfidenceMap } = props
  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        // Dropped outside the list
        if (!destination) {
          return
        }
        setTiers(reorderProjects(tiers, source, destination))
      }}
    >
      {/* @ts-ignore */}
      <Col className="gap-2 rounded">
        {tiers?.map((tier) => (
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
  tiers: TierObj[],
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
