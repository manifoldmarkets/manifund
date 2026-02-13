import { createServerSupabaseClient } from '@/db/supabase-server'
import { listOrgs } from '@/db/profile'
import { OrgsDisplay } from './orgs-display'
import { SiteLink } from '@/components/site-link'

export const revalidate = 60

export default async function AllCharitiesPage() {
  const supabase = await createServerSupabaseClient()
  const orgs = await listOrgs(supabase)
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Donate</h1>
      <p className="mb-5 text-gray-600">
        Donate any portion of your Manifund balance to the charity of your choice! If you don&apos;t
        see the charity you want to donate to, message us on{' '}
        <SiteLink followsLinkClass href="https://discord.gg/zPnPtx6jBS">
          Discord
        </SiteLink>{' '}
        and we&apos;ll add it to this page.
      </p>
      <OrgsDisplay orgs={orgs} />
    </div>
  )
}
