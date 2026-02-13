import Link from 'next/link'
import { ProfileWithRoles } from '@/db/profile'

export function Donors(props: { donors: ProfileWithRoles[] }) {
  const { donors } = props
  function budget(roles: Record<string, boolean | string | null>) {
    return Object.values(roles).filter(Boolean).length * 100
  }
  const totalBudget = donors.reduce((acc, donor) => acc + budget(donor.roles), 0)

  return (
    <div className="space-y-4">
      {/* Top level stats */}
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          EA Community Choice participants
        </h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Stat name="Total participants" stat={donors.length} />
          <Stat name="Total $ claimed" stat={'$' + totalBudget} />
          <Stat name="Quadratic matching fund" stat={'$100000'} />
        </dl>
      </div>

      {/* Wall of participants */}
      <div className="columns-2 sm:columns-3">
        {donors.map((donor) => (
          <div key={donor.id} className="m-2">
            <h3 className="font-semibold">
              <Link href={`/${donor.username}`}>
                {donor.full_name || donor.username.split('-')[0]}
              </Link>{' '}
              - {budget(donor.roles)}
            </h3>
            <div className="flex flex-col break-words text-sm text-gray-600">
              {Object.entries(donor.roles).map(([role, value]) => {
                if (value && role !== 'id') {
                  return (
                    <div key={role}>
                      {role}
                      <span className="font-light">
                        {typeof value === 'string' &&
                          `: ${role === 'scholar' ? value.split('/').pop() || value : value}`}
                      </span>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat(props: { name: string; stat: number | string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{props.name}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{props.stat}</dd>
    </div>
  )
}
