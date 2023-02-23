'use client'
import { Profile } from '@/db/profile'
import { Avatar } from './avatar'
import { RoundTag } from './round-tag'
import { ValuationBox } from './valuation-box'

export function ProjectHeader(props: {
  round: string
  creator: Profile
  valuation: string
}) {
  const { round, creator, valuation } = props
  return (
    <div className="flex justify-between">
      <div className="mt-1">
        <RoundTag round={round} />
        <div className="mt-1 flex items-center">
          <Avatar
            className="mr-2"
            username={creator?.username}
            id={creator?.id}
            noLink
            size={'xs'}
          />
          <p>{creator?.username}</p>
        </div>
      </div>
      <div className="relative top-1">
        <ValuationBox valuation={valuation} />
      </div>
    </div>
  )
}
