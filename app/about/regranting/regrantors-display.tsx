'use client'

import { Row } from '@/components/layout/row'
import { ProfileCard } from '@/components/profile-card'
import { Profile } from '@/db/profile'
import {
  getSponsoredAmount2023,
  getSponsoredAmount2024,
} from '@/utils/constants'
import clsx from 'clsx'
import { sortBy } from 'lodash'
import { useState } from 'react'

export function RegrantorsDisplay(props: { regrantors: Profile[] }) {
  const { regrantors } = props
  const sortedRegrantors2023 = sortBy(
    regrantors.filter((r) => getSponsoredAmount2023(r.id) !== 0),
    [
      function (regranter: Profile) {
        return -getSponsoredAmount2023(regranter.id)
      },
    ]
  )
  const sortedRegrantors2024 = sortBy(
    regrantors.filter((r) => getSponsoredAmount2024(r.id) !== 0),
    [
      function (regranter: Profile) {
        return -getSponsoredAmount2024(regranter.id)
      },
    ]
  )
  const [selectedYear, setSelectedYear] = useState(2024)
  const regrantorsToShow =
    selectedYear === 2023 ? sortedRegrantors2023 : sortedRegrantors2024
  return (
    <div className="mt-5">
      <Row className="justify-between">
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Our regrantors
        </h3>
        <Row className="gap-3">
          <button
            onClick={() => setSelectedYear(2023)}
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium',
              selectedYear === 2023
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            2023
          </button>
          <button
            onClick={() => setSelectedYear(2024)}
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium',
              selectedYear === 2024
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            2024
          </button>
        </Row>
      </Row>
      <div className="mx-auto mb-5 mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {regrantorsToShow.map((regrantor) => {
          return (
            <ProfileCard
              key={regrantor.id}
              sponsoredAmount={
                selectedYear === 2024
                  ? getSponsoredAmount2024(regrantor.id)
                  : getSponsoredAmount2023(regrantor.id)
              }
              profile={regrantor}
            />
          )
        })}
      </div>
    </div>
  )
}
