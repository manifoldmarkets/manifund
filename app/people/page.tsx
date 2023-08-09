import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
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
    <Row className="w-full justify-center p-6">
      <div className="w-fit">
        {profilesToShow?.map((profile) => (
          <ProfileRow
            key={profile.id}
            profile={profile}
            isCreator={profile.projects.length > 0}
          />
        ))}
      </div>
    </Row>
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
      className="flex-2 flex w-fit items-center gap-4 rounded p-3 hover:bg-gray-100"
      href={`/${profile.username}`}
    >
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={12}
      />
      <Col className="w-96 truncate overflow-ellipsis">
        <Row className=" w-full justify-between text-lg font-semibold text-gray-900">
          {profile.full_name}
          <Row className="gap-1">
            {profile.regranter_status && <MiniProfileTag role="regrantor" />}
            {isCreator && <MiniProfileTag role="creator" />}
            {profile.accreditation_status && (
              <MiniProfileTag role="accredited" />
            )}
          </Row>
        </Row>
        <span className="h-5 truncate overflow-ellipsis text-xs text-gray-500">
          {profile.bio}
        </span>
      </Col>
    </Link>
  )
}
