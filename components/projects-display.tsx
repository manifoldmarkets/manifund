'use client'
import { FullProject } from '@/db/project'
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Listbox, Switch, Transition } from '@headlessui/react'
import { useSearchParams, useRouter } from 'next/navigation'
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
import { sortBy } from 'lodash'
import { getSponsoredAmount } from '@/utils/constants'

type SortOption =
  | 'funding goal'
  | 'valuation'
  | 'price'
  | 'percent funded'
  | 'number of comments'
  | 'newest first'
  | 'oldest first'

export function ProjectsDisplay(props: {
  projects: FullProject[]
  sortOptions: SortOption[]
  defaultSort?: SortOption
  hideRound?: boolean
}) {
  const { projects, defaultSort, hideRound, sortOptions } = props
  const [sortBy, setSortBy] = useState<SortOption>(
    defaultSort ?? 'newest first'
  )
  const isRegrants = !projects.find((project) => project.type !== 'grant')
  const [includeOpenCall, setIncludeOpenCall] = useState<boolean>(!isRegrants)
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const prices = getPrices(projects)
  const [search, setSearch] = useState<string>(searchParams.get('q') || '')

  const selectedProjects = searchProjects(
    sortProjects(projects, prices, sortBy),
    search
  )
  const proposals = selectedProjects.filter((project) => {
    if (!includeOpenCall) {
      return project.stage == 'proposal' && isRegrantorInitiated(project)
    } else {
      return project.stage == 'proposal'
    }
  })
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
    <div>
      <div className="flex flex-col justify-between gap-2 lg:flex-row">
        <div className="relative rounded-md shadow-sm lg:w-8/12">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            autoComplete="off"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:leading-6"
            placeholder="Search..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              router.push(`?q=${event.target.value}`)
            }}
          />
        </div>
        <div className="relative lg:w-4/12">
          <Listbox
            value={sortBy}
            onChange={(event) => {
              setSortBy(event)
              router.refresh()
            }}
          >
            {({ open }) => (
              <SortSelect sortBy={sortBy} open={open} options={sortOptions} />
            )}
          </Listbox>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-10">
        {proposals.length > 0 && (
          <div>
            <Row className="items-center justify-between">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Proposals
              </h1>

              {
                // Toggle to include open call proposals on Regrants page only
                isRegrants && (
                  <Row className="items-center gap-1">
                    <span className="text-xs font-light text-gray-500">
                      include open call
                    </span>
                    <Switch
                      checked={includeOpenCall}
                      onChange={setIncludeOpenCall}
                      className={`${
                        includeOpenCall ? 'bg-orange-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${
                          includeOpenCall ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </Row>
                )
              }
            </Row>
            <ProjectGroup
              projects={proposals}
              prices={prices}
              hideRound={hideRound}
            />
          </div>
        )}
        {activeProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Active Projects
            </h1>
            <ProjectGroup
              projects={activeProjects}
              prices={prices}
              hideRound={hideRound}
            />
          </div>
        )}
        {completeProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Complete Projects
            </h1>
            <ProjectGroup
              projects={completeProjects}
              prices={prices}
              hideRound={hideRound}
            />
          </div>
        )}
        {unfundedProjects.length > 0 && (
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Unfunded Projects
            </h1>
            <ProjectGroup
              projects={unfundedProjects}
              prices={prices}
              hideRound={hideRound}
            />
          </div>
        )}
      </div>
    </div>
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
  return projects
}

function searchProjects(projects: FullProject[], search: string) {
  const check = (field: string) => {
    return field.toLowerCase().includes(search.toLowerCase())
  }
  return (
    projects?.filter((project) => {
      // Not currently checking description
      return (
        check(project.title) ||
        check(project.blurb ?? '') ||
        check(project.profiles.username) ||
        check(project.profiles.full_name)
      )
    }) ?? []
  )
}

function SortSelect(props: {
  sortBy: string
  open: boolean
  options: SortOption[]
}) {
  const { sortBy, open, options } = props
  return (
    <div>
      <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:leading-6">
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
                  'relative cursor-pointer select-none py-2 pl-3 pr-9'
                )
              }
              value={option}
            >
              {({ selected, active }) => (
                <>
                  <span
                    className={clsx(
                      selected ? 'font-semibold' : 'font-normal',
                      'block truncate'
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
            project.bids,
            getProposalValuation(project)
          )
  })
  return prices
}

function isRegrantorInitiated(project: FullProject) {
  const firstDonor =
    project.stage === 'proposal'
      ? sortBy(project.bids, 'created_at')[0]?.bidder
      : sortBy(project.txns, 'created_at')[0]?.from_id
  return getSponsoredAmount(firstDonor ?? '') !== 0
}
