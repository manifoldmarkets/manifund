import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById, isAdmin } from '@/db/profile'
import { PlaceBid } from './place-bid'
import { RichContent } from '@/components/editor'
import { CloseBidding } from './close-bidding'
import { EditDescription } from './edit-description'
import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import {
  calculateUserBalance,
  getActiveValuation,
  getProposalValuation,
} from '@/utils/math'
import { ProposalData } from './proposal-data'
import { SiteLink } from '@/components/site-link'
import { SignInButton } from '@/components/sign-in-button'
import clsx from 'clsx'
import { buttonClass } from '@/components/button'
import { ProjectTabs } from './project-tabs'
import {
  getIncomingTxnsByUser,
  getOutgoingTxnsByUser,
  getTxnsByProject,
} from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { Description } from './description'
import { ProjectCardHeader } from '@/components/project-card'
import { formatLargeNumber } from '@/utils/formatting'

export async function generateMetadata(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectBySlug(supabase, slug)
  return {
    title: project.title,
  }
}

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getFullProjectBySlug(supabase, slug)
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const { userSpendableFunds, userSellableShares, userShares } = user
    ? await getUserFundsAndShares(supabase, user.id, project.id)
    : { userSpendableFunds: 0, userSellableShares: 0, userShares: 0 }
  const comments = await getCommentsByProject(supabase, project.id)
  const bids = await getBidsByProject(supabase, project.id)
  const txns = await getTxnsByProject(supabase, project.id)
  const valuation =
    project.stage == 'proposal'
      ? formatLargeNumber(getProposalValuation(project))
      : formatLargeNumber(
          getActiveValuation(txns, bids, getProposalValuation(project))
        )

  const isOwnProject = user?.id === project.profiles.id

  return (
    <div className="flex flex-col gap-4 px-4">
      <ProjectCardHeader
        round={project.rounds}
        creator={project.profiles}
        valuation={valuation === 'NaN' ? undefined : valuation}
      />
      <div>
        <h2 className="text-3xl font-bold">{project.title}</h2>
      </div>
      {project.description && (
        <Description>
          <RichContent content={project.description} />
        </Description>
      )}
      {isOwnProject && <EditDescription project={project} />}
      <hr className="mb-3 mt-5 h-0.5 rounded-sm bg-gray-500" />
      {project.stage == 'proposal' && (
        <ProposalData
          project={project}
          bids={project.bids.filter((bid) => bid.status === 'pending')}
        />
      )}
      {profile?.accreditation_status ||
      (profile?.id === project.creator && project.stage === 'active') ? (
        <PlaceBid
          project={project}
          user={profile}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
          userShares={userShares}
        />
      ) : null}
      {user &&
        !profile?.accreditation_status &&
        !(profile?.id === project.creator) && <NotAccredited />}
      {!user && <SignInButton />}
      <div className="h-6" />
      <ProjectTabs
        project={project}
        user={profile}
        comments={comments}
        bids={bids}
        txns={txns}
        userSpendableFunds={userSpendableFunds}
        userSellableShares={userSellableShares}
      />
      {isAdmin(user) && <CloseBidding project={project} />}
    </div>
  )
}

function NotAccredited() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 text-center shadow-md">
      <Row className="w-full justify-center">
        <Col className="w-full">
          You&apos;ll need to demonstrate that you&apos;re an accredited
          investor before you can invest in projects.
          <SiteLink
            href="https://airtable.com/shrZVLeo6f34NBfR0"
            className={clsx(
              buttonClass('xl', 'gradient'),
              'mx-auto mt-4 max-w-md bg-gradient-to-r'
            )}
          >
            Verify status
          </SiteLink>
        </Col>
      </Row>
    </div>
  )
}

export async function getUserFundsAndShares(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
) {
  if (!userId) {
    return { userSpendableFunds: 0, userSellableShares: 0, userShares: 0 }
  }
  const incomingTxns = await getIncomingTxnsByUser(supabase, userId)
  const outgoingTxns = await getOutgoingTxnsByUser(supabase, userId)
  const userBids = await getBidsByUser(supabase, userId)
  const getUserShares = () => {
    const incomingShares = incomingTxns
      .filter((txn) => txn.token === projectId)
      .reduce((acc, txn) => acc + txn.amount, 0)
    const outgoingShares = outgoingTxns
      .filter((txn) => txn.token === projectId)
      .reduce((acc, txn) => acc + txn.amount, 0)
    return incomingShares - outgoingShares
  }
  const userShares = getUserShares()
  const offeredShares = userBids
    .filter(
      (bid) =>
        bid.type === 'sell' &&
        bid.status === 'pending' &&
        bid.project === projectId
    )
    .reduce((acc, bid) => acc + bid.amount, 0)
  const userSellableShares = userShares - offeredShares

  const getUserSpendableFunds = async () => {
    const currentBalance = calculateUserBalance(incomingTxns, outgoingTxns)
    let balanceMinusBids = currentBalance
    userBids.forEach((bid) => {
      if (bid.type == 'buy') {
        balanceMinusBids -= bid.amount
      }
    })
    return balanceMinusBids
  }
  const userSpendableFunds = await getUserSpendableFunds()
  return { userSpendableFunds, userSellableShares, userShares }
}
