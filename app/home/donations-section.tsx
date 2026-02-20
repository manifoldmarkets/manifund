import { Col } from '@/components/layout/col'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { Tag } from '@/components/tags'
import { UserAvatarAndBadge } from '@/components/user-link'
import { HomeHeader } from '@/components/home-header'
import { FullTxn } from '@/db/txn'
import { FullBid } from '@/db/bid'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function DonationsSection({
  donations,
  bids,
}: {
  donations: FullTxn[]
  bids: FullBid[]
}) {
  // Combine and sort donations and bids by date
  const combinedItems = [
    ...donations.map((txn) => ({
      type: 'donation' as const,
      item: txn,
    })),
    ...bids.map((bid) => ({ type: 'bid' as const, item: bid })),
  ].sort((a, b) => {
    return (
      new Date(b.item.created_at).getTime() -
      new Date(a.item.created_at).getTime()
    )
  })

  return (
    <section className="space-y-4">
      <HomeHeader title="Donations" viewAllLink="/projects?tab=donations" />

      <Col className="gap-4">
        {combinedItems.map(({ type, item }) => (
          <Col key={`${type}-${item.id}`}>
            <Link href={`/projects/${item.projects?.slug}`} className="w-fit">
              <Tag
                text={item.projects?.title ?? ''}
                className="hover:bg-orange-200"
              />
            </Link>
            <Card className="rounded-tl-sm !p-1">
              <DonationItem type={type} item={item} />
            </Card>
          </Col>
        ))}
      </Col>
    </section>
  )
}

function DonationItem(props: {
  type: 'donation' | 'bid'
  item: FullTxn | FullBid
}) {
  const { type, item } = props
  return (
    <div className="grid w-full grid-cols-3 items-center gap-3 rounded p-3 text-sm">
      <Row className="justify-start">
        {item.profiles && <UserAvatarAndBadge profile={item.profiles} />}
      </Row>
      <Row className="items-center justify-end">
        <div className={type === 'bid' ? 'text-gray-500' : ''}>
          <span title={type === 'bid' ? 'pending donation' : undefined}>
            ${Math.round(item.amount)}
          </span>
        </div>
      </Row>
      <Row className="items-center justify-end gap-2">
        <span className="hidden text-right text-gray-500 sm:block">
          {formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
          })}
        </span>
      </Row>
    </div>
  )
}
