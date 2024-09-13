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

// Txns & offers in 08-12 to 09-05 are eligible for EA Community Choice
function eligibleTime(createdAt: string) {
  const date = new Date(createdAt)
  return (
    new Date('2024-08-12') <= date &&
    date < new Date('2024-09-05T11:59:59.999Z')
  )
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

  // Calculate T, table representing coordination between very pair of voters
  // T[i][j] is the sum over each project p, of sqrt(voteMap[p][i] * voteMap[p][j])
  const T: { [key: string]: { [key: string]: number } } = {}
  Object.entries(voteMap).forEach(([projectId, votes]) => {
    Object.entries(votes).forEach(([i, amountA]) => {
      Object.entries(votes).forEach(([j, amountB]) => {
        if (!T[i]) T[i] = {}
        T[i][j] = (T[i][j] || 0) + Math.sqrt(amountA * amountB)
      })
    })
  })

  // Weighted for pairwise quadratic funding: https://ethresear.ch/t/pairwise-coordination-subsidies-a-new-quadratic-funding-design/5553
  const M = 7
  function pairwiseMatch(votes: Record<string, number>) {
    let match = 0
    // Iterate over all pairs of voters
    Object.entries(votes).forEach(([i, amountA]) => {
      Object.entries(votes).forEach(([j, amountB]) => {
        const kIJ = M / (M + T[i][j])
        match += kIJ * Math.sqrt(amountA * amountB)
      })
    })
    return match
  }

  // Calculate quadratic match: square of sum of square roots of vote amounts
  function rawMatch(votes: Record<string, number>) {
    const exponent = 2
    const sqrtVotes = sum(Object.values(votes).map((v) => v ** (1 / exponent)))
    return Math.round(sqrtVotes ** exponent)
  }
  function e15rawMatch(votes: Record<string, number>) {
    const exponent = 1.5
    const sqrtVotes = sum(Object.values(votes).map((v) => v ** (1 / exponent)))
    return Math.round(sqrtVotes ** exponent)
  }
  function total(votes: Record<string, number>) {
    return sum(Object.values(votes))
  }
  const totalRawMatch = sum(Object.values(voteMap).map(rawMatch))
  const totalE15Match = sum(Object.values(voteMap).map(e15rawMatch))
  const POOL_SIZE = 100_000
  function match(votes: Record<string, number>) {
    return (rawMatch(votes) / totalRawMatch) * POOL_SIZE
  }
  function e15Match(votes: Record<string, number>) {
    return (e15rawMatch(votes) / totalE15Match) * POOL_SIZE
  }

  console.log('subsidy ratio', totalRawMatch / POOL_SIZE)

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
          <TableHeader>Quadratic</TableHeader>
          <TableHeader>1.5</TableHeader>
          <TableHeader>Pairwise</TableHeader>
          {/* <TableHeader>p - m</TableHeader> */}
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
            <TableCell>{POOL_SIZE}</TableCell>
            <TableCell>
              {sum(
                Object.entries(voteMap).map(([projectId, votes]) =>
                  pairwiseMatch(votes)
                )
              ).toFixed(0)}
            </TableCell>
            {/* <TableCell>TODO</TableCell> */}
            <TableCell>
              {(POOL_SIZE + sum(votes.map((vote) => vote.amount))).toFixed(0)}
            </TableCell>
          </TableRow>

          {/* Sort table by total donated, then create one row per project */}
          {Object.entries(voteMap)
            .sort(
              ([idA, votesA], [idB, votesB]) =>
                total(votesB) + match(votesB) - (total(votesA) + match(votesA))
            )
            .map(([projectId, votes]) => (
              <TableRow key={projectId}>
                <TableCell>
                  <Link
                    href={`/projects/${projectMap[projectId].slug}`}
                    className="hover:underline"
                  >
                    {projectMap[projectId].title.slice(0, 40)}
                  </Link>
                </TableCell>
                <TableCell>{Object.keys(votes).length}</TableCell>
                <TableCell>{total(votes).toFixed(0)}</TableCell>
                <TableCell>{match(votes).toFixed(0)}</TableCell>
                <TableCell>{e15Match(votes).toFixed(0)}</TableCell>
                <TableCell>{pairwiseMatch(votes).toFixed(0)}</TableCell>
                {/* <TableCell>
                  {(pairwiseMatch(votes) - match(votes)).toFixed(0)}
                </TableCell> */}
                <TableCell>
                  {(total(votes) + match(votes)).toFixed(0)}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
