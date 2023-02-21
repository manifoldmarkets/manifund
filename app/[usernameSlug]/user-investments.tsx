import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/db/supabase-server'
import { CalendarIcon } from '@heroicons/react/24/outline'
import {
  getIncomingSharesByUser,
  getOutgoingSharesByUser,
  getIncomingPaymentsByUser,
  getOutgoingPaymentsByUser,
} from '@/db/txn'
import { getProjectById } from '@/db/project'
import { RoundTag } from '@/components/round-tag'
import Link from 'next/link'

type Txn = Database['public']['Tables']['txns']['Row']
type investment = {
  project_id: string
  num_shares: number
  price_usd: number
}

export async function Investments(props: { user: string }) {
  const { user } = props
  const supabase = createServerClient()
  const incomingShares: Txn[] = await getIncomingSharesByUser(supabase, user)
  const outgoingShares: Txn[] = await getOutgoingSharesByUser(supabase, user)
  const incomingPayments: Txn[] = await getIncomingPaymentsByUser(
    supabase,
    user
  )
  const outgoingPayments: Txn[] = await getOutgoingPaymentsByUser(
    supabase,
    user
  )
  const investments = compileInvestments(
    incomingShares,
    outgoingShares,
    incomingPayments,
    outgoingPayments
  )
  const investmentsDisplay = investments.map((item) => (
    <li key={item.project_id}>
      {/* @ts-expect-error Server Component */}
      <InvestmentsDisplay
        supabase={supabase}
        user={user}
        project_id={item.project_id}
        amount={item.price_usd}
        num_shares={item.num_shares}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-2xl">Investments</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {investmentsDisplay}
        </ul>
      </div>
    </div>
  )
}

async function InvestmentsDisplay(props: {
  supabase: SupabaseClient
  user: string
  project_id: string
  amount: number
  num_shares: number
}) {
  const { supabase, user, project_id, amount, num_shares } = props
  if (num_shares == 0) {
    return <div className="hidden"></div>
  }
  const project = await getProjectById(supabase, project_id)
  if (project.creator == user) {
    return <div className="hidden"></div>
  }
  return (
    <Link href={`/projects/${project.slug}`} className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">
            {project.title}
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <RoundTag round={project.round} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              bought&nbsp;<span className="text-black">${amount}</span>
              &nbsp;@&nbsp;
              <span className="text-black">
                ${(amount * 10000000) / num_shares}
              </span>
              &nbsp;valuation
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function compileInvestments(
  incomingShares: Txn[],
  outgoingShares: Txn[],
  incomingPayments: Txn[],
  outgoingPayments: Txn[]
) {
  let investments: investment[] = []
  incomingShares.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project_id === item.token
    )
    if (aggInvestment) {
      aggInvestment.num_shares += item.amount
    } else {
      investments.push({
        project_id: item.token,
        num_shares: item.amount,
        price_usd: 0,
      })
    }
  })
  outgoingShares.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project_id === item.token
    )
    if (aggInvestment) {
      aggInvestment.num_shares -= item.amount
    } else {
      investments.push({
        project_id: item.token,
        num_shares: -item.amount,
        price_usd: 0,
      })
    }
  })
  incomingPayments.forEach((item) => {
    if (item.from_id) {
      let aggInvestment = investments.find(
        (investment) => investment.project_id === item.payment_for
      )
      if (aggInvestment) {
        aggInvestment.price_usd -= item.amount
      } else {
        investments.push({
          project_id: item.from_id,
          num_shares: 0,
          price_usd: -item.amount,
        })
      }
    }
  })
  outgoingPayments.forEach((item) => {
    if (item.to_id) {
      let aggInvestment = investments.find(
        (investment) => investment.project_id === item.payment_for
      )
      if (aggInvestment) {
        aggInvestment.price_usd += item.amount
      } else {
        investments.push({
          project_id: item.to_id,
          num_shares: 0,
          price_usd: item.amount,
        })
      }
    }
  })
  return investments as investment[]
}
