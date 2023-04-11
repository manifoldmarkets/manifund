'use client'
import { Input } from '@/components/input'
import { ProfileAndTxns } from '@/db/profile'
import { useState } from 'react'
import { OrgCard } from './org-card'

export function OrgsDisplay(props: { orgs: ProfileAndTxns[] }) {
  const { orgs } = props
  const [search, setSearch] = useState<string>('')
  const selectedOrgs = searchCharities(orgs, search)
  return (
    <>
      <Input
        className="w-full"
        placeholder="Search"
        value={search}
        onChange={(event) => {
          // TODO: Use search params once they are supported in Next.js
          // https://github.com/vercel/next.js/discussions/48110
          setSearch(event.target.value)
        }}
      />
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {selectedOrgs.map((org) => {
          return (
            <div key={org.id} className="m-3">
              <OrgCard charity={org} />
            </div>
          )
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
