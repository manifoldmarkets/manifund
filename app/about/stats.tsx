'use client'
import { FullTxn } from '@/db/txn'
import React, { PureComponent } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export function GrantSizeDistribution(props: { txns: FullTxn[] }) {
  const { txns } = props
  const usdTxnsToProjects = txns.filter(
    (txn) =>
      txn.token === 'USD' &&
      txn.project !== null &&
      txn.projects?.type === 'grant'
  )
  const projectsAndAmounts = Object.fromEntries(
    usdTxnsToProjects.map((txn) => [txn.project, 0])
  )
  usdTxnsToProjects.forEach((txn) => {
    projectsAndAmounts[txn.project as string] += txn.amount
  })
  const grantSizes = Object.values(projectsAndAmounts) as number[]
  const data = [
    {
      bucket: '<5K',
      'number of projects': grantSizes.filter((grantSize) => grantSize < 5000)
        .length,
    },
    {
      bucket: '<25K',
      'number of projects': grantSizes.filter(
        (grantSize) => grantSize >= 5000 && grantSize < 25000
      ).length,
    },
    {
      bucket: '<100K',
      'number of projects': grantSizes.filter(
        (grantSize) => grantSize >= 25000 && grantSize < 100000
      ).length,
    },
    {
      bucket: '<400K',
      'number of projects': grantSizes.filter(
        (grantSize) => grantSize >= 100000 && grantSize < 400000
      ).length,
    },
  ]
  console.log('data', data)
  return (
    <div className="mx-auto h-96 w-full max-w-xl">
      <h1 className="mb-5 text-center text-xl font-semibold text-gray-900">
        Distribution of grant sizes
      </h1>
      <ResponsiveContainer width="100%" height="75%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 0,
            right: 0,
            left: -30,
            bottom: 5,
          }}
        >
          <XAxis dataKey="bucket" className="text-xs" />
          <YAxis />
          <Bar dataKey="number of projects" fill="#ea580c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
