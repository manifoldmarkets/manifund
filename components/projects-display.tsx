'use client'
import { FullProject } from '@/db/project'
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import {
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import clsx from 'clsx'
import { ProjectGroup } from '@/components/project-group'
import { sortBy } from 'lodash'

type SortOption =
  | 'valuation'
  | 'percent funded'
  | 'number of comments'
  | 'newest first'
  | 'oldest first'

export function ProjectsDisplay(props: {
  projects: FullProject[]
  defaultSort?: SortOption
}) {
  const { projects, defaultSort } = props
  const [sortBy, setSortBy] = useState<SortOption>(
    defaultSort ?? 'newest first'
  )
  const options: SortOption[] = [
    'valuation',
    'percent funded',
    'number of comments',
    'newest first',
    'oldest first',
  ]

  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const valuations = getValuations(projects)
  const [search, setSearch] = useState<string>(searchParams.get('q') || '')

  const selectedProjects = searchProjects(
    sortProjects(projects, valuations, sortBy),
    search
  )

  const proposals = selectedProjects.filter(
    (project) => project.stage == 'proposal'
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
              <SortSelect sortBy={sortBy} open={open} options={options} />
            )}
          </Listbox>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-10">
        {proposals.length > 0 && (
          <ProjectGroup
            projects={proposals}
            category="Proposals"
            valuations={valuations}
          />
        )}
        {activeProjects.length > 0 && (
          <ProjectGroup
            projects={activeProjects}
            category="Active Projects"
            valuations={valuations}
          />
        )}
        {completeProjects.length > 0 && (
          <ProjectGroup
            projects={completeProjects}
            category="Complete Projects"
            valuations={valuations}
          />
        )}
        {unfundedProjects.length > 0 && (
          <ProjectGroup
            projects={unfundedProjects}
            category="Unfunded Projects"
            valuations={valuations}
          />
        )}
      </div>
    </div>
  )
}

function sortProjects(
  projects: FullProject[],
  valuations: { [k: string]: number },
  sortType: SortOption
) {
  projects.forEach((project) => {
    project.bids = project.bids.filter((bid) => bid.status == 'pending')
  })
  switch (sortType) {
    case 'oldest first':
      return sortBy(projects, function (project) {
        return new Date(project.created_at).getTime()
      }).reverse()
    case 'newest first':
      return sortBy(projects, function (project) {
        return new Date(project.created_at).getTime()
      })
    case 'percent funded':
      return projects.sort((a, b) =>
        getAmountRaised(a, a.bids, a.txns) / a.funding_goal <
        getAmountRaised(b, b.bids, b.txns) / b.funding_goal
          ? 1
          : -1
      )
    case 'number of comments':
      return projects.sort((a, b) =>
        a.comments.length < b.comments.length ? 1 : -1
      )
    case 'valuation':
      return projects.sort((a, b) =>
        valuations[a.id] < valuations[b.id] || isNaN(valuations[a.id]) ? 1 : -1
      )
  }
}

function searchProjects(projects: FullProject[], search: string) {
  const check = (field: string) => {
    return field.toLowerCase().includes(search.toLowerCase())
  }
  return projects.filter((project) => {
    // Not currently checking description
    return (
      check(project.title) ||
      check(project.blurb ?? '') ||
      check(project.profiles.username) ||
      check(project.profiles.full_name)
    )
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

function getValuations(projects: FullProject[]) {
  const valuations = Object.fromEntries(
    projects.map((project) => [project.id, 0])
  )
  projects.forEach((project) => {
    valuations[project.id] =
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
  return valuations
}
