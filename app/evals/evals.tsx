'use client'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { MiniProject } from '@/db/project'
import useLocalStorage, {
  clearLocalStorageItem,
} from '@/hooks/use-local-storage'
import { cloneDeep } from 'lodash'
import { useState } from 'react'
import { resetServerContext } from 'react-beautiful-dnd'
import { DraggableLocation } from 'react-beautiful-dnd'
import { ProfileTrust, ProjectEval } from './page'
import { SetTrust } from './set-trust'
import { ProfileAndEvals } from '@/db/profile'
import { TierList } from './tier-list'
import { Row } from '@/components/layout/row'
import { useRouter } from 'next/navigation'

export type TierObj = {
  id: string
  color: string
  description?: string
  multiplier?: number
  projects: MiniProject[]
}
export type ConfidenceMap = { [key: string]: number }

export type TrustObj = {
  profileId: string | null
  trust: number
}

export function Evals(props: {
  projects: MiniProject[]
  evals: ProjectEval[]
  profiles: ProfileAndEvals[]
  profileTrusts: ProfileTrust[]
}) {
  // From https://github.com/atlassian/react-beautiful-dnd/issues/1756#issuecomment-599388505
  resetServerContext()
  const { projects, evals, profiles, profileTrusts } = props
  const initialTrustList = profileTrusts.map((trust) => {
    return { profileId: trust.trusted_id, trust: trust.weight }
  })
  const { value: trustList, saveValue: setTrustList } = useLocalStorage<
    TrustObj[]
  >(initialTrustList, 'trustList')
  const initialTiers = makeTiers(projects, evals)
  const { value: tiers, saveValue: saveTiers } = useLocalStorage<TierObj[]>(
    initialTiers,
    'tiers'
  )
  const initialConfidenceMap = projects.reduce((object, project) => {
    const existingEval = evals.find((e) => e.project_id === project.id)
    return {
      ...object,
      [project.id]: existingEval?.confidence ?? 0.5,
    }
  }, {})
  const { value: confidenceMap, saveValue: saveConfidenceMap } =
    useLocalStorage<ConfidenceMap>(initialConfidenceMap, 'confidenceMap')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
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
        trustList,
      }),
    })
    clearLocalStorageItem('confidenceMap')
    clearLocalStorageItem('trustList')
    clearLocalStorageItem('tiers')
    setIsSubmitting(false)
  }
  return (
    <Col className="my-8 gap-4">
      <TierList
        tiers={tiers}
        saveTiers={saveTiers}
        confidenceMap={confidenceMap}
        saveConfidenceMap={saveConfidenceMap}
      />
      <SetTrust
        profiles={profiles}
        trustList={trustList}
        setTrustList={setTrustList}
      />
      <Row className="justify-between">
        <Button
          onClick={async () => await handleSubmit()}
          loading={isSubmitting}
        >
          Save evaluations
        </Button>
        <Button
          onClick={async () => {
            await handleSubmit()
            router.push('/results')
          }}
          disabled={
            tiers.filter(
              (tier) => tier.id !== 'unsorted' && tier.projects.length > 0
            ).length === 0
          }
        >
          Finish and see results
        </Button>
      </Row>
    </Col>
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

const EMPTY_TIERS: TierObj[] = [
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
