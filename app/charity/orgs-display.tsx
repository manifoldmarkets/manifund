'use client'
import { SearchBar } from '@/components/input'
import { ProfileAndTxns } from '@/db/profile'
import { useState } from 'react'
import { OrgCard } from './org-card'

export function OrgsDisplay(props: { orgs: ProfileAndTxns[] }) {
  const { orgs } = props
  const [search, setSearch] = useState<string>('')
  const selectedOrgs = searchCharities(orgs, search)
  return (
    <>
      <SearchBar search={search} setSearch={setSearch} className="mt-2" />
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
