'use client'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { ProjectCard } from './project-card'
import { searchInAny } from '@/utils/parse'
import { Row } from './layout/row'
import { Button } from './button'
import { SimpleCause, Cause } from '@/db/cause'
import { CauseTag } from './tags'
import { Input } from './input'
import clsx from 'clsx'

import { Select } from './select'
import { sortBy } from 'lodash'
import { countVotes, hotScore } from '@/utils/sort'
import {
  ProjectType,
  getVoteCount,
  getCommentCount,
  getAmountRaised,
  isLiteProject,
  isFullProject,
} from '@/utils/project-utils'
import { LiteProject } from '@/db/project'
import { FullProject } from '@/db/project'
import { calculateAmountRaised as getAmountRaisedUtil } from '@/utils/math'
import { getProjectValuation } from '@/utils/math'
import { ProjectGroup } from '@/components/project-group'
import { Col } from './layout/col'
import { SearchBar } from './input'
import { LoadMoreUntilNotVisible } from './widgets/visibility-observer'
import { MiniCause } from '@/db/cause'

type SortOption =
  | 'votes'
  | 'goal'
  | 'hot'
  | 'comments'
  | 'newest'
  | 'oldest'
  | 'valuation'
  | 'funding'
  | 'price'
  | 'closing soon'

const DEFAULT_SORT_OPTIONS = [
  'hot',
  'newest',
  'votes',
  'comments',
  'funding',
  'closing soon',
] as SortOption[]

export function ProjectsDisplay(props: {
  projects: LiteProject[]
  causesList: SimpleCause[]
  defaultSort?: SortOption
  hideRound?: boolean
  searchBar?: boolean
  sortOptions?: SortOption[]
}) {
  const {
    projects,
    causesList,
    defaultSort = 'hot',
    hideRound = false,
    searchBar = true,
    sortOptions = DEFAULT_SORT_OPTIONS,
  } = props

  const [search, setSearch] = useState('')
  const [selectedCauseNames, setSelectedCauseNames] = useState<Cause[]>([])
  const [numToShow, setNumToShow] = useState(30)
  const [sort, setSort] = useState<SortOption>(defaultSort)
  const prices = getPrices(projects)
  const filtered = filterProjects(projects, selectedCauseNames)
  const sorted = sortProjects(filtered, prices, sort)
  const displayed = sorted
    .filter((project) => {
      return searchInAny(
        search,
        project.title,
        project.blurb ?? '',
        project.profiles?.full_name ?? '',
        project.profiles?.username ?? ''
      )
    })
    .slice(0, numToShow)

  const fundableProjects = displayed.filter(
    (project) => project.stage == 'proposal' || project.stage == 'active'
  )
  const completeProjects = displayed.filter(
    (project) => project.stage == 'complete'
  )
  const unfundedProjects = displayed.filter(
    (project) => project.stage == 'not funded'
  )

  return (
    <Col className="gap-2">
      <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
        <SearchBar search={search} setSearch={setSearch} className="w-full" />
        <div className="lg:w-4/12">
          <Select
            options={sortOptions}
            selected={sort}
            onSelect={(event) => setSort(event as SortOption)}
            label="Sort by"
          />
        </div>
      </div>
      {!hideRound && (
        <div className="relative w-full">
          <Listbox
            value={selectedCauseNames}
            onChange={setSelectedCauseNames}
            multiple
          >
            {({ open }) => (
              <CauseFilterSelect
                includedCauses={selectedCauseNames}
                setIncludedCauses={setSelectedCauseNames}
                open={open}
                causes={causesList.filter((c) => !c.prize)}
              />
            )}
          </Listbox>
        </div>
      )}
      <div className="mt-2 flex flex-col gap-5 sm:mt-5 sm:gap-10">
        {fundableProjects.length > 0 && (
          <div>
            <ProjectGroup projects={fundableProjects} prices={prices} />
          </div>
        )}
        {completeProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-lg font-bold text-gray-900 sm:text-2xl">
              Complete Projects
            </h1>
            <ProjectGroup projects={completeProjects} prices={prices} />
          </div>
        )}
        {unfundedProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-lg font-bold text-gray-900 sm:text-2xl">
              Unfunded Projects
            </h1>
            <ProjectGroup projects={unfundedProjects} prices={prices} />
          </div>
        )}
      </div>
      <LoadMoreUntilNotVisible
        loadMore={() => {
          setNumToShow(numToShow + 30)
          return Promise.resolve(true)
        }}
      />
    </Col>
  )
}

function sortProjects(
  projects: ProjectType[],
  prices: { [k: string]: number },
  sortType: SortOption
) {
  // Filter bids for FullProjects
  projects.forEach((project) => {
    if ('bids' in project) {
      project.bids = project.bids.filter((bid) => bid.status == 'pending')
    }
  })
  if (sortType === 'votes') {
    return sortBy(projects, (project) =>
      'vote_count' in project
        ? -project.vote_count
        : -countVotes(project as FullProject)
    )
  }
  if (sortType === 'oldest') {
    return sortBy(projects, (project) => new Date(project.created_at))
  }
  if (sortType === 'newest') {
    return sortBy(projects, (project) => -new Date(project.created_at))
  }
  if (sortType === 'comments') {
    return sortBy(
      projects,
      (project) =>
        -('comment_count' in project
          ? project.comment_count
          : project.comments.length)
    )
  }
  if (sortType === 'price' || sortType === 'goal' || sortType === 'valuation') {
    // TODO: Prices and goal seems kinda broken atm
    return sortBy(projects, (project) => -prices[project.id])
  }
  if (sortType === 'funding') {
    return sortBy(
      projects,
      (project) =>
        -('amount_raised' in project
          ? project.amount_raised
          : getAmountRaisedUtil(
              project as FullProject,
              (project as FullProject).bids,
              (project as FullProject).txns
            ))
    )
  }
  if (sortType === 'hot') {
    return sortBy(projects, (project) =>
      'vote_count' in project
        ? hotScoreLite(project as LiteProject)
        : hotScore(project as FullProject)
    )
  }
  if (sortType === 'closing soon') {
    return sortBy(projects, (project) => {
      // Show proposals with a close date of today or later
      if (project.stage === 'proposal' && project.auction_close) {
        console.log(project.auction_close)
        const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
        if (closeDate >= new Date()) {
          return closeDate.getTime()
        }
      }
      return Infinity
    })
  }
  return projects
}

function filterProjects(projects: ProjectType[], includedCauses: Cause[]) {
  if (includedCauses.length === 0) return projects
  return projects.filter((project) => {
    return project.causes.some((cause) => {
      return includedCauses.some((includedCause) => {
        return cause.slug === includedCause.slug
      })
    })
  })
}

function CauseFilterSelect(props: {
  includedCauses: Cause[]
  setIncludedCauses: (causes: Cause[]) => void
  open: boolean
  causes: MiniCause[]
}) {
  const { includedCauses, setIncludedCauses, open, causes } = props
  return (
    <div>
      <div>
        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base sm:leading-6">
          <Row className="flex-wrap gap-1">
            <span className="text-gray-500">Include</span>
            {includedCauses.length === 0 ? (
              ' all causes'
            ) : (
              <>
                {includedCauses.map((cause) => {
                  return (
                    <CauseTag
                      causeTitle={cause.title}
                      causeSlug={cause.slug}
                      key={cause.slug}
                      noLink
                    />
                  )
                })}
              </>
            )}
          </Row>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
      </div>
      <Transition
        show={open}
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-sm text-gray-900 hover:bg-orange-500 hover:text-white">
            <button
              onClick={() => setIncludedCauses([])}
              className="w-full text-left"
            >
              All causes
            </button>
            {includedCauses.length === 0 ? (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                <CheckIcon className="h-5 w-5" aria-hidden="true" />
              </span>
            ) : null}
          </div>
          {causes.map((cause) => (
            <Listbox.Option
              key={cause.title}
              className={({ active }) =>
                clsx(
                  active ? 'bg-orange-500 text-white' : 'text-gray-900',
                  'relative cursor-pointer select-none py-2 pl-3 pr-9'
                )
              }
              value={cause}
            >
              {({ selected, active }) => (
                <>
                  <CauseTag
                    causeTitle={cause.title}
                    causeSlug={cause.slug}
                    noLink
                  />
                  {selected ? (
                    <span
                      className={clsx(
                        active ? 'text-white' : 'text-orange-500',
                        'absolute inset-y-0 right-0 flex items-center pr-4'
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </div>
  )
}

// Hot score for LiteProject
function hotScoreLite(project: LiteProject) {
  // Factors:
  // Time in days since project was created
  let time = Date.now() - new Date(project.created_at).getTime()
  time = time / (1000 * 60 * 60 * 24)

  const votes = project.vote_count
  const comments = project.comment_count
  const raised = project.amount_raised

  const points = votes * 2 + comments + Math.log(raised + 1) * 3
  // Hacker News newness algorithm
  const score = (points + 2) / time ** 1.8

  return -score
}

// Price here means goal for grants and valuation for certs
function getPrices(projects: ProjectType[]) {
  const prices = Object.fromEntries(projects.map((project) => [project.id, 0]))
  projects.forEach((project) => {
    if ('bids' in project && 'txns' in project) {
      prices[project.id] = getProjectValuation(project as FullProject)
    } else {
      // For LiteProject, use funding_goal as a simple approximation
      prices[project.id] = project.funding_goal
    }
  })
  return prices
}
