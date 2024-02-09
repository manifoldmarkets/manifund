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
  const data = [
    {
      bucket: '<$5K',
      'number of grants': grantSizes.filter((grantSize) => grantSize < 5000)
        .length,
      'number of certs': certSizes.filter((certSize) => certSize < 5000).length,
    },
    {
      bucket: '<$25K',
      'number of grants': grantSizes.filter(
        (grantSize) => grantSize >= 5000 && grantSize < 25000
      ).length,
      'number of certs': certSizes.filter(
        (certSize) => certSize >= 5000 && certSize < 25000
      ).length,
    },
    {
      bucket: '<$100K',
      'number of grants': grantSizes.filter(
        (grantSize) => grantSize >= 25000 && grantSize < 100000
      ).length,
      'number of certs': certSizes.filter(
        (certSize) => certSize >= 25000 && certSize < 100000
      ).length,
    },
    {
      bucket: '<$500K',
      'number of grants': grantSizes.filter(
        (grantSize) => grantSize >= 100000 && grantSize < 500000
      ).length,
      'number of certs': certSizes.filter(
        (certSize) => certSize >= 100000 && certSize < 400000
      ).length,
    },
  ]
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
      <div className="mx-auto h-96 w-full max-w-xl">
        <ResponsiveContainer width="100%" height="75%">
          <BarChart width={500} height={300} data={data}>
            <XAxis dataKey="bucket" className="text-xs" />
            <YAxis />
            <Legend iconType="circle" />
            <Bar
              dataKey="number of grants"
              fill="#ea580c"
              radius={[5, 5, 0, 0]}
            />
            <Bar
              dataKey="number of certs"
              fill="#fdba74"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
