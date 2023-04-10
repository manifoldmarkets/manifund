import { createServerClient } from '@/db/supabase-server'
import { getAllOrgs } from '@/db/profile'

export default async function CharityPage() {
  const supabase = createServerClient()
  const orgs = await getAllOrgs(supabase)
  return (
    <div>
      {orgs.map((org) => {
        return <div key={org.id}>{org.full_name}</div>
      })}
    </div>
  )
}
