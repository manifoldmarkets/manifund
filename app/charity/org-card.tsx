import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProfileAndTxns } from '@/db/profile'
import { formatMoney } from '@/utils/formatting'
import Image from 'next/image'
import Link from 'next/link'

// May want to use later for regrantors as well
export function OrgCard(props: { charity: ProfileAndTxns }) {
  const { charity } = props
  const raised = 100
  return (
    <Link href={`/charity/${charity.username}`}>
      <Col className="h-full rounded-md border border-gray-300 bg-white px-4 pb-2 pt-1 shadow">
        <div className="px-8">
          <figure className="relative h-32">
            {charity.avatar_url ? (
              <Image
                src={charity.avatar_url}
                alt=""
                layout="fill"
                objectFit="contain"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-300 to-indigo-200" />
            )}
          </figure>
        </div>
        <Col className="h-full justify-between p-8">
          <div className="text-sm line-clamp-4">{charity.bio}</div>
          {raised > 0 && (
            <>
              <Row className="mt-4 flex-1 items-end justify-center gap-6 text-gray-900">
                <Row className="items-baseline gap-1">
                  <span className="text-3xl font-semibold">
                    {formatMoney(raised)}
                  </span>
                  raised
                </Row>
                {/* {match && (
                  <Col className="text-gray-500">
                    <span className="text-xl">+{formatUsd(match)}</span>
                    <span className="">match</span>
                  </Col>
                )} */}
              </Row>
            </>
          )}
        </Col>
      </Col>
    </Link>
    // <Col className="isolate mx-4 overflow-hidden rounded-md bg-white pb-6 shadow md:mx-0">
    //   <div>
    //     {charity.avatar_url && (
    //       <Image
    //         src={charity.avatar_url}
    //         width={700}
    //         height={300}
    //         alt="round header image"
    //         className="aspect-[2/1] h-72 w-full object-cover"
    //       />
    //     )}
    //   </div>
    //   <div className="mx-6 text-xl font-bold">{charity.full_name}</div>
    //   <div className="my-2 flex justify-center px-6 text-gray-600">
    //     {charity.bio}
    //   </div>
    // </Col>
  )
}
