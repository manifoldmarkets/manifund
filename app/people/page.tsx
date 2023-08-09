import { GeneratedAvatar } from '@/components/avatar'
import { Table, ThickTableRow } from '@/components/table'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'

export default async function PeoplePage() {
  const supabase = createServerClient()
  const { data: profiles } = await supabase.from('profiles').select('*')
  const profilesToShow = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))

  return (
    <>
      <GeneratedAvatar uuid="19cb1fd8-f3c8-56e8-e8c5-9b0c00b4473e" />
      {/* <Table>
        {profilesToShow?.map((profile) => (
          <ThickTableRow
            key={profile.id}
            title={<UserAvatarAndBadge profile={profile} />}
            subtitle={<p>{profile.bio}</p>}
            href={`/${profile.username}`}
          />
        ))}
      </Table> */}
    </>
  )
}

// TODO: use on other profile complete checks
export function checkProfileComplete(profile: Profile) {
  return profile.username !== profile.id && profile.full_name
}
