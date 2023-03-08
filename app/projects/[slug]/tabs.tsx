'use client'
import clsx from 'clsx'
import { Comments } from './comments'
import { FullProject } from '@/db/project'
import { Profile } from '@/db/profile'
import { CommentAndProfile } from '@/db/comment'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bids } from './bids'
import { BidAndProfile } from '@/db/bid'

export function Tabs(props: {
  project: FullProject
  comments: CommentAndProfile[]
  user: Profile
  bids: BidAndProfile[]
}) {
  const { project, comments, user, bids } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  const tabs = [
    {
      name: 'Comments',
      href: '?tab=comments',
      count: comments.length,
      current: currentTab !== 'bids',
    },
    {
      name: 'Bids',
      href: '?tab=bids',
      count: bids.length,
      current: currentTab === 'bids',
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
                  'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.current ? 'page' : undefined}
                disabled={tab.name === 'Bids' && bids.length === 0}
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
      <div className="py-6">
        {currentTab === 'bids' ? (
          <Bids bids={bids} stage={project.stage} />
        ) : (
          <Comments project={project} comments={comments} user={user} />
        )}
      </div>
    </div>
  )
}
