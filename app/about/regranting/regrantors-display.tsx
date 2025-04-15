'use client'

import { Row } from '@/components/layout/row'
import { ProfileCard } from '@/components/profile-card'
import { Profile } from '@/db/profile'
import { getSponsoredAmount } from '@/utils/constants'
import clsx from 'clsx'
import { sortBy } from 'lodash'
import { useState } from 'react'

const YEARS = [2023, 2024, 2025]

export function RegrantorsDisplay(props: { regrantors: Profile[] }) {
  const { regrantors } = props
  const [selectedYear, setSelectedYear] = useState(2025)
  const regrantorsToShow = regrantors.filter(
    (regrantor) => getSponsoredAmount(regrantor.id, selectedYear) !== 0
  )
  const sortedRegrantors = sortBy(regrantorsToShow, [
    function (regrantor: Profile) {
      return -getSponsoredAmount(regrantor.id, selectedYear)
    },
  ])
  return (
    <div className="mt-5">
      <Row className="justify-between">
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Our regrantors
        </h3>
        <Row className="gap-3">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                selectedYear === year
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {year}
            </button>
          ))}
        </Row>
      </Row>
      <div className="mx-auto mb-5 mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sortedRegrantors.map((regrantor) => {
          return (
            <ProfileCard
              key={regrantor.id}
              sponsoredAmount={getSponsoredAmount(regrantor.id, selectedYear)}
              profile={regrantor}
            />
          )
        })}
      </div>
    </div>
  )
}
