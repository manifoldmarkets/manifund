'use client'
import { FullProject } from '@/db/project'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { ProjectGroup } from './project-group'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

export function AllProjectsDisplay(props: { projects: FullProject[] }) {
  const { projects } = props

  const sortOptions = [
    { id: 1, name: 'percent funded' },
    { id: 2, name: 'number of comments' },
    { id: 3, name: 'time created' },
  ]
  const [sortBy, setSortBy] = useState(sortOptions[1])

  const router = useRouter()

  const ACXProposals = projects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'ACX Mini-Grants')
  const indieProposals = projects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'Independent')
  const activeProjects = projects.filter((project) => project.stage == 'active')
  return (
    <div>
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
                <span className="block truncate">
                  <span className="text-gray-500">Sort by </span>
                  {sortBy.name}
                </span>
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
        {ACXProposals.length > 0 && (
          <ProjectGroup
            projects={ACXProposals}
            category="ACX Mini-Grants Proposals"
            sortBy={sortBy.name}
            ascending={false}
          />
        )}
        {indieProposals.length > 0 && (
          <ProjectGroup
            projects={indieProposals}
            category="Independent Proposals"
            sortBy={sortBy.name}
            ascending={false}
          />
        )}
        {activeProjects.length > 0 && (
          <ProjectGroup
            projects={activeProjects}
            category="Active Projects"
            sortBy={sortBy.name}
            ascending={false}
          />
        )}
      </div>
    </div>
  )
}
