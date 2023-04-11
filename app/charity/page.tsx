import { createServerClient } from '@/db/supabase-server'
import { listOrgs } from '@/db/profile'
import { OrgsDisplay } from './orgs-display'

export default async function AllCharitiesPage() {
  const supabase = createServerClient()
  const orgs = await listOrgs(supabase)
  console.log('orgs from All Charities Page', orgs)
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Donate</h1>
      <OrgsDisplay orgs={orgs} />
    </div>
  )
}
