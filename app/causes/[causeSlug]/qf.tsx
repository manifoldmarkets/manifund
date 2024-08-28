import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/table-catalyst'
import { BidAndProfile } from '@/db/bid'
import { Project } from '@/db/project'
import { TxnAndProfiles } from '@/db/txn'
import { keyBy, sum } from 'lodash'
import Link from 'next/link'

// A single donation or offer, used for calculating quadratic funding match
type Vote = {
  projectId: string
  donorId: string
  amount: number
}

type VoteMap = {
  [projectId: string]: {
    [donorId: string]: number
  }
}

// Txns & offers in Aug 2024 are eligible for EA Community Choice
function eligibleTime(createdAt: string) {
  // createdAt is in the format 2024-08-01T00:00:00Z
  const date = new Date(createdAt)
  return new Date('2024-08-01') <= date && date < new Date('2024-09-01')
}

export default function QuadraticMatch(props: {
  projects?: Project[]
  matchTxns?: TxnAndProfiles[]
  matchBids?: BidAndProfile[]
}) {
  const { projects = [], matchTxns = [], matchBids = [] } = props

  const projectMap = keyBy(projects, 'id')
  // const profiles = [
  //   ...matchTxns.map((txn) => txn.profiles),
  //   ...matchBids.map((bid) => bid.profiles),
  // ]
  // const profileMap = keyBy(profiles, 'id')
  const votes: Vote[] = []
  const voteMap: VoteMap = {}

  // Consolidate txns and bids into a single list of votes
  matchTxns.forEach((txn) => {
    if (!txn.project || !txn.profiles) return
    if (!eligibleTime(txn.created_at)) return
    votes.push({
      projectId: txn.project,
      donorId: txn.profiles.id,
      amount: txn.amount,
    })
  })
  matchBids.forEach((bid) => {
    if (!bid.profiles) return
    if (!eligibleTime(bid.created_at)) return
    votes.push({
      projectId: bid.project,
      donorId: bid.profiles.id,
      amount: bid.amount,
    })
  })

  // Build up the vote map
  votes.forEach((vote) => {
    const { projectId, donorId, amount } = vote
    if (!voteMap[projectId]) voteMap[projectId] = {}
    // Merge "votes" from the same donor
    voteMap[projectId][donorId] = (voteMap[projectId][donorId] || 0) + amount
  })

  // Calculate quadratic match: square of sum of square roots of vote amounts
  function rawMatch(votes: Record<string, number>) {
    const sqrtVotes = sum(Object.values(votes).map((v) => Math.sqrt(v)))
    return Math.round(sqrtVotes * sqrtVotes)
  }

  const totalRawMatch = sum(Object.values(voteMap).map(rawMatch))
  const POOL_SIZE = 100_000

  return (
    <div>
      <p>
        Donations made during EA Community Choice qualify for the $100k matching
        pool!
      </p>
      <p className="mb-4 text-sm font-extralight italic text-gray-500">
        All amounts are projections; they may change based on further donations
        or at Manifund&apos;s discretion.
      </p>
      <Table dense>
        <TableRow>
          <TableHeader>Project</TableHeader>
          <TableHeader># Donors</TableHeader>
          <TableHeader>Donated</TableHeader>
          <TableHeader>Matched</TableHeader>
          <TableHeader>Total</TableHeader>
        </TableRow>
        <TableBody>
          {/* First row is total across projects */}
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>
              {new Set(votes.map((vote) => vote.donorId)).size}
            </TableCell>
            <TableCell>
              {sum(votes.map((vote) => vote.amount)).toFixed(0)}
            </TableCell>
            <TableCell>{POOL_SIZE}</TableCell>
            <TableCell>
              {(POOL_SIZE + sum(votes.map((vote) => vote.amount))).toFixed(0)}
            </TableCell>
          </TableRow>

          {/* TODO: Sort table by total amount */}
          {/* Then create one row per project */}
          {Object.entries(voteMap).map(([projectId, votes]) => (
            <TableRow key={projectId}>
              <TableCell>
                <Link href={`/projects/${projectMap[projectId].slug}`}>
                  {projectMap[projectId].title.slice(0, 60)}
                </Link>
              </TableCell>
              <TableCell>{Object.keys(votes).length}</TableCell>
              <TableCell>{sum(Object.values(votes)).toFixed(0)}</TableCell>
              <TableCell>
                {((rawMatch(votes) / totalRawMatch) * POOL_SIZE).toFixed(0)}
              </TableCell>
              <TableCell>
                {(
                  sum(Object.values(votes)) +
                  (rawMatch(votes) / totalRawMatch) * POOL_SIZE
                ).toFixed(0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
