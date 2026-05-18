'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { Avatar } from '@/components/avatar'

type Grant = {
  id: string
  date: string
  amount: number
  regrantorId: string
  regrantorName: string
  regrantorUsername: string
  regrantorAvatar: string | null
  projectId: string
  projectTitle: string
  projectSlug: string
  projectBlurb: string | null
  projectTotal: number
  comment: string | null
}

type RegrantorRow = {
  id: string
  name: string
  username: string
  avatar: string | null
  bio: string | null
  budget2023: number
  budget2024: number
  budget2025: number
  budget2026: number
}

const YEARS = [2023, 2024, 2025, 2026] as const
type YearKey = (typeof YEARS)[number]
type YearSelection = YearKey | 'all'
const YEAR_OPTIONS: YearSelection[] = ['all', ...YEARS]

const QUARTERS_RANGE: { year: number; quarter: number }[] = []
for (let y = 2023; y <= 2026; y++) {
  for (let q = 1; q <= 4; q++) QUARTERS_RANGE.push({ year: y, quarter: q })
}

function quarterOf(d: Date) {
  return Math.floor(d.getMonth() / 3) + 1
}

function formatDollarsCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

function formatDollarsFull(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function shortDate(iso: string, includeYear = false) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: '2-digit' } : {}),
  })
}

function budgetForYear(r: RegrantorRow, year: YearSelection): number {
  if (year === 'all') {
    return r.budget2023 + r.budget2024 + r.budget2025 + r.budget2026
  }
  return r[`budget${year}` as 'budget2025']
}

function labelForYear(year: YearSelection): string {
  return year === 'all' ? 'all time' : String(year)
}

export function RegrantingLedger({
  grants,
  regrantors,
}: {
  grants: Grant[]
  regrantors: RegrantorRow[]
}) {
  const [year, setYear] = useState<YearSelection>(2026)
  const [activeRegrantor, setActiveRegrantor] = useState<string | null>(null)

  const grantsInYear = useMemo(
    () =>
      year === 'all'
        ? grants
        : grants.filter((g) => new Date(g.date).getFullYear() === year),
    [grants, year]
  )

  const ledgerStats = useMemo(() => {
    const total = grants.reduce((s, g) => s + g.amount, 0)
    const projectIds = new Set(grants.map((g) => g.projectId))
    const regrantorIds = new Set(grants.map((g) => g.regrantorId))
    const sorted = [...grants].map((g) => g.amount).sort((a, b) => a - b)
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
    return {
      total,
      grantsWritten: grants.length,
      projectsBacked: projectIds.size,
      regrantorCount: regrantorIds.size,
      medianGrant: median,
    }
  }, [grants])

  const quarterlyData = useMemo(() => {
    const buckets: Record<string, number> = {}
    for (const g of grants) {
      const d = new Date(g.date)
      const key = `${d.getFullYear()}-Q${quarterOf(d)}`
      buckets[key] = (buckets[key] ?? 0) + g.amount
    }
    const now = new Date()
    const nowYear = now.getFullYear()
    const nowQ = quarterOf(now)
    return QUARTERS_RANGE.filter(
      ({ year: y, quarter: q }) => y < nowYear || (y === nowYear && q <= nowQ)
    ).map(({ year: y, quarter: q }) => {
      const key = `${y}-Q${q}`
      return {
        label: `'${String(y).slice(2)} Q${q}`,
        year: y,
        quarter: q,
        amount: buckets[key] ?? 0,
      }
    })
  }, [grants])

  // Per-regrantor stats for the active year — includes regrantors with either a budget OR grants in this year.
  const regrantorYearRows = useMemo(() => {
    const grantersWithActivity = new Set(grantsInYear.map((g) => g.regrantorId))
    return regrantors
      .filter((r) => budgetForYear(r, year) > 0 || grantersWithActivity.has(r.id))
      .map((r) => {
        const myGrants = grantsInYear.filter((g) => g.regrantorId === r.id)
        const deployed = myGrants.reduce((s, g) => s + g.amount, 0)
        const topGrants = [...myGrants].sort((a, b) => b.amount - a.amount).slice(0, 3)
        return {
          ...r,
          budget: budgetForYear(r, year),
          deployed,
          grantCount: myGrants.length,
          topGrants,
        }
      })
      .sort((a, b) => b.deployed - a.deployed || b.budget - a.budget)
  }, [grantsInYear, regrantors, year])

  const topProjectsInYear = useMemo(() => {
    const seen = new Map<string, { project: Grant; backers: Grant[] }>()
    for (const g of grantsInYear) {
      const entry = seen.get(g.projectId)
      if (entry) {
        entry.backers.push(g)
      } else {
        seen.set(g.projectId, { project: g, backers: [g] })
      }
    }
    return Array.from(seen.values())
      .sort((a, b) => b.project.projectTotal - a.project.projectTotal)
      .slice(0, 8)
  }, [grantsInYear])

  const featuredNotes = useMemo(() => {
    return grantsInYear
      .filter((g) => g.comment && g.comment.length > 120)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [grantsInYear])

  const feedGrants = useMemo(() => {
    const list = grantsInYear.filter(
      (g) => !activeRegrantor || g.regrantorId === activeRegrantor
    )
    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }, [grantsInYear, activeRegrantor])

  const totalDeployedInYear = grantsInYear.reduce((s, g) => s + g.amount, 0)
  const totalBudgetInYear = regrantors.reduce((s, r) => s + budgetForYear(r, year), 0)

  return (
    <div className="mx-auto max-w-4xl p-5">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Regranting data</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Every grant made through Manifund&apos;s regranting program — the experts, the dollars,
          the destinations, and the reasoning, broken down by year and quarter.
        </p>
      </header>

      {/* Top-line stats */}
      <section className="mb-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Total deployed" value={formatDollarsCompact(ledgerStats.total)} accent />
          <StatCard label="Grants written" value={ledgerStats.grantsWritten.toString()} />
          <StatCard label="Projects backed" value={ledgerStats.projectsBacked.toString()} />
          <StatCard label="Regrantors active" value={ledgerStats.regrantorCount.toString()} />
          <StatCard label="Median grant" value={formatDollarsCompact(ledgerStats.medianGrant)} />
        </div>
      </section>

      {/* Quarterly chart */}
      <section className="mb-10">
        <SectionHeading title="Quarterly outlays" subtitle="Dollars deployed per fiscal quarter" />
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quarterlyData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                barCategoryGap={4}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatDollarsCompact(v)}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(234,88,12,0.06)' }}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatDollarsFull(value), 'Deployed']}
                />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                  {quarterlyData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={year === 'all' || d.year === year ? '#ea580c' : '#fdba74'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>Bars highlighted: {labelForYear(year)}</span>
            <span>
              {labelForYear(year)} deployed: {formatDollarsCompact(totalDeployedInYear)}
              {totalBudgetInYear > 0 && (
                <> of {formatDollarsCompact(totalBudgetInYear)} budget</>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Year switcher */}
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          Showing data for <span className="text-orange-600">{labelForYear(year)}</span>
        </h2>
        <div className="flex flex-wrap gap-1">
          {YEAR_OPTIONS.map((y) => (
            <button
              key={y}
              onClick={() => {
                setYear(y)
                setActiveRegrantor(null)
              }}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                y === year
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              {y === 'all' ? 'All' : y}
            </button>
          ))}
        </div>
      </section>

      {/* Regrantor activity */}
      <section className="mb-10">
        <SectionHeading
          title="Regrantor activity"
          subtitle={`Click a regrantor to filter the grant index below`}
        />
        <div className="space-y-3">
          {regrantorYearRows.map((row) => {
            const pct = row.budget > 0 ? Math.min(100, (row.deployed / row.budget) * 100) : 0
            const isActive = activeRegrantor === row.id
            return (
              <div
                key={row.id}
                className={clsx(
                  'overflow-hidden rounded-lg border bg-white shadow-sm transition-colors',
                  isActive ? 'border-orange-400 ring-1 ring-orange-300' : 'border-gray-200'
                )}
              >
                <button
                  onClick={() =>
                    setActiveRegrantor((curr) => (curr === row.id ? null : row.id))
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 sm:gap-4"
                >
                  <Avatar
                    username={row.username}
                    avatarUrl={row.avatar}
                    id={row.id}
                    noLink
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-gray-900">
                      {row.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {row.budget > 0 ? (
                        <>
                          {formatDollarsCompact(row.budget)} budget · {row.grantCount} grant
                          {row.grantCount === 1 ? '' : 's'}
                        </>
                      ) : (
                        <>
                          {row.grantCount} grant{row.grantCount === 1 ? '' : 's'} in{' '}
                          {labelForYear(year)}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden flex-shrink-0 text-right sm:block">
                    <div className="text-sm font-semibold tabular-nums text-orange-600">
                      {formatDollarsCompact(row.deployed)}
                    </div>
                    <div className="text-xs text-gray-500">deployed</div>
                  </div>
                  {row.budget > 0 && (
                    <div className="ml-2 hidden w-32 flex-shrink-0 sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-1 text-right text-[11px] text-gray-500">
                        {pct.toFixed(0)}% deployed
                      </div>
                    </div>
                  )}
                </button>

                {row.topGrants.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      Top grant{row.topGrants.length === 1 ? '' : 's'} in {labelForYear(year)}
                    </div>
                    <ol className="space-y-1.5">
                      {row.topGrants.map((g) => (
                        <li key={g.id}>
                          <Link
                            href={`/projects/${g.projectSlug}`}
                            className="group flex items-baseline gap-3 text-sm text-gray-800"
                          >
                            <span className="w-14 flex-shrink-0 text-right font-semibold tabular-nums text-orange-600">
                              {formatDollarsCompact(g.amount)}
                            </span>
                            <span className="flex-1 group-hover:underline">{g.projectTitle}</span>
                            <span className="hidden text-xs text-gray-400 sm:inline">
                              {shortDate(g.date, year === 'all')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )
          })}
          {regrantorYearRows.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
              No regrantor activity in {labelForYear(year)}.
            </div>
          )}
        </div>
      </section>

      {/* Top projects backed */}
      <section className="mb-10">
        <SectionHeading
          title="Largest projects backed"
          subtitle={`Top projects funded ${
            year === 'all' ? 'across all years' : `in ${year}`
          }, ranked by total dollars raised`}
        />
        <ol className="space-y-3">
          {topProjectsInYear.map((entry) => (
            <li
              key={entry.project.projectId}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/projects/${entry.project.projectSlug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-orange-600 hover:underline sm:text-xl"
                  >
                    {entry.project.projectTitle}
                  </Link>
                  {entry.project.projectBlurb && (
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      {entry.project.projectBlurb}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 sm:text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatDollarsCompact(entry.project.projectTotal)}
                  </div>
                  <div className="text-xs text-gray-500">total raised</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {entry.backers.length} regrantor{entry.backers.length === 1 ? '' : 's'} ·{' '}
                    {formatDollarsCompact(entry.backers.reduce((s, b) => s + b.amount, 0))}
                  </div>
                </div>
              </div>

              {/* Backers + comments */}
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
                {entry.backers
                  .sort((a, b) => b.amount - a.amount)
                  .map((b) => (
                    <div key={b.id} className="flex items-start gap-3">
                      <Avatar
                        username={b.regrantorUsername}
                        avatarUrl={b.regrantorAvatar}
                        id={b.regrantorId}
                        noLink
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <Link
                            href={`/${b.regrantorUsername}`}
                            className="truncate text-sm font-semibold text-gray-900 hover:underline"
                          >
                            {b.regrantorName}
                          </Link>
                          <span className="text-sm font-semibold tabular-nums text-orange-600">
                            {formatDollarsCompact(b.amount)}
                          </span>
                        </div>
                        {b.comment && (
                          <p className="mt-1 line-clamp-3 text-xs leading-snug text-gray-600">
                            “{b.comment.slice(0, 240)}
                            {b.comment.length > 240 ? '…' : ''}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </li>
          ))}
          {topProjectsInYear.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
              No regrantor-backed projects in {labelForYear(year)} yet.
            </div>
          )}
        </ol>
      </section>

      {/* Featured notes */}
      {featuredNotes.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            title="From the regrantors"
            subtitle={
              year === 'all'
                ? 'Selected notes accompanying notable grants'
                : `Selected notes accompanying ${year} grants`
            }
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {featuredNotes.map((g) => (
              <figure
                key={g.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <blockquote className="text-sm leading-relaxed text-gray-700">
                  “{g.comment!.length > 420 ? g.comment!.slice(0, 420) + '…' : g.comment}”
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
                  <Avatar
                    username={g.regrantorUsername}
                    avatarUrl={g.regrantorAvatar}
                    id={g.regrantorId}
                    noLink
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${g.regrantorUsername}`}
                      className="block truncate text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {g.regrantorName}
                    </Link>
                    <Link
                      href={`/projects/${g.projectSlug}`}
                      className="block truncate text-xs text-gray-500 hover:text-gray-700"
                    >
                      ↳ {g.projectTitle}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-orange-600">
                      {formatDollarsCompact(g.amount)}
                    </div>
                    <div className="text-[11px] text-gray-400">{shortDate(g.date, year === 'all')}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Grant index */}
      <section className="mb-10">
        <SectionHeading
          title="Grant index"
          subtitle={`All ${feedGrants.length} grants${
            activeRegrantor
              ? ` from ${regrantors.find((r) => r.id === activeRegrantor)?.name}`
              : ''
          }${year === 'all' ? ' across all years' : ` in ${year}`}, most recent first`}
        />
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="hidden grid-cols-12 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:grid">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Regrantor</div>
            <div className="col-span-5">Project</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {feedGrants.map((g) => (
            <div
              key={g.id}
              className="grid grid-cols-12 items-center gap-y-1 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50"
            >
              <div className="col-span-12 text-xs text-gray-500 sm:col-span-2">
                {shortDate(g.date, year === 'all')}
              </div>
              <Link
                href={`/${g.regrantorUsername}`}
                className="col-span-6 truncate font-semibold text-gray-900 hover:underline sm:col-span-3"
              >
                {g.regrantorName}
              </Link>
              <Link
                href={`/projects/${g.projectSlug}`}
                className="col-span-6 truncate text-gray-700 hover:underline sm:col-span-5"
              >
                {g.projectTitle}
              </Link>
              <div className="col-span-12 text-right font-semibold tabular-nums text-orange-600 sm:col-span-2">
                {formatDollarsCompact(g.amount)}
              </div>
            </div>
          ))}
          {feedGrants.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No grants recorded.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={clsx(
          'font-bold tabular-nums',
          accent ? 'text-3xl text-orange-600 sm:text-4xl' : 'text-2xl text-gray-900 sm:text-3xl'
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}
