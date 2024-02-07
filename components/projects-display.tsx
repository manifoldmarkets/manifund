'use client'
import { FullProject } from '@/db/project'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import {
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import clsx from 'clsx'
import { ProjectGroup } from '@/components/project-group'
import { compareDesc, compareAsc } from 'date-fns'
import { Row } from './layout/row'
import { MiniCause, Cause } from '@/db/cause'
import { CauseTag } from './tags'
import { Col } from './layout/col'
import { SearchBar } from './input'
import { searchInAny } from '@/utils/parse'

type SortOption =
  | 'votes'
  | 'funding goal'
  | 'valuation'
  | 'price'
  | 'percent funded'
  | 'distance from minimum funding'
  | 'number of comments'
  | 'newest first'
  | 'oldest first'

const DEFAULT_SORT_OPTIONS = [
  'votes',
  'newest first',
  'oldest first',
  'funding goal',
  'price',
  'percent funded',
  'distance from minimum funding',
  'number of comments',
] as SortOption[]

export function ProjectsDisplay(props: {
  projects: FullProject[]
  causesList: MiniCause[]
  sortOptions?: SortOption[]
  defaultSort?: SortOption
  hideRound?: boolean
  noFilter?: boolean
}) {
  const { projects, sortOptions, defaultSort, causesList, noFilter } = props
  const prices = getPrices(projects)
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort ?? 'votes')
  const [includedCauses, setIncludedCauses] = useState<Cause[]>([])
  const [search, setSearch] = useState<string>('')
  const filteredProjects = filterProjects(projects, includedCauses)
  const sortedProjects = sortProjects(
    noFilter ? projects : filteredProjects,
    prices,
    sortBy
  )
  const selectedProjects = sortedProjects.filter((project) => {
    return searchInAny(
      search,
      project.title,
      project.blurb ?? '',
      project.profiles.full_name,
      project.profiles.username,
      project.project_transfers?.[0]?.recipient_name ?? ''
    )
  })
  const router = useRouter()

  const proposals = selectedProjects.filter(
    // TODO: actually remove hidden projects from the list
    (project) => project.stage == 'proposal' || project.stage === 'hidden'
  )
  const activeProjects = selectedProjects.filter(
    (project) => project.stage == 'active'
  )
  const completeProjects = selectedProjects.filter(
    (project) => project.stage == 'complete'
  )
  const unfundedProjects = selectedProjects.filter(
    (project) => project.stage == 'not funded'
  )

  return (
    <Col className="gap-2">
      <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
        <SearchBar search={search} setSearch={setSearch} className="w-full" />
        <div className="relative lg:w-4/12">
          <Listbox
            value={sortBy}
            onChange={(event) => {
              setSortBy(event)
              router.refresh()
            }}
          >
            {({ open }) => (
              <SortSelect
                sortBy={sortBy}
                open={open}
                options={sortOptions ?? DEFAULT_SORT_OPTIONS}
              />
            )}
          </Listbox>
        </div>
      </div>
      {!noFilter && (
        <div className="relative w-full">
          <Listbox value={includedCauses} onChange={setIncludedCauses} multiple>
            {({ open }) => (
              <CauseFilterSelect
                includedCauses={includedCauses}
                setIncludedCauses={setIncludedCauses}
                open={open}
                causes={causesList}
              />
            )}
          </Listbox>
        </div>
      )}
      <div className="mt-2 flex flex-col gap-5 sm:mt-5 sm:gap-10">
        {proposals.length > 0 && (
          <div>
            <h1 className="mb-2 text-lg font-bold text-gray-900 sm:text-2xl">
              Proposals
            </h1>
            <ProjectGroup projects={proposals} prices={prices} />
          </div>
        )}
        {activeProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-lg font-bold text-gray-900 sm:text-2xl">
              Active Projects
            </h1>
            <ProjectGroup projects={activeProjects} prices={prices} />
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
    </Col>
  )
}

function sortProjects(
  projects: FullProject[],
  prices: { [k: string]: number },
  sortType: SortOption
) {
  projects.forEach((project) => {
    project.bids = project.bids.filter((bid) => bid.status == 'pending')
  })
  if (sortType === 'votes') {
    return projects.sort((a, b) =>
      a.project_votes.reduce((acc, vote) => acc + vote.magnitude, 0) <
      b.project_votes.reduce((acc, vote) => acc + vote.magnitude, 0)
        ? 1
        : -1
    )
  }
  if (sortType === 'oldest first') {
    return projects.sort((a, b) =>
      compareAsc(new Date(a.created_at), new Date(b.created_at))
    )
  }
  if (sortType === 'newest first') {
    return projects.sort((a, b) =>
      compareDesc(new Date(a.created_at), new Date(b.created_at))
    )
  }
  if (sortType === 'percent funded') {
    return projects.sort((a, b) =>
      getAmountRaised(a, a.bids, a.txns) / a.funding_goal <
      getAmountRaised(b, b.bids, b.txns) / b.funding_goal
        ? 1
        : -1
    )
  }
  if (sortType === 'number of comments') {
    return projects.sort((a, b) =>
      a.comments.length < b.comments.length ? 1 : -1
    )
  }
  if (
    sortType === 'price' ||
    sortType === 'funding goal' ||
    sortType === 'valuation'
  ) {
    return projects.sort((a, b) =>
      prices[a.id] <= prices[b.id] || isNaN(prices[a.id]) ? 1 : -1
    )
  }
  if (sortType === 'distance from minimum funding') {
    return projects.sort((a, b) =>
      a.min_funding - getAmountRaised(a, a.bids, a.txns) <
      b.min_funding - getAmountRaised(b, b.bids, b.txns)
        ? 1
        : -1
    )
  }
  return projects
}

function filterProjects(projects: FullProject[], includedCauses: Cause[]) {
  if (includedCauses.length === 0) return projects
  return projects.filter((project) => {
    return project.causes.some((cause) => {
      return includedCauses.some((includedCause) => {
        return cause.slug === includedCause.slug
      })
    })
  })
}

function SortSelect(props: {
  sortBy: string
  open: boolean
  options: SortOption[]
}) {
  const { sortBy, open, options } = props
  return (
    <div>
      <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base sm:leading-6">
        <div className="truncate">
          <span className="text-gray-500">Sort by </span>
          {sortBy}
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </Listbox.Button>

      <Transition
        show={open}
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options.map((option) => (
            <Listbox.Option
              key={option}
              className={({ active }) =>
                clsx(
                  active ? 'bg-orange-500 text-white' : 'text-gray-900',
                  'relative cursor-pointer select-none py-2 pl-3 pr-9 text-xs sm:text-base'
                )
              }
              value={option}
            >
              {({ selected, active }) => (
                <>
                  <span
                    className={clsx(
                      selected ? 'font-semibold' : 'font-normal',
                      'block truncate text-xs sm:text-base'
                    )}
                  >
                    {option}
                  </span>

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

// Price here means funding goal for grants and valuation for certs
function getPrices(projects: FullProject[]) {
  const prices = Object.fromEntries(projects.map((project) => [project.id, 0]))
  projects.forEach((project) => {
    prices[project.id] =
      project.type === 'grant'
        ? project.funding_goal
        : project.stage === 'proposal'
        ? getProposalValuation(project)
        : getActiveValuation(
            project.txns,
            project.id,
            getProposalValuation(project)
          )
  })
  return prices
}
