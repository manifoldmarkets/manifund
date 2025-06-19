'use client'
import { useState, useEffect } from 'react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { CauseTag } from './tags'
import { Row } from './layout/row'
import { Col } from './layout/col'
import { Card } from './layout/card'
import { MiniCause } from '@/db/cause'
import { toast } from 'react-hot-toast'
import { loadUserPreferences, saveUserPreferences } from '@/utils/preferences'

interface ProminentCauseFilterProps {
  causes: MiniCause[]
  includedCauses: MiniCause[]
  setIncludedCauses: (causes: MiniCause[]) => void
  userId?: string
}

export function ProminentCauseFilter({
  causes,
  includedCauses,
  setIncludedCauses,
  userId,
}: ProminentCauseFilterProps) {
  const [hasPreferences, setHasPreferences] = useState(false)

  // Load preferences once on mount
  useEffect(() => {
    const preferredSlugs = loadUserPreferences()
    if (preferredSlugs.length > 0) {
      const preferredCauses = causes.filter((cause) =>
        preferredSlugs.includes(cause.slug)
      )
      setIncludedCauses(preferredCauses)
      setHasPreferences(true)
    }
  }, [])

  const handleCauseChange = (newCauses: MiniCause[]) => {
    setIncludedCauses(newCauses)
    saveUserPreferences(newCauses)

    if (newCauses.length > 0) {
      toast.success('Your cause preferences have been saved!')
      setHasPreferences(true)
    } else {
      toast.success('All causes will be shown')
      setHasPreferences(false)
    }
  }

  const clearPreferences = () => {
    setIncludedCauses([])
    saveUserPreferences([])
    setHasPreferences(false)
    toast.success('All causes will be shown')
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 pb-40">
      <Col className="gap-3">
        <Row className="items-center justify-between">
          <Row className="items-center gap-2">
            <HeartIcon className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Filter by Cause</h3>
            {hasPreferences && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                Preferences saved
              </span>
            )}
          </Row>
          {hasPreferences && (
            <button
              onClick={clearPreferences}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Clear preferences
            </button>
          )}
        </Row>

        <p className="text-sm text-gray-600">
          {hasPreferences
            ? "Your preferred causes are automatically applied. You'll see these categories every time you visit."
            : 'Select your favorite causes to see them every time you visit Manifund.'}
        </p>

        <div className="relative w-full">
          <Listbox value={includedCauses} onChange={handleCauseChange} multiple>
            {({ open }) => (
              <>
                <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <Row className="flex-wrap gap-1">
                    <span className="text-gray-500">Show</span>
                    {includedCauses.length === 0 ? (
                      ' all causes'
                    ) : (
                      <>
                        {includedCauses.map((cause) => (
                          <CauseTag
                            causeTitle={cause.title}
                            causeSlug={cause.slug}
                            key={cause.slug}
                            noLink
                          />
                        ))}
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
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-[40rem] w-full overflow-auto rounded-md bg-blue-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 focus:outline-none">
                    <div className="relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-sm text-gray-900 hover:bg-orange-500 hover:text-white">
                      <button
                        onClick={() => handleCauseChange([])}
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
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                            active
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-900'
                          }`
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
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? 'text-white' : 'text-orange-500'
                                }`}
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
              </>
            )}
          </Listbox>
        </div>
      </Col>
    </Card>
  )
}
