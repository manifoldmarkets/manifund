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
import { SetTrust } from './set-trust'
import { ProfileAndEvals } from '@/db/profile'
import { TierList } from './tier-list'
import { Row } from '@/components/layout/row'
import { useRouter } from 'next/navigation'
import { ProfileTrust, ProjectEval } from '@/db/eval'

export type TierObj = {
  id: string
  color: string
  description?: string
  multiplier?: number
  projects: MiniProject[]
}
export type TrustObj = {
  profileId: string | null
  trust: number
}
export type ConfidenceMap = { [key: string]: number }

const TIER_LIST_KEY = 'tierList'
const CONFIDENCE_MAP_KEY = 'confidenceMap'
const TRUST_LIST_KEY = 'trustList'

export function EvalsForm(props: {
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
  const { value: trustList, setValue: setTrustList } = useLocalStorage<
    TrustObj[]
  >(initialTrustList, TRUST_LIST_KEY)
  const initialTiers = makeTiers(projects, evals)
  const { value: tiers, setValue: setTiers } = useLocalStorage<TierObj[]>(
    initialTiers,
    TIER_LIST_KEY
  )
  const initialConfidenceMap = projects.reduce((object, project) => {
    const existingEval = evals.find((e) => e.project_id === project.id)
    return {
      ...object,
      [project.id]: existingEval?.confidence ?? 0.5,
    }
  }, {})
  const { value: confidenceMap, setValue: setConfidenceMap } =
    useLocalStorage<ConfidenceMap>(initialConfidenceMap, CONFIDENCE_MAP_KEY)
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
    clearLocalStorageItem(CONFIDENCE_MAP_KEY)
    clearLocalStorageItem(TRUST_LIST_KEY)
    clearLocalStorageItem(TIER_LIST_KEY)
    setIsSubmitting(false)
  }
  return (
    <Col className="my-8 gap-4">
      <TierList
        tiers={tiers}
        setTiers={setTiers}
        confidenceMap={confidenceMap}
        setConfidenceMap={setConfidenceMap}
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
            router.push('evals/results')
          }}
          disabled={
            tiers.filter(
              (tier) => tier.id !== 'unsorted' && tier.projects.length > 0
            ).length === 0
          }
          loading={isSubmitting}
        >
          Finish and see results
        </Button>
      </Row>
    </Col>
  )
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
