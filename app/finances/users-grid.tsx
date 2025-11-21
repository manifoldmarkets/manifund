'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import {
  DataSheetGrid,
  textColumn,
  keyColumn,
  floatColumn,
} from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'

type User = {
  id: string | null
  username?: string
  full_name?: string
  balance: number
}

export default function UsersGrid({ users }: { users: User[] }) {
  // Manifund-Bank has a large negative balance for accounting; ignore it
  const bankBalance =
    users.find((user) => user.username === 'Manifund-Bank')?.balance ?? 0
  const usersTotal =
    users.reduce((acc, user) => acc + user.balance, 0) - bankBalance

  const columns = useMemo(
    () => [
      // Link to profile
      {
        component: ({ rowData }) => {
          return (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:underline"
              href={`/${rowData.username}`}
            >
              {rowData.username}
            </Link>
          )
        },
        copyValue: ({ rowData }) => rowData.username,
        title: 'Username',
        width: 200,
        maxWidth: 200,
      },
      {
        ...keyColumn('full_name', textColumn),
        title: 'Full Name',
        width: 200,
        maxWidth: 300,
      },

      {
        ...keyColumn('balance', floatColumn),
        title: 'Balance',
        width: 120,
      },
    ],
    []
  )

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manifund balance sheet</h1>
      <BalanceSheet />
      <h1 className="my-4 text-2xl font-bold">User balances</h1>
      <div className="text-right text-sm text-gray-500">
        Total as of now:{' '}
        {usersTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </div>
      <DataSheetGrid
        value={users}
        columns={columns}
        rowHeight={30}
        height={800}
        lockRows
      />
    </div>
  )
}

export function BalanceSheet() {
  const lastUpdated = '2025-11-21'
  const $ = {
    // Stripe Opal + Payments balance
    stripe: 313_348 + 97_386,
    // Mercury Manifund Grants account
    mercury: 930_580,
    coinbase: 1_676_103,
    // Current users
    users: -2_912_045,
    // Regranting pot owed, plus 11 * 100k regrantors + neel (350k) + gavin/joel reup (2*50k)
    regranting: -2_250_000 + 100_000 * 11 + 350_000 + 100_000,
    // not credited: txn'd but not yet sent to grantees; ACXG balance not yet removed
    pending: -7_173 + 50_000,
    // Donations for Manifold for Charity
    // 500k initial - donated - David MCF - AmmonLam
    charity: 500000 - 315832 - 186747,
    // Mox: Mercury + Stripe pending
    // Note that we've transferred $800k from the grants balance so far, and recouped $315k
    mox: 148_954 + 16_684,

    // Investments
    vara_for_manifund: 476_566,
    vara_for_others: 2_587_484 - 476_566,
    mox_fund: 129_800,
  }
  const financeRows = [
    { name: 'Stripe Bank', balance: $.stripe },
    { name: 'Mercury', balance: $.mercury },
    { name: 'Coinbase (USDC)', balance: $.coinbase },
    { name: 'VARA, for Manifund', balance: $.vara_for_manifund },
    { name: 'Mox balance (Mercury + Stripe)', balance: $.mox },
    { name: 'Mox Fund investments', balance: $.mox_fund },
    {
      name: 'Total assets',
      balance:
        $.stripe +
        $.mercury +
        $.coinbase +
        $.vara_for_manifund +
        $.mox +
        $.mox_fund,
    },
    {},
    { name: 'User balances', balance: $.users },
    { name: '2025 regrantor funds, to be allocated', balance: $.regranting },
    { name: 'Pending transfers', balance: $.pending },
    { name: 'Pending Manifold for Charity donations', balance: $.charity },
    {
      name: 'Total liabilities',
      balance: $.users + $.regranting + $.pending + $.charity,
    },
    {},
    {
      name: 'Total net assets',
      balance:
        $.stripe +
        $.mercury +
        $.coinbase +
        $.users +
        $.regranting +
        $.pending +
        $.charity +
        $.mox +
        $.vara_for_manifund +
        $.mox_fund,
    },
    {},
    { name: '(not included in net calculations)' },
    { name: 'VARA, for donors', balance: $.vara_for_others },
    { name: 'ACX Grants balance', balance: 854_410 },
    { name: 'Frame Fellowship', balance: 50_000 },
  ]
  // Using a grid to display the finances
  return (
    <>
      <div className="text-right text-sm text-gray-500">
        All values are estimates. Last updated: {lastUpdated}
      </div>
      <DataSheetGrid
        height={800}
        value={financeRows}
        columns={[
          keyColumn('name', textColumn),
          keyColumn('balance', floatColumn),
        ]}
        lockRows
      />
    </>
  )
}
