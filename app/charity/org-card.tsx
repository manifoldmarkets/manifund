import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProfileAndTxns } from '@/db/profile'
import { formatMoney } from '@/utils/formatting'
import { calculateUserBalance } from '@/utils/math'
import Image from 'next/image'
import Link from 'next/link'

// May want to use later for regrantors as well
export function OrgCard(props: { charity: ProfileAndTxns }) {
  const { charity } = props
  const raised = calculateUserBalance(charity.txns, charity.id)
  return (
    <Link href={`/charity/${charity.username}`}>
      <Col className="h-full justify-between rounded-md border border-gray-300 bg-white px-6 pb-2 pt-1 shadow">
        <div>
          <figure className="relative h-32">
            {charity.avatar_url ? (
              <Image src={charity.avatar_url} alt="" fill objectFit="contain" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-300 to-indigo-200" />
            )}
          </figure>
        </div>
        <Col className="h-full justify-center py-5 px-3">
          <div className="mb-2 text-xl font-bold">{charity.full_name}</div>
          <div className="text-sm text-gray-600 line-clamp-4">
            {charity.bio}
          </div>
          {raised > 0 && (
            <>
              <Row className="mt-4 flex-1 items-end justify-center gap-6 text-gray-900">
                <Row className="items-baseline gap-1">
                  <span className="text-3xl font-semibold">
                    {formatMoney(raised)}
                  </span>
                  <span className="relative bottom-1">raised</span>
                </Row>
              </Row>
            </>
          )}
        </Col>
      </Col>
    </Link>
  )
}
