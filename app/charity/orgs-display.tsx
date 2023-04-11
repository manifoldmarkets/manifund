'use client'
import { Input } from '@/components/input'
import { ProfileAndTxns } from '@/db/profile'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { OrgCard } from './org-card'

export function OrgsDisplay(props: { orgs: ProfileAndTxns[] }) {
  const { orgs } = props
  const [search, setSearch] = useState<string>('')
  const selectedOrgs = searchCharities(orgs, search)
  return (
    <>
      <div className="relative mt-2 w-full rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <Input
          placeholder="Search"
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:leading-6"
          value={search}
          onChange={(event) => {
            // TODO: Use search params once they are supported in Next.js
            // https://github.com/vercel/next.js/discussions/48110
            setSearch(event.target.value)
          }}
        />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {selectedOrgs.map((org) => {
          return <OrgCard key={org.id} charity={org} />
        })}
      </div>
    </>
  )
}

function searchCharities(charities: ProfileAndTxns[], search: string) {
  if (search === '') return charities
  const selectedOrgs = charities.filter((charity) => {
    return (
      charity.full_name.toLowerCase().includes(search.toLowerCase()) ||
      charity.bio.toLowerCase().includes(search.toLowerCase())
    )
  })
  return selectedOrgs
}
