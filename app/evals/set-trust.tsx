import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Row } from '@/components/layout/row'
import { ProfileAndEvals } from '@/db/profile'
import { Input } from '@/components/input'
import { checkProfileComplete } from '../people/people-display'
import { cloneDeep } from 'lodash'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { Avatar } from '@/components/avatar'
import { Tooltip } from '@/components/tooltip'

type TrustObj = {
  profileId: string | null
  trust: number
}

export function SetTrust(props: { profiles: ProfileAndEvals[] }) {
  const { profiles } = props
  const completeProfiles = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))
  const [trustList, setTrustList] = useState<TrustObj[]>([])
  return (
    <Col className="w-full items-center gap-4">
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
      <Button
        onClick={() => {
          setTrustList([
            ...trustList,
            {
              profileId: null,
              trust: 1,
            },
          ])
        }}
      >
        Add evaluator
      </Button>
    </Col>
  )
}

function SetSingleTrust(props: {
  profiles: ProfileAndEvals[]
  index: number
  trust: TrustObj
  trustList: TrustObj[]
  setTrustList: (trustList: TrustObj[]) => void
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
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileAndEvals | null>(null)
  const [search, setSearch] = useState('')
  const filteredProfiles =
    search === ''
      ? profiles
      : profiles.filter((profile) => {
          return profile.full_name.toLowerCase().includes(search.toLowerCase())
        })
  return (
    <Combobox value={selectedProfile} onChange={setSelectedProfile}>
      {({ open }) => (
        <div className="relative">
          <Combobox.Input
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-600"
            displayValue={(profile: ProfileAndEvals | null) =>
              profile?.full_name ?? search
            }
            placeholder="Select an evaluator"
          />
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-300 focus:outline-none">
              {filteredProfiles.map((profile) => (
                <Combobox.Option
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
                        <DoneEvalsIndicator
                          doneEvals={profile.project_evals.length > 0}
                        />

                        <Row
                          className={clsx(
                            selected ? 'font-semibold' : 'font-normal',
                            'ml-3 block items-center gap-1 truncate'
                          )}
                        >
                          <Avatar
                            username={profile.username}
                            id={profile.id}
                            avatarUrl={profile.avatar_url}
                            size="xs"
                          />
                          {profile.full_name}
                        </Row>
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
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      )}
    </Combobox>
  )
}

function DoneEvalsIndicator(props: { doneEvals: boolean }) {
  const { doneEvals } = props
  return (
    <Tooltip
      text={doneEvals ? 'Has done evals' : "Hasn't done evals"}
      placement="top"
    >
      <div
        className={clsx(
          doneEvals ? 'bg-green-400' : 'bg-gray-200',
          'inline-block h-2 w-2 flex-shrink-0 rounded-full'
        )}
      />
    </Tooltip>
  )
}
