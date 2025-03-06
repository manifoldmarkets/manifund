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
  const lastUpdated = '2025-03-05'
  const $ = {
    // Stripe Opal + Payments balance
    stripe: 179_560 + 52_934,
    mercury: 1_988_104,
    coinbase: 865_732,
    // Current users, plus regranting
    users: -1_525_853 - 1_500_000,
    // Pending: saferAI withdraw
    pending: -100_000,
    // Donations for Manifold for Charity
    // 500k initial - donated - David MCF - AmmonLam
    charity: 500000 - 315832 - 186747,
    // Mox: Mercury + Stripe pending
    mox: 67_725 + 3_949,
  }
  const financeRows = [
    { name: 'Stripe Bank', balance: $.stripe },
    { name: 'Mercury', balance: $.mercury },
    { name: 'Coinbase (USDC)', balance: $.coinbase },
    { name: 'Total assets', balance: $.stripe + $.mercury + $.coinbase },
    {},
    { name: 'User balances', balance: $.users },
    { name: 'Pending transfers', balance: $.pending },
    { name: 'Pending: Manifold for Charity donations', balance: $.charity },
    { name: 'Total liabilities', balance: $.users + $.pending + $.charity },
    {},
    {
      name: 'Manifund Net',
      balance:
        $.stripe + $.mercury + $.coinbase + $.users + $.pending + $.charity,
    },
    {},
    { name: 'Mox Net', balance: $.mox },
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
