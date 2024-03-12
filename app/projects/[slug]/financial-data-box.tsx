import { Button } from '@/components/button'
import { AmountInput } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Slider } from '@/components/slider'
import { Tooltip } from '@/components/tooltip'
import { BidAndProfile, BidAndProject } from '@/db/bid'
import { Cause } from '@/db/cause'
import { Profile } from '@/db/profile'
import { FullProject, Project } from '@/db/project'
import { TxnAndProfiles, TxnAndProject } from '@/db/txn'
import { calculateTradePoints } from '@/utils/amm'
import {
  formatMoney,
  formatMoneyPrecise,
  formatPercent,
} from '@/utils/formatting'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
  getActiveValuation,
  getAmountRaised,
  getMinIncludingAmm,
  getProposalValuation,
} from '@/utils/math'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function FinancialDataBox(props: {
  project: FullProject
  userTxns: TxnAndProject[]
  userBids: BidAndProject[]
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
  prizeCause?: Cause
  userProfile?: Profile
}) {
  const {
    project,
    userTxns,
    userBids,
    projectBids,
    projectTxns,
    prizeCause,
    userProfile,
  } = props
  const userSpendableFunds = Math.max(
    userProfile
      ? project.type === 'cert' && userProfile.id === project.creator
        ? calculateCashBalance(
            userTxns,
            userBids,
            userProfile.id,
            userProfile.accreditation_status
          )
        : calculateCharityBalance(
            userTxns,
            userBids,
            userProfile.id,
            userProfile.accreditation_status
          )
      : 0,
    0
  )
  const userSellableShares = userProfile
    ? calculateSellableShares(userTxns, userBids, project.id, userProfile.id)
    : 0
  const valuation =
    project.type === 'grant'
      ? project.funding_goal
      : project.stage === 'proposal'
      ? getProposalValuation(project)
      : getActiveValuation(
          projectTxns,
          project.id,
          getProposalValuation(project)
        )
  const isOwnProject = userProfile?.id === project.profiles.id
  const pendingProjectTransfers = project.project_transfers?.filter(
    (projectTransfer) => !projectTransfer.transferred
  )
  const userIsFollower =
    !!userProfile &&
    !!project.project_follows.find(
      (follow) => follow.follower_id === userProfile.id
    )
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
  const minIncludingAmm = getMinIncludingAmm(project)
  const tradePoints = calculateTradePoints(projectTxns, project.id)
  const activeAuction =
    !!prizeCause?.cert_params?.auction && project.stage === 'proposal'
  const [specialCommentPrompt, setSpecialCommentPrompt] = useState<
    undefined | string
  >(undefined)
  return (
    <Card>
      <dl className="grid grid-cols-1 sm:grid-cols-2">
        <div className="px-4 pb-6 sm:col-span-1 sm:px-0">
          <dt className="text-sm leading-6 text-gray-700">stage</dt>
          <dd className="text-base font-medium leading-6 text-gray-900">
            Proposal
          </dd>
        </div>
        <div className="px-4 pb-6 sm:col-span-1 sm:px-0">
          <dt className="text-sm leading-6 text-gray-700">type</dt>
          <dd className="text-base font-medium leading-6 text-gray-900">
            Impact certificate
          </dd>
        </div>
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">
            Email address
          </dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
            margotfoster@example.com
          </dd>
        </div>
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">
            Salary expectation
          </dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
            $120,000
          </dd>
        </div>
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">About</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
            Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim
            incididunt cillum culpa consequat. Excepteur qui ipsum aliquip
            consequat sint. Sit id mollit nulla mollit nostrud in ea officia
            proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit
            deserunt qui eu.
          </dd>
        </div>
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">
            Attachments
          </dt>
          <dd className="mt-2 text-sm text-gray-900">
            <ul
              role="list"
              className="divide-y divide-gray-100 rounded-md border border-gray-200"
            >
              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                <div className="flex w-0 flex-1 items-center">
                  <PaperClipIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div className="ml-4 flex min-w-0 flex-1 gap-2">
                    <span className="truncate font-medium">
                      resume_back_end_developer.pdf
                    </span>
                    <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="#"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Download
                  </a>
                </div>
              </li>
              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                <div className="flex w-0 flex-1 items-center">
                  <PaperClipIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div className="ml-4 flex min-w-0 flex-1 gap-2">
                    <span className="truncate font-medium">
                      coverletter_back_end_developer.pdf
                    </span>
                    <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="#"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Download
                  </a>
                </div>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </Card>
  )
}
