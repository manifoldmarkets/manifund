import { createServerClient } from '@/db/supabase-server'
import { getAllOrgs } from '@/db/profile'
import { OrgCard } from './org-card'

export default async function AllCharitiesPage() {
  const supabase = createServerClient()
  const orgs = await getAllOrgs(supabase)
  return (
    <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {orgs.map((org) => {
        return (
          <div key={org.id} className="m-3">
            <OrgCard charity={org} />
          </div>
        )
      })}
    </div>
  )
}
