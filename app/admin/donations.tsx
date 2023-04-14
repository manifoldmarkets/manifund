'use client'
import { Input } from '@/components/input'
import { SiteLink } from '@/components/site-link'
import { Txn } from '@/db/txn'
import { addHttpToUrl } from '@/utils/formatting'
import { format, isAfter } from 'date-fns'
import { useState } from 'react'
import { Profile } from '../create/create-project-form'

export function Donations(props: { charities: Profile[]; txns: Txn[] }) {
  const { charities, txns } = props
  const [startDate, setStartDate] = useState(format(new Date(), 'MM/dd/yyyy'))
  const donations = charities.map((charity) => {
    const totalRaised = txns.reduce((acc, txn) => {
      if (
        txn.to_id === charity.id &&
        txn.project === null &&
        isAfter(new Date(txn.created_at), new Date(startDate))
      ) {
        return acc + txn.amount
      }
      return acc
    }, 0)
    return { charity, totalRaised }
  })
  const charityDisplay = donations.map((donation) => {
    const { charity, totalRaised } = donation
    return (
      <tr key={charity.id}>
        <td>
          <SiteLink followsLinkClass href={addHttpToUrl(charity.website ?? '')}>
            {charity.full_name}
          </SiteLink>
        </td>
        <td>${totalRaised}</td>
      </tr>
    )
  })
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Donations</h1>
      <p className="text-gray-500">start date:</p>
      <Input
        type="date"
        value={startDate}
        onChange={(event) => {
          setStartDate(event.target.value)
        }}
      />
      <table className="w-full">
        <thead>
          <tr>
            <th>Charity</th>
            <th>Amount Raised</th>
          </tr>
        </thead>
        <tbody>{charityDisplay}</tbody>
      </table>
    </div>
  )
}
