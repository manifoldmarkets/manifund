'use client'
import { FullProject } from '@/db/project'
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { ProjectGroup } from './project-group'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

export function AllProjectsDisplay(props: { projects: FullProject[] }) {
  const { projects } = props

  const sortOptions = [
    { id: 1, name: 'percent funded' },
    { id: 2, name: 'number of comments' },
    { id: 3, name: 'newest first' },
    { id: 4, name: 'oldest first' },
  ]
  const [sortBy, setSortBy] = useState(sortOptions[0])

  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState<string>(searchParams.get('q') || '')

  const selectedProjects = searchProjects(
    sortProjects(projects, sortBy.name),
    search
  )

  const acxProposals = selectedProjects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'ACX Mini-Grants')
  const indieProposals = selectedProjects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'Independent')
  const activeProjects = selectedProjects.filter(
    (project) => project.stage == 'active'
  )

  return (
    <div>
      <div className="relative mt-2 rounded-md shadow-sm">
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
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:leading-6"
          placeholder="Search..."
          value={search}
          onChange={(event) => {
            console.log('search event')
            setSearch(event.target.value)
            router.push(`?q=${event.target.value}`)
          }}
        />
      </div>

      <Listbox
        value={sortBy}
        onChange={(event) => {
          setSortBy(event)
          router.refresh()
        }}
      >
        {({ open }) => (
          <>
            <div className="relative mt-2">
              <Listbox.Button className=" relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:leading-6">
                <div className="truncate">
                  <span className="text-gray-500">Sort by </span>
                  {sortBy.name}
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
                <Listbox.Options className=" absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      className={({ active }) =>
                        clsx(
                          active ? 'bg-orange-500 text-white' : 'text-gray-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9'
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
                            {option.name}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? 'text-white' : 'text-orange-500',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
      <div className="flex flex-col gap-10 p-4">
        {acxProposals.length > 0 && (
          <ProjectGroup
            projects={acxProposals}
            category="ACX Mini-Grants Proposals"
          />
        )}
        {indieProposals.length > 0 && (
          <ProjectGroup
            projects={indieProposals}
            category="Independent Proposals"
          />
        )}
        {activeProjects.length > 0 && (
          <ProjectGroup projects={activeProjects} category="Active Projects" />
        )}
      </div>
    </div>
  )
}

function sortProjects(projects: FullProject[], sortBy: string) {
  projects.forEach((project) => {
    project.bids = project.bids.filter((bid) => bid.status == 'pending')
  })
  switch (sortBy) {
    case 'oldest first':
      return projects.sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    case 'newest first':
      return projects.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    case 'percent funded':
      return projects.sort((a, b) =>
        a.bids.reduce((acc, bid) => acc + bid.amount, 0) / a.min_funding <
        b.bids.reduce((acc, bid) => acc + bid.amount, 0) / b.min_funding
          ? 1
          : -1
      )
    case 'number of comments':
      return projects.sort((a, b) =>
        a.comments.length < b.comments.length ? 1 : -1
      )
    default:
      return projects
  }
}

function searchProjects(projects: FullProject[], search: string) {
  return projects.filter((project) => {
    return (
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description
        ?.toString()
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      project.profiles.username.toLowerCase().includes(search.toLowerCase()) ||
      project.profiles.full_name.toLowerCase().includes(search.toLowerCase())
    )
  })
}
