import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Row } from '@/components/layout/row'
import { ProfileAndEvals } from '@/db/profile'
import { Input } from '@/components/input'
import { checkProfileComplete } from '../people/people-display'
import { cloneDeep } from 'lodash'

type Trust = {
  profileId: string
  trust: number
}

export function SetTrust(props: { profiles: ProfileAndEvals[] }) {
  const { profiles } = props
  const completeProfiles = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))
  const [trustList, setTrustList] = useState<Trust[]>([])
  return (
    <div className="p-10">
      <h1>TrustSelect</h1>
      {trustList.map((trust, index) => (
        <SetSingleTrust
          key={index}
          index={index}
          profiles={completeProfiles.filter((profile) =>
            trustList.find((t) => t.profileId !== profile.id)
          )}
          trust={trust}
          trustList={trustList}
          setTrustList={setTrustList}
        />
      ))}
    </div>
  )
}

function SetSingleTrust(props: {
  profiles: ProfileAndEvals[]
  index: number
  trust: Trust
  trustList: Trust[]
  setTrustList: (trustMap: Trust[]) => void
}) {
  const { profiles, index, trust, trustList, setTrustList } = props
  return (
    <div className="grid grid-cols-4 items-center gap-5">
      <div className="col-span-3">
        <ProfileSelect profiles={profiles} />
      </div>
      <Input
        type="number"
        value={trust.trust}
        onChange={(event) => {
          const newTrustList = cloneDeep(trustList)
          newTrustList[index].trust = parseFloat(event.target.value)
          setTrustList(newTrustList)
        }}
      />
    </div>
  )
}

function ProfileSelect(props: { profiles: ProfileAndEvals[] }) {
  const { profiles } = props
  const [selected, setSelected] = useState<ProfileAndEvals | null>(null)
  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6">
            <Row className="items-center">
              {selected ? (
                <>
                  <span
                    className={clsx(
                      selected.project_evals.length > 0
                        ? 'bg-green-400'
                        : 'bg-gray-200',
                      'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                    )}
                  />
                  <span className="ml-3 block truncate">
                    {selected.full_name}
                  </span>
                </>
              ) : (
                <span className="ml-3 block truncate text-gray-600">
                  Select an evaluator
                </span>
              )}
            </Row>
            <Row className="pointer-events-none absolute inset-y-0 right-0 items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Row>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {profiles.map((profile) => (
                <Listbox.Option
                  key={profile.id}
                  className={({ active }) =>
                    clsx(
                      active ? 'bg-orange-600 text-white' : 'text-gray-900',
                      'relative cursor-default select-none py-2 pl-3 pr-9'
                    )
                  }
                  value={profile}
                >
                  {({ selected, active }) => (
                    <>
                      <Row className="items-center">
                        <div
                          className={clsx(
                            profile.project_evals.length > 0
                              ? 'bg-green-400'
                              : 'bg-gray-200',
                            'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                          )}
                        />
                        <span
                          className={clsx(
                            selected ? 'font-semibold' : 'font-normal',
                            'ml-3 block truncate'
                          )}
                        >
                          {profile.full_name}
                        </span>
                      </Row>
                      {selected ? (
                        <span
                          className={clsx(
                            active ? 'text-white' : 'text-orange-600',
                            'absolute inset-y-0 right-0 flex items-center pr-4'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
