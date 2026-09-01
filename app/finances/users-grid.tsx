'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import { DataSheetGrid, textColumn, keyColumn, floatColumn } from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'

type User = {
  id: string | null
  username?: string
  full_name?: string
  balance: number
}

export default function UsersGrid({ users }: { users: User[] }) {
  // Manifund-Bank has a large negative balance for accounting; ignore it
  const bankBalance = users.find((user) => user.username === 'Manifund-Bank')?.balance ?? 0
  const usersTotal = users.reduce((acc, user) => acc + user.balance, 0) - bankBalance

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
        Total (excluding "Manifund Bank" account):{' '}
        {usersTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </div>
      <DataSheetGrid value={users} columns={columns} rowHeight={30} height={800} lockRows />
    </div>
  )
}

export function BalanceSheet() {
  const lastUpdated = '2026-09-01'
  const $ = {
    // Stripe Opal + Payments balance
    stripe: 17_781,
    // Mercury Manifund Grants account
    mercury: 3_483_610,
    coinbase: 2_073_904,
    // Current users
    users: -5_689_856,
    // Regranting pot owed + amount assigned to regrantors
    regranting: -2_250_000 + 2_075_000,
    // not credited: -pending grants on Airtable
    pending: -0,
    // Donations for Manifold for Charity
    // 500k initial - donated - David MCF - AmmonLam
    charity: 500000 - 315832 - 186747,
    // Mox: Mercury + Stripe pending
    mox: 321_228,

    mox_fund: 142_300,
    // Part of the $180k sent to Manifest on 2026-06-01; repayable, so it stays an asset
    manifest_loan: 100_000,
  }
  const financeRows = [
    { name: 'Stripe Bank', balance: $.stripe },
    { name: 'Mercury', balance: $.mercury },
    { name: 'Coinbase (USDC)', balance: $.coinbase },
    { name: 'Mox balance (Mercury + Stripe)', balance: $.mox },
    { name: 'Mox Fund investments', balance: $.mox_fund },
    { name: 'Loan to Manifest', balance: $.manifest_loan },
    {
      name: 'Total assets',
      balance: $.stripe + $.mercury + $.coinbase + $.mox + $.mox_fund + $.manifest_loan,
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
        $.mox_fund +
        $.manifest_loan,
    },
    {},
    { name: '(not included in net calculations)' },
    { name: 'ACX Grants balance', balance: 385 },
    { name: 'Frame Fellowship', balance: 496_579 },
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
        columns={[keyColumn('name', textColumn), keyColumn('balance', floatColumn)]}
        rowHeight={30}
        lockRows
      />
    </>
  )
}
