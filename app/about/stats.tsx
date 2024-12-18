'use client'
import { Stat } from '@/components/stat'
import { Row } from '@/components/layout/row'
import { FullTxn } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import { uniq } from 'lodash'
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Tooltip,
} from 'recharts'

export function Stats(props: { txns: FullTxn[] }) {
  const { txns } = props
  const grantDonations = txns.filter(
    (txn) => txn.type === 'project donation' && txn.projects?.type === 'grant'
  )
  const certTradesToCreator = txns.filter(
    (txn) =>
      (txn.type === 'user to amm trade' || txn.type === 'user to user trade') &&
      txn.projects?.creator === txn.to_id &&
      txn.token === 'USD'
  )
  const certTradesFromCreator = txns.filter(
    (txn) =>
      (txn.type === 'user to amm trade' || txn.type === 'user to user trade') &&
      txn.projects?.creator === txn.from_id &&
      txn.token === 'USD'
  )
  const dollarsToGrants = grantDonations.reduce(
    (acc, txn) => acc + txn.amount,
    0
  )
  const dollarsToCerts =
    certTradesToCreator.reduce((acc, txn) => acc + txn.amount, 0) -
    certTradesFromCreator.reduce((acc, txn) => acc + txn.amount, 0)
  const dollarsThroughRegrantors = grantDonations
    .filter(
      (txn) => txn.profiles?.regranter_status && txn.projects?.type === 'grant'
    )
    .reduce((acc, txn) => acc + txn.amount, 0)
  const dollarsToProjects = dollarsToGrants + dollarsToCerts
  const grantsFunded = uniq(grantDonations.map((txn) => txn.project)).length
  const certsFunded = uniq(certTradesToCreator.map((txn) => txn.project)).length
  const numProjectsFunded = grantsFunded + certsFunded
  const grantsToAmounts = Object.fromEntries(
    grantDonations.map((txn) => [txn.project, 0])
  )
  const certsToAmounts = Object.fromEntries(
    certTradesToCreator.map((txn) => [txn.project, 0])
  )
  grantDonations.forEach((txn) => {
    grantsToAmounts[txn.project as string] += txn.amount
  })
  certTradesToCreator.forEach((txn) => {
    certsToAmounts[txn.project as string] += txn.amount
  })
  certTradesFromCreator.forEach((txn) => {
    certsToAmounts[txn.project as string] -= txn.amount
  })
  const grantSizes = Object.values(grantsToAmounts) as number[]
  const certSizes = Object.values(certsToAmounts) as number[]
  const BUCKETS = [5000, 25000, 100000, 500000]
  const data = BUCKETS.map((threshold, i) => {
    const prevThreshold = i > 0 ? BUCKETS[i - 1] : 0
    return {
      bucket: `<$${threshold >= 1000 ? threshold / 1000 + 'K' : threshold}`,
      grants: grantSizes.filter(
        (size) => size >= prevThreshold && size < threshold
      ).length,
      certs: certSizes.filter(
        (size) => size >= prevThreshold && size < threshold
      ).length,
    }
  })

  const monthlyData = txns
    .filter((txn) => txn.type === 'project donation')
    .reduce((acc: { [key: string]: number }, txn) => {
      const date = new Date(txn.created_at)
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + txn.amount
      return acc
    }, {})

  const monthlyChartData = Object.entries(monthlyData)
    .sort()
    .map(([month, amount]) => ({
      month,
      donations: amount,
    }))

  return (
    <div>
      <Row className="justify-between gap-5 px-5 py-10">
        <Stat
          label="projects funded"
          className="!text-2xl !font-bold sm:!text-3xl"
          value={numProjectsFunded.toString()}
        />
        <Stat
          label="to projects"
          className="!text-2xl !font-bold sm:!text-3xl"
          value={formatMoney(dollarsToProjects)}
        />
        <Stat
          label="through regrantors"
          className="!text-2xl !font-bold sm:!text-3xl"
          value={formatMoney(dollarsThroughRegrantors)}
        />
      </Row>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="h-96 w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="75%">
            <BarChart width={500} height={300} data={data}>
              <XAxis dataKey="bucket" className="text-xs" />
              <YAxis />
              <Legend iconType="circle" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} ${name.replace(/s$/, 's')}`,
                ]}
                labelFormatter={(label) => `Projects ${label}`}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="grants" fill="#ea580c" radius={[5, 5, 0, 0]} />
              <Bar dataKey="certs" fill="#fdba74" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-96 w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="75%">
            <LineChart data={monthlyChartData}>
              <XAxis
                dataKey="month"
                className="text-xs"
                interval={2}
                tickFormatter={(value) => {
                  // Show: "Jan 2024", "Apr", "Jul", "Oct"...
                  const [year, month] = value.split('-')
                  const monthNames = ['Jan', 'Apr', 'Jul', 'Oct']
                  const monthNum = parseInt(month)
                  if (monthNum % 3 === 1) {
                    const monthName = monthNames[Math.floor((monthNum - 1) / 3)]
                    return monthNum === 1 ? `${monthName} ${year}` : monthName
                  }
                  return ''
                }}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="donations"
                name="donations by month"
                stroke="#ea580c"
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${(value / 1000).toFixed(1)}K`,
                ]}
                labelFormatter={(month) => {
                  const [year, monthNum] = month.split('-')
                  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
                  return date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
