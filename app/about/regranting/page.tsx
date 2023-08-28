import { ProfileCard } from '@/components/profile-card'
import { getRegranters, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { getSponsoredAmount } from '@/utils/constants'
import { sortBy } from 'lodash'

export default async function RegrantingPage() {
  const supabase = createServerClient()
  const regrantors = await getRegranters(supabase)
  const sortedRegranters = sortBy(regrantors, [
    function (regranter: Profile) {
      return -getSponsoredAmount(regranter.id)
    },
  ])
  return (
    <div className="p-5">
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {sortedRegranters.map((regranter) => {
          return <ProfileCard key={regranter.id} profile={regranter} />
        })}
      </div>
    </div>
  )
}
