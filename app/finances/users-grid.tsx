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
  const lastUpdated = '2025-06-12'
  const $ = {
    // Stripe Opal + Payments balance
    stripe: 809_922 + 123_966,
    // Mercury Manifund Grants account
    mercury: 2_498_558,
    coinbase: 635_459,
    // Current users
    users: -3_725_548,
    // Regranting pot owed, plus 11 * 100k regrantors + neel (250k)
    regranting: -2_250_000 + 100_000 * 11 + 250_000,
    // not credited: 250k in flight for Craig
    pending: 250_000,
    // Donations for Manifold for Charity
    // 500k initial - donated - David MCF - AmmonLam
    charity: 500000 - 315832 - 186747,
    // Manifest balance
    manifest: 290_338,
    // Mox: Mercury + Stripe pending + pending donations from EAIF
    // Note that we've transferred $500k from the grants balance so far
    mox: 77_465 + 4_195 + 65_000,
  }
  const financeRows = [
    { name: 'Stripe Bank', balance: $.stripe },
    { name: 'Mercury', balance: $.mercury },
    { name: 'Coinbase (USDC)', balance: $.coinbase },
    { name: 'Total assets', balance: $.stripe + $.mercury + $.coinbase },
    {},
    { name: 'User balances', balance: $.users },
    { name: 'Unallocated regrant funds', balance: $.regranting },
    { name: 'Pending transfers', balance: $.pending },
    { name: 'Pending: Manifold for Charity donations', balance: $.charity },
    { name: 'Total liabilities', balance: $.users + $.regranting + $.pending + $.charity },
    {},
    {
      name: 'Grants net balance',
      balance:
        $.stripe + $.mercury + $.coinbase + $.users + $.regranting + $.pending + $.charity,
    },
    { name: 'Manifest balance', balance: $.manifest },
    { name: 'Mox balance', balance: $.mox },
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
        $.manifest +
        $.mox,
    },
  ]
  // Using a grid to display the finances
  return (
    <>
      <div className="text-right text-sm text-gray-500">
        Last updated: {lastUpdated}
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
