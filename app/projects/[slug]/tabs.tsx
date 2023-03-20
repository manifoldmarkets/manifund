'use client'
import clsx from 'clsx'
import { Comments } from './comments'
import { FullProject } from '@/db/project'
import { Profile } from '@/db/profile'
import { CommentAndProfile } from '@/db/comment'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bids } from './bids'
import { BidAndProfile } from '@/db/bid'
import { TxnAndProfiles } from '@/db/txn'
import { Shareholders } from './shareholders'
import { calculateFullTrades } from '@/utils/math'
import { isNull } from 'util'

export function Tabs(props: {
  project: FullProject
  comments: CommentAndProfile[]
  user: Profile | null
  bids: BidAndProfile[]
  txns: TxnAndProfiles[]
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    project,
    comments,
    user,
    bids,
    txns,
    userSpendableFunds,
    userSellableShares,
  } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTabName = searchParams.get('tab')
  const trades = calculateFullTrades(txns)
  const creator = project.profiles

  const tabs = [
    {
      name: 'Comments',
      href: '?tab=comments',
      count: comments.length,
      current: currentTabName === 'comments' || currentTabName === null,
      stages: ['proposal', 'active', 'completed', 'not funded'],
      display: <Comments project={project} comments={comments} user={user} />,
    },
    {
      name: project.stage === 'active' ? 'Offers' : 'Bids',
      href: '?tab=bids',
      count: bids.length,
      current: currentTabName === 'bids',
      stages: ['proposal', 'active', 'completed'],
      display: (
        <Bids
          bids={bids}
          stage={project.stage}
          userId={user?.id}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      ),
    },
    {
      name: 'Shareholders',
      href: '?tab=shareholders',
      count: 0,
      current: currentTabName === 'shareholders',
      stages: ['active', 'completed'],
      display: <Shareholders trades={trades} creator={creator} />,
    },
  ]
  return (
    <div>
      <div className="block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  router.push(`/projects/${project.slug}${tab.href}`)
                }}
                className={clsx(
                  tab.current
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  tab.stages.includes(project.stage) ? 'inline-block' : 'hidden'
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
                {tab.count > 0 ? (
                  <span
                    className={clsx(
                      tab.current
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-900',
                      'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block'
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="py-6">{tabs.filter((tab) => tab.current)[0].display}</div>
    </div>
  )
}
