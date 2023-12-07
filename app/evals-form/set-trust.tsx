import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Row } from '@/components/layout/row'
import { ProfileAndEvals } from '@/db/profile'
import { AmountInput } from '@/components/input'
import { cloneDeep } from 'lodash'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { Avatar } from '@/components/avatar'
import { Tooltip } from '@/components/tooltip'
import { TrustObj } from './evals-form'
import { Card } from '@/components/layout/card'
import { checkProfileComplete } from '@/app/people/people-display'

export function SetTrust(props: {
  profiles: ProfileAndEvals[]
  trustList: TrustObj[]
  setTrustList: (trustList: TrustObj[]) => void
}) {
  const { profiles, trustList, setTrustList } = props
  const completeProfiles = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))
  return (
    <Card className="overflow-visible">
      <h2 className="text-xl font-bold">Set trust in other evaluators</h2>
      <p className="mt-1 text-sm text-gray-600">
        If unspecified, trust levels in other evaluators will be set to 1. Set
        trust levels for specific individuals relative to this default.
      </p>
      <Col className="mt-4 w-full items-center gap-4">
        {trustList.map((trust, index) => (
          <SetSingleTrust
            key={index}
            index={index}
            profiles={completeProfiles}
            trust={trust}
            trustList={trustList}
            setTrustList={setTrustList}
          />
        ))}
        <Button
          className="flex gap-1"
          color="gray"
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
          <PlusCircleIcon className="h-5 w-5" />
          Add evaluator
        </Button>
      </Col>
    </Card>
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
    <Row className="w-full items-center justify-center gap-3">
      <div className="w-60">
        <ProfileSelect
          profiles={profiles}
          trustList={trustList}
          setTrustList={setTrustList}
          index={index}
        />
      </div>
      <AmountInput
        className="h-8 w-20 !px-2 text-sm"
        amount={trust.trust}
        onChangeAmount={(newTrust) => {
          const newTrustList = cloneDeep(trustList)
          newTrustList[index].trust = newTrust ?? 0
          setTrustList(newTrustList)
        }}
      />
      <button
        onClick={() => setTrustList(trustList.filter((t) => t !== trust))}
      >
        <XCircleIcon className="h-5 w-5 text-gray-800" />
      </button>
    </Row>
  )
}

function ProfileSelect(props: {
  profiles: ProfileAndEvals[]
  trustList: TrustObj[]
  setTrustList: (trustList: TrustObj[]) => void
  index: number
}) {
  const { profiles, trustList, setTrustList, index } = props
  const selectedProfile =
    profiles.find((p) => p.id === trustList[index].profileId) ?? null
  const [search, setSearch] = useState('')
  const unselectedProfiles = profiles.filter(
    (profile) =>
      !trustList.find(
        (trust, idx) => trust.profileId === profile.id && idx !== index
      )
  )
  const searchedProfiles =
    search === ''
      ? unselectedProfiles
      : unselectedProfiles.filter((profile) => {
          return profile.full_name.toLowerCase().includes(search.toLowerCase())
        })
  return (
    <Combobox
      value={selectedProfile}
      onChange={(event) => {
        if (event) {
          const newTrustList = cloneDeep(trustList)
          newTrustList[index].profileId = event.id
          setTrustList(newTrustList)
        }
      }}
    >
      {({ open }) => (
        <div className="relative">
          <Combobox.Input
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-600"
            displayValue={(profile: ProfileAndEvals | null) =>
              profile?.full_name ?? search
            }
            placeholder="Select an evaluator"
            autoComplete="off"
          />
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-300 focus:outline-none">
              {searchedProfiles.map((profile) => (
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
                            noLink
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
