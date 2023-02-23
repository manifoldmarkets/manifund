'use client'
import { Profile } from '@/db/profile'
import { Avatar } from './avatar'
import { RoundTag } from './round-tag'
import { UserAvatarAndBadge } from './user-link'
import { ValuationBox } from './valuation-box'

export function ProjectCardHeader(props: {
  round: string
  creator: Profile
  valuation: string
}) {
  const { round, creator, valuation } = props
  return (
    <div className="flex justify-between">
      <div className="mt-1">
        <RoundTag round={round} />
        <div className="h-1" />
        <UserAvatarAndBadge
          id={creator.id}
          name={creator.full_name}
          username={creator.username}
        />
      </div>
      <div className="relative top-1">
        <ValuationBox valuation={valuation} />
      </div>
    </div>
  )
}
