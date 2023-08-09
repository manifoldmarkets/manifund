import { Avatar } from '@/components/avatar'
import { Row } from '@/components/layout/row'
import { Table, ThickTableRow } from '@/components/table'
import { MiniProfileTag } from '@/components/tags'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'

export default async function PeoplePage() {
  const supabase = createServerClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, projects(title)')
  const profilesToShow = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))

  return (
    <>
      <Table>
        {profilesToShow?.map((profile) => (
          <ProfileRow
            key={profile.id}
            profile={profile}
            isCreator={profile.projects.length > 0}
          />
        ))}
      </Table>
    </>
  )
}

// TODO: use on other profile complete checks
export function checkProfileComplete(profile: Profile) {
  return profile.username !== profile.id && profile.full_name
}

function ProfileRow(props: { profile: Profile; isCreator?: boolean }) {
  const { profile, isCreator } = props
  return (
    <Link
      className="flex items-center justify-between rounded p-3 hover:bg-gray-100"
      href={`/${profile.username}`}
    >
      <Row className="items-center gap-1">
        <Avatar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          id={profile.id}
          size={8}
        />
        <span className="text-md font-medium text-gray-900">
          {profile.full_name}
        </span>
      </Row>
      <Row className="gap-1">
        {profile.regranter_status && <MiniProfileTag role="regrantor" />}
        {isCreator && <MiniProfileTag role="creator" />}
        {profile.accreditation_status && <MiniProfileTag role="accredited" />}
      </Row>
    </Link>
  )
}
