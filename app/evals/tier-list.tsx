'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  Over,
  UniqueIdentifier,
  DragOverlay,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { SortableItem } from './sortable-item'
import Tier from './tier'

export function TierList() {
  const [items, setItems] = useState<{ [key: string]: string[] }>({
    root: ['1', '2', '3'],
    container1: ['4', '5', '6'],
    container2: ['7', '8', '9'],
    container3: [],
  })
  const [activeId, setActiveId] = useState<string | null>()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h1>Tier List</h1>
      <Tier id="root" items={items.root} />
      <Tier id="container1" items={items.container1} />
      <Tier id="container2" items={items.container2} />
      <Tier id="container3" items={items.container3} />
      <DragOverlay>
        {activeId ? <SortableItem id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  )

  function findContainer(id: UniqueIdentifier) {
    if (id in items) {
      return id
    }
    return Object.keys(items).find((key) => items[key].includes(id as string))
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const { id } = active

    setActiveId(id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const { id } = active
    const { id: overId } = over as Over

    // Find the containers
    const activeContainer = findContainer(id)
    const overContainer = findContainer(overId)

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id as string)
      const overIndex = overItems.indexOf(overId as string)

      let newIndex
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1
        const modifier = isBelowLastItem ? 1 : 0

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const { id } = active
    const { id: overId } = over as Over

    const activeContainer = findContainer(id)
    const overContainer = findContainer(overId)

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return
    }

    const activeIndex = items[activeContainer].indexOf(active.id as string)
    const overIndex = items[overContainer].indexOf(overId as string)

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }))
    }
    setActiveId(null)
  }
}
