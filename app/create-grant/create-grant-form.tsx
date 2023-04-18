'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { useState } from 'react'
import Link from 'next/link'

const DEFAULT_DESCRIPTION = `
<h3>What will the recipient use this funding for?</h3>
</br>
<h3>What's the case for this grant?</h3>
</br>
<h3>What are your main reservations about this grant?</h3>
</br>
<h3>How did you choose this amount?</h3>
</br>
<h3>Please list any ways in which this grant could be actively harmful.</h3>
</br>
<h3>Are there any conflicts of interest associated with this grant?</h3>
<strong>Please disclose e.g. any romantic, professional, financial, housemate, or familial relationships you have with the grant recipient(s).</strong>
</br>
<h3>What other funding is this person or project getting? Where else did this person or project apply for funding in the past?</h3>
</br>
`

export function CreateGrantForm(props: { profiles: MiniProfile[] }) {
  const { profiles } = props
  const user = useUser()
  const [recipientFullName, setRecipientFullName] = useState('')
  const [recipientOnManifund, setRecipientOnManifund] = useState(true)
  const [recipientUsername, setRecipientUsername] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const editor = useTextEditor(description)
  if (!user)
    return (
      <div>
        <Link href="/login" className="text-orange-500 hover:text-orange-600">
          Log in
        </Link>{' '}
        to give grants!
      </div>
    )
  return (
    <Col>
      <label htmlFor="recipientFullName">Recipient full name</label>
      <Input
        type="text"
        id="recipientFullName"
        value={recipientFullName}
        onChange={(event) => setRecipientFullName(event.target.value)}
      />
      {recipientOnManifund && (
        <>
          <label>Recipient username</label>
          <Input
            type="text"
            value={recipientUsername}
            onChange={(event) => setRecipientUsername(event.target.value)}
          />
        </>
      )}

      <Input
        type="text"
        value={recipientEmail}
        onChange={(event) => setRecipientEmail(event.target.value)}
      />
      <Input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Input
        type="text"
        value={subtitle}
        onChange={(event) => setSubtitle(event.target.value)}
      />
      <Input
        type="number"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
      />
      <TextEditor editor={editor} />
      <div className="flex">
        <div className="flex h-6 items-center">
          <input
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            Check this box to confirm:
          </label>{' '}
          <span id="terms-description" className="text-gray-500">
            all information provided is true and accurate to the best of my
            knowledge. This project is not-for-profit and not part of a
            political campaign. I understand that all of my answers here will be
            publicly accessible on Manifund.
          </span>
        </div>
      </div>
    </Col>
  )
}

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { MiniProfile } from '@/db/profile'
import { User } from '@supabase/supabase-js'
import { useUser } from '@supabase/auth-ui-react/dist/esm/src/components/Auth/UserContext'

const people = [
  { name: 'Wade Cooper', username: '@wadecooper' },
  { name: 'Arlene Mccoy', username: '@arlenemccoy' },
  { name: 'Devon Webb', username: '@devonwebb' },
  { name: 'Tom Cook', username: '@tomcook' },
  { name: 'Tanya Fox', username: '@tanyafox' },
  { name: 'Hellen Schmidt', username: '@hellenschmidt' },
  { name: 'Caroline Schultz', username: '@carolineschultz' },
  { name: 'Mason Heaney', username: '@masonheaney' },
  { name: 'Claudie Smitham', username: '@claudiesmitham' },
  { name: 'Emil Schaefer', username: '@emilschaefer' },
]

export function Example() {
  const [selected, setSelected] = useState(people[3])

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
            Assigned to
          </Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="inline-flex w-full truncate">
                <span className="truncate">{selected.name}</span>
                <span className="ml-2 truncate text-gray-500">
                  {selected.username}
                </span>
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
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {people.map((person) => (
                  <Listbox.Option
                    key={person.username}
                    className={({ active }) =>
                      clsx(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex">
                          <span
                            className={clsx(
                              selected ? 'font-semibold' : 'font-normal',
                              'truncate'
                            )}
                          >
                            {person.name}
                          </span>
                          <span
                            className={clsx(
                              active ? 'text-indigo-200' : 'text-gray-500',
                              'ml-2 truncate'
                            )}
                          >
                            {person.username}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={clsx(
                              active ? 'text-white' : 'text-indigo-600',
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
        </>
      )}
    </Listbox>
  )
}
