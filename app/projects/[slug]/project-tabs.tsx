'use client'
import { Comments } from './comments'
import { FullProject, FullProjectWithSimilarity, TOTAL_SHARES } from '@/db/project'
import { Profile } from '@/db/profile'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trade, DeleteBid } from './bids'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile } from '@/db/bid'
import { TxnAndProfiles } from '@/db/txn'
import { Shareholders } from './shareholders'
import { bundleTxns } from '@/utils/math'
import { CommentAndProfileAndRxns, CommentAndProfile } from '@/db/comment'
import { uniq } from 'es-toolkit'
import { compareDesc } from 'date-fns'
import { formatMoney, formatMoneyPrecise, formatPercent } from '@/utils/formatting'
import { SimilarProjects } from './similar-projects'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
  HandRaisedIcon,
  Squares2X2Icon,
  UsersIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/button'
import { AmountInput } from '@/components/input'
import { SignInButton } from '@/components/sign-in-button'
import { TimeLeftDisplay } from './time-left-display'
import { scrollToComments } from './project-display'
import { formatDistanceToNowStrict } from 'date-fns'

const SIMILARITY_THRESHOLD = 0.6
const OFFERS_INITIAL_VISIBLE = 10

type SectionId = 'bids' | 'donations' | 'shareholders' | 'comments' | 'similar'

export function ProjectTabs(props: {
  project: FullProject
  comments: CommentAndProfileAndRxns[]
  bids: BidAndProfile[]
  txns: TxnAndProfiles[]
  userCharityBalance: number
  userSpendableFunds: number
  userSellableShares: number
  userProfile?: Profile
  specialCommentPrompt?: string
  activeAuction?: boolean
  similarProjects?: FullProjectWithSimilarity[]
}) {
  const {
    project,
    comments,
    bids,
    txns,
    userCharityBalance,
    userSpendableFunds,
    userSellableShares,
    userProfile,
    specialCommentPrompt,
    activeAuction,
    similarProjects,
  } = props

  const searchParams = useSearchParams() ?? new URLSearchParams()
  const tabParam = searchParams.get('tab') as SectionId | null

  const creator = project.profiles
  const shareholders =
    (project.stage === 'active' || project.stage === 'complete') && project.type === 'cert'
      ? getShareholders(txns)
      : undefined
  const commenterContributions = getCommenterContributions(comments, bids, txns, shareholders)

  const showOffers =
    ((project.stage === 'active' || project.stage === 'complete') && project.type === 'cert') ||
    project.stage === 'proposal'
  const offersBids = showOffers ? bids.filter((bid) => bid.type !== 'assurance sell') : []

  const showDonations =
    (project.stage === 'active' || project.stage === 'complete') && project.type === 'grant'
  const donations = showDonations ? txns.filter((txn) => txn.type === 'project donation') : []

  const similarEnoughProjects = similarProjects?.filter((p) => p.similarity > SIMILARITY_THRESHOLD)

  // Smooth-scroll to a section if the URL has ?tab=<id>.
  // Skip if there's a hash — the browser will handle scrolling to the anchor (e.g. a specific comment).
  useEffect(() => {
    if (!tabParam) return
    if (typeof window !== 'undefined' && window.location.hash) return
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(`section-${tabParam}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [tabParam])

  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {showOffers && (
        <Section
          id="bids"
          icon={<ArrowsRightLeftIcon className="h-4 w-4" />}
          title="Offers"
          count={offersBids.length}
        >
          <OffersSection
            bids={offersBids}
            project={project}
            userProfile={userProfile}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
            activeAuction={activeAuction}
          />
          {project.type === 'grant' && project.stage === 'proposal' && (
            <InlineDonateCTA
              project={project}
              profile={userProfile}
              maxDonation={userSpendableFunds}
            />
          )}
        </Section>
      )}

      {showDonations && (
        <Section
          id="donations"
          icon={<HandRaisedIcon className="h-4 w-4" />}
          title="Donations"
          count={donations.length}
        >
          <DonationsSection donations={donations} />
          <InlineDonateCTA
            project={project}
            profile={userProfile}
            maxDonation={userSpendableFunds}
          />
        </Section>
      )}

      {shareholders && (
        <Section
          id="shareholders"
          icon={<UsersIcon className="h-4 w-4" />}
          title="Shareholders"
          count={shareholders.length}
        >
          <Shareholders
            shareholders={shareholders}
            creator={creator}
            txns={txns}
            projectId={project.id}
            usingAmm={!!project.amm_shares && project.amm_shares > 0}
          />
        </Section>
      )}

      <Section
        id="comments"
        icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
        title="Comments"
        count={comments.length}
      >
        <Comments
          project={project}
          comments={comments}
          userProfile={userProfile}
          userCharityBalance={userCharityBalance}
          commenterContributions={commenterContributions}
          specialPrompt={specialCommentPrompt}
        />
      </Section>

      {!!similarEnoughProjects?.length && (
        <Section
          id="similar"
          icon={<Squares2X2Icon className="h-4 w-4" />}
          title="Similar projects"
          count={similarEnoughProjects.length}
        >
          <SimilarProjects similarProjects={similarEnoughProjects} />
        </Section>
      )}
    </div>
  )
}

function Section(props: {
  id: SectionId
  icon: React.ReactNode
  title: string
  count?: number
  children: React.ReactNode
}) {
  const { id, icon, title, count, children } = props
  return (
    <section id={`section-${id}`} className="scroll-mt-20">
      <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-3 sm:mb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100">
          {icon}
        </span>
        <h2 className="font-josefin text-2xl font-semibold leading-none text-gray-900 sm:text-3xl">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-orange-100 px-2 py-0.5 font-josefin text-sm font-semibold tabular-nums text-orange-700 ring-1 ring-orange-200">
            {count}
          </span>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}

// --- Offers ---

type OfferSort = 'amount' | 'date'

function OffersSection(props: {
  bids: BidAndProfile[]
  project: FullProject
  userProfile?: Profile
  userSpendableFunds: number
  userSellableShares: number
  activeAuction?: boolean
}) {
  const { bids, project, userProfile, userSpendableFunds, userSellableShares, activeAuction } =
    props
  const [sort, setSort] = useState<OfferSort>('amount')
  const [showAll, setShowAll] = useState(false)

  const sortedBids = useMemo(() => {
    const copy = [...bids]
    if (sort === 'amount') {
      copy.sort((a, b) => b.amount - a.amount)
    } else {
      copy.sort((a, b) =>
        compareDesc(new Date(a.created_at as string), new Date(b.created_at as string))
      )
    }
    return copy
  }, [bids, sort])

  if (bids.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm italic text-gray-500">
        No offers yet — be the first to back this project.
      </p>
    )
  }

  const visible = showAll ? sortedBids : sortedBids.slice(0, OFFERS_INITIAL_VISIBLE)
  const remaining = sortedBids.length - visible.length

  return (
    <div className="flex flex-col gap-4">
      {bids.length > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-500">Sort</span>
          <SortToggle value={sort} onChange={setSort} />
        </div>
      )}
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {visible.map((bid) => (
          <TightOfferRow
            key={bid.id}
            bid={bid}
            project={project}
            userProfile={userProfile}
            activeAuction={activeAuction}
            userSellableShares={userSellableShares}
            userSpendableFunds={userSpendableFunds}
          />
        ))}
      </ul>
      {remaining > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="group mx-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
        >
          <span>Show {remaining} more</span>
          <span className="font-josefin text-xs text-gray-400 transition-transform group-hover:translate-y-px group-hover:text-orange-500">
            ↓
          </span>
        </button>
      )}
      {showAll && bids.length > OFFERS_INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(false)}
          className="mx-auto text-xs uppercase tracking-wider text-gray-400 hover:text-gray-600"
        >
          Show less
        </button>
      )}
    </div>
  )
}

function SortToggle(props: { value: OfferSort; onChange: (v: OfferSort) => void }) {
  const { value, onChange } = props
  return (
    <div className="relative inline-flex items-center rounded-full bg-gray-100 p-0.5 text-xs font-medium">
      <span
        className={clsx(
          'absolute inset-y-0.5 w-1/2 rounded-full bg-white shadow-sm transition-transform duration-200',
          value === 'amount' ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden
      />
      <button
        onClick={() => onChange('amount')}
        className={clsx(
          'relative z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors',
          value === 'amount' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
        )}
      >
        <ArrowDownIcon className="h-3 w-3" />
        Largest
      </button>
      <button
        onClick={() => onChange('date')}
        className={clsx(
          'relative z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors',
          value === 'date' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
        )}
      >
        <ArrowUpIcon className="h-3 w-3" />
        Newest
      </button>
    </div>
  )
}

function TightOfferRow(props: {
  bid: BidAndProfile
  project: FullProject
  userProfile?: Profile
  activeAuction?: boolean
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    bid,
    project,
    userProfile,
    activeAuction,
    userSpendableFunds,
    userSellableShares,
  } = props
  const showValuation = bid.type === 'sell' || (!activeAuction && bid.type !== 'donate')
  const showTrade =
    !!userProfile &&
    bid.bidder !== userProfile.id &&
    bid.type !== 'assurance buy' &&
    bid.type !== 'donate'
  const isOwn = !!userProfile && bid.bidder === userProfile.id

  const typeLabel =
    bid.type === 'sell'
      ? 'Sell'
      : bid.type === 'donate'
        ? 'Donate'
        : bid.type === 'assurance buy'
          ? 'Pledge'
          : 'Buy'
  const typeColor =
    bid.type === 'sell'
      ? 'bg-rose-50 text-rose-600 ring-rose-100'
      : bid.type === 'donate' || bid.type === 'assurance buy'
        ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
        : 'bg-sky-50 text-sky-600 ring-sky-100'

  return (
    <li className="group flex items-center gap-3 px-3 py-1.5 text-sm tabular-nums hover:bg-gray-50">
      <span
        className={clsx(
          'hidden w-14 flex-none rounded px-1.5 py-0.5 text-center text-[10px] font-medium uppercase tracking-wide ring-1 sm:inline-block',
          typeColor
        )}
      >
        {typeLabel}
      </span>
      <div className="min-w-0 flex-1">
        <UserAvatarAndBadge profile={bid.profiles} short />
      </div>
      <div className="flex flex-none items-baseline gap-1 text-right">
        <span className="font-medium text-gray-900">{formatMoneyPrecise(bid.amount)}</span>
        {showValuation && (
          <span className="hidden text-xs text-gray-400 sm:inline">
            @ {formatMoneyPrecise(bid.valuation)}
          </span>
        )}
      </div>
      <span className="hidden w-20 flex-none text-right text-xs text-gray-400 md:inline">
        {formatDistanceToNowStrict(new Date(bid.created_at), { addSuffix: false })}
      </span>
      <div className="flex flex-none items-center gap-1">
        {isOwn && <DeleteBid bidId={bid.id} />}
        {showTrade && (
          <Trade
            bid={bid}
            project={project}
            userId={userProfile.id}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
          />
        )}
      </div>
    </li>
  )
}

// --- Donations ---

function DonationsSection(props: { donations: TxnAndProfiles[] }) {
  const { donations } = props
  const [sort, setSort] = useState<OfferSort>('amount')

  const sorted = useMemo(() => {
    const copy = [...donations]
    if (sort === 'amount') {
      copy.sort((a, b) => b.amount - a.amount)
    } else {
      copy.sort((a, b) => compareDesc(new Date(a.created_at), new Date(b.created_at)))
    }
    return copy
  }, [donations, sort])

  if (donations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm italic text-gray-500">
        No donations yet — be the first.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {donations.length > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-500">Sort</span>
          <SortToggle value={sort} onChange={setSort} />
        </div>
      )}
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {sorted.map((txn) =>
          txn.profiles ? <TightDonationRow key={txn.id} txn={txn} /> : null
        )}
      </ul>
    </div>
  )
}

function TightDonationRow(props: { txn: TxnAndProfiles }) {
  const { txn } = props
  return (
    <li className="flex items-center gap-3 px-3 py-1.5 text-sm tabular-nums hover:bg-gray-50">
      <div className="min-w-0 flex-1">
        <UserAvatarAndBadge profile={txn.profiles as Profile} short />
      </div>
      <span className="flex-none font-medium text-gray-900">{formatMoneyPrecise(txn.amount)}</span>
      <span className="hidden w-20 flex-none text-right text-xs text-gray-400 md:inline">
        {formatDistanceToNowStrict(new Date(txn.created_at), { addSuffix: false })}
      </span>
    </li>
  )
}

// --- Donate CTA ---

const QUICK_AMOUNTS = [25, 100, 500]

function InlineDonateCTA(props: {
  project: FullProject
  profile?: Profile
  maxDonation: number
}) {
  const { project, profile, maxDonation } = props
  const router = useRouter()
  const [amount, setAmount] = useState<number | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const isPledge = project.stage === 'proposal'

  let errorMessage: string | null = null
  if (amount && amount > maxDonation) {
    errorMessage = `You can ${isPledge ? 'pledge' : 'donate'} up to ${formatMoney(maxDonation)}.`
  } else if (amount && amount < 10) {
    errorMessage = `Minimum is $10.`
  }

  const submit = async () => {
    if (!profile || !amount || errorMessage) return
    setSubmitting(true)
    if (isPledge) {
      await fetch('/api/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          valuation: 0,
          amount,
          type: 'donate',
        }),
      })
    } else {
      await fetch('/api/transfer-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: profile.id,
          toId: project.creator,
          amount,
          projectId: project.id,
        }),
      })
    }
    setAmount(undefined)
    setSubmitting(false)
    router.refresh()
    scrollToComments(router)
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-rose-500 p-[1px] shadow-lg shadow-orange-500/10">
      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-rose-400/30 blur-3xl"
      />
      <div className="relative rounded-[15px] bg-white px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-sm">
                <HeartIcon className="h-4 w-4" />
              </span>
              <span className="font-josefin text-xs font-medium uppercase tracking-[0.18em] text-orange-600">
                {isPledge ? 'Pledge a donation' : 'Support this project'}
              </span>
            </div>
            <h3 className="mt-2 font-josefin text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">
              {isPledge ? 'Help unlock this project.' : 'Add fuel to the fire.'}
            </h3>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-600">
              {isPledge
                ? "You're pledging to donate if the project hits its minimum and gets approved. If not, your funds are returned."
                : 'Every dollar goes directly to the creator and helps move the work forward.'}
            </p>
            {isPledge && project.auction_close && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-100">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                <TimeLeftDisplay closeDate={project.auction_close ?? ''} />
              </div>
            )}
          </div>

          {profile ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[18rem]">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setAmount(qa)}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition-all',
                      amount === qa
                        ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'
                    )}
                  >
                    {formatMoney(qa)}
                  </button>
                ))}
              </div>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-josefin text-base text-gray-400">
                    $
                  </span>
                  <AmountInput
                    amount={amount}
                    onChangeAmount={setAmount}
                    placeholder="Custom"
                    className="w-full pl-7 font-josefin tabular-nums"
                  />
                </div>
                <Button
                  onClick={submit}
                  disabled={!amount || !!errorMessage}
                  loading={submitting}
                  color="gradient"
                  className="font-josefin font-semibold tracking-wide"
                >
                  {isPledge ? 'Pledge' : 'Donate'}
                </Button>
              </div>
              {errorMessage && (
                <p className="text-xs text-rose-600">{errorMessage}</p>
              )}
            </div>
          ) : (
            <div className="sm:min-w-[18rem]">
              <SignInButton
                buttonText={isPledge ? 'Sign in to pledge' : 'Sign in to donate'}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- helpers (moved from old version unchanged) ---

export type Shareholder = {
  profile: Profile
  numShares: number
}
export function getShareholders(txns: TxnAndProfiles[]) {
  const bundledTxns = bundleTxns(txns)
  const shareholders = Object.fromEntries(
    txns.flatMap((txn) => [
      [txn.from_id, { numShares: 0 } as Shareholder],
      [txn.to_id, { numShares: 0 } as Shareholder],
    ])
  )
  for (const bundle of bundledTxns) {
    for (const txn of bundle) {
      if (txn.token === 'USD' && txn.from_id) {
        shareholders[txn.from_id].profile = txn.profiles as Profile
      } else {
        shareholders[txn.to_id].numShares += txn.amount
        if (txn.from_id) {
          shareholders[txn.from_id].numShares -= txn.amount
          shareholders[txn.from_id].profile = txn.profiles as Profile
        }
      }
    }
  }
  const shareholdersArray = Object.values(shareholders) as Shareholder[]
  shareholdersArray.forEach((shareholder) => {
    shareholder.numShares = Math.round(shareholder.numShares)
  })
  return shareholdersArray.filter((shareholder) => !!shareholder.profile)
}

export function getCommenterContributions(
  comments: CommentAndProfile[],
  bids: BidAndProfile[],
  txns: TxnAndProfiles[],
  shareholders?: Shareholder[]
) {
  const commenterIds = uniq(comments.map((comment) => comment.commenter))
  const contributions = Object.fromEntries(commenterIds.map((commenterId) => [commenterId, '']))
  commenterIds.forEach((commenterId) => {
    if (shareholders) {
      const holding = shareholders.find((shareholder) => shareholder.profile.id === commenterId)
      if (holding) {
        contributions[commenterId] = `holds ${formatPercent(holding.numShares / TOTAL_SHARES)}`
      }
    }
    if (!contributions[commenterId] && txns) {
      const donations = txns.filter(
        (txn) => txn.from_id === commenterId && txn.token === 'USD' && !txn.bundle
      )
      const totalDonated = donations.reduce((total, txn) => total + txn.amount, 0)
      if (totalDonated > 0) {
        contributions[commenterId] = `donated ${formatMoneyPrecise(totalDonated)}`
      }
    }
    if (!contributions[commenterId]) {
      const relevantBids = bids.filter(
        (bid) => bid.status === 'pending' && bid.bidder === commenterId
      )
      const sortedBids = relevantBids.sort((a, b) =>
        compareDesc(new Date(a.created_at), new Date(b.created_at))
      )
      const latestBid = sortedBids[0]
      if (latestBid) {
        const offered = formatMoneyPrecise(relevantBids.reduce((acc, bid) => acc + bid.amount, 0))
        contributions[commenterId] =
          latestBid.type === 'donate' ||
          latestBid.type === 'buy' ||
          latestBid.type === 'assurance buy'
            ? `offering ${offered}`
            : `selling at ${formatMoneyPrecise(latestBid.valuation)}`
      }
    }
  })
  return contributions
}
