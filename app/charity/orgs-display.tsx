'use client'
import { SearchBar } from '@/components/input'
import { ProfileAndTxns } from '@/db/profile'
import { searchInAny } from '@/utils/parse'
import { useState } from 'react'
import { OrgCard } from './org-card'

export function OrgsDisplay(props: { orgs: ProfileAndTxns[] }) {
  const { orgs } = props
  const [search, setSearch] = useState<string>('')
  const selectedOrgs = orgs.filter((org) =>
    searchInAny(search, org.full_name, org.bio)
  )
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
