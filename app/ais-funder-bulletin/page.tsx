import 'server-only'
import Link from 'next/link'
import React from 'react'

export const metadata = {
  title: 'AI Safety Funder Bulletin',
  description: 'A digest of funders in the AI safety space.',
}

const LAST_UPDATED = 'July 27'

const LINK = 'text-orange-600 underline decoration-orange-500 decoration-dotted underline-offset-2'

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={LINK} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  )
}

type Cell = { v: string; n?: number }

type Row = {
  name: string
  href?: string
  donated2025: Cell
  grants2025: Cell
  expected2026: Cell
  fte: string
  generalApps: boolean
  openRfps: boolean
  donations: boolean
}

const AT_A_GLANCE: Row[] = [
  {
    name: 'Coefficient Giving',
    href: 'https://coefficientgiving.org/',
    donated2025: { v: '$300M', n: 1 },
    grants2025: { v: '184', n: 2 },
    expected2026: { v: '$1B', n: 3 },
    fte: '70',
    generalApps: false,
    openRfps: true,
    donations: true,
  },
  {
    name: 'Longview Philanthropy',
    href: 'https://www.longview.org/',
    donated2025: { v: '$60M', n: 4 },
    grants2025: { v: '—' },
    expected2026: { v: '$350M', n: 5 },
    fte: '13',
    generalApps: false,
    openRfps: false,
    donations: true,
  },
  {
    name: 'OpenAI Foundation',
    href: 'https://openaifoundation.org/',
    donated2025: { v: '$0' },
    grants2025: { v: '0' },
    expected2026: { v: '$250M', n: 6 },
    fte: '2',
    generalApps: false,
    openRfps: false,
    donations: false,
  },
  {
    name: 'Macroscopic',
    href: 'https://macroscopic.org/',
    donated2025: { v: '$30M', n: 7 },
    grants2025: { v: '—' },
    expected2026: { v: '$100M', n: 8 },
    fte: '8',
    generalApps: false,
    openRfps: false,
    donations: false,
  },
  {
    name: 'SFF',
    href: 'https://survivalandflourishing.fund/',
    donated2025: { v: '$35M', n: 9 },
    grants2025: { v: '89', n: 10 },
    expected2026: { v: '$30M', n: 11 },
    fte: '8',
    generalApps: true,
    openRfps: false,
    donations: false,
  },
  {
    name: 'Lightcone Commons',
    href: 'https://www.lightconecommons.com/',
    donated2025: { v: '$0' },
    grants2025: { v: '0' },
    expected2026: { v: '$20M' },
    fte: '2',
    generalApps: true,
    openRfps: false,
    donations: true,
  },
  {
    name: 'Schmidt Sciences',
    href: 'https://www.schmidtsciences.org/',
    donated2025: { v: '$10M', n: 12 },
    grants2025: { v: '27', n: 13 },
    expected2026: { v: '$20M', n: 14 },
    fte: '2',
    generalApps: false,
    openRfps: true,
    donations: false,
  },
  {
    name: 'AISTOF',
    donated2025: { v: '—' },
    grants2025: { v: '—' },
    expected2026: { v: '$10M', n: 15 },
    fte: '1',
    generalApps: false,
    openRfps: false,
    donations: false,
  },
  {
    name: 'Manifund',
    href: 'https://manifund.org/',
    donated2025: { v: '$6M', n: 16 },
    grants2025: { v: '234', n: 17 },
    expected2026: { v: '$6M', n: 18 },
    fte: '1',
    generalApps: true,
    openRfps: false,
    donations: true,
  },
  {
    name: 'BlueDot Impact',
    href: 'https://bluedot.org/',
    donated2025: { v: '$0' },
    grants2025: { v: '0' },
    expected2026: { v: '$4M', n: 19 },
    fte: '1',
    generalApps: true,
    openRfps: false,
    donations: false,
  },
  {
    name: 'LTFF',
    href: 'https://funds.effectivealtruism.org/funds/far-future',
    donated2025: { v: '—' },
    grants2025: { v: '—' },
    expected2026: { v: '$3M', n: 20 },
    fte: '1',
    generalApps: true,
    openRfps: false,
    donations: true,
  },
]

// Single source of truth for footnotes: `node` renders in the Notes list, `text`
// is the plain-text version shown in the hover tooltip on each superscript marker.
const NOTES: { node: React.ReactNode; text: string }[] = [
  {
    text: 'coefficientgiving.org/funds/navigating-transformative-ai — Featured Grants table',
    node: (
      <>
        <A href="https://coefficientgiving.org/funds/navigating-transformative-ai">
          https://coefficientgiving.org/funds/navigating-transformative-ai
        </A>{' '}
        Featured Grants table
      </>
    ),
  },
  {
    text: 'coefficientgiving.org/funds/navigating-transformative-ai — Featured Grants table',
    node: (
      <>
        <A href="https://coefficientgiving.org/funds/navigating-transformative-ai">
          https://coefficientgiving.org/funds/navigating-transformative-ai
        </A>{' '}
        Featured Grants table
      </>
    ),
  },
  {
    text: "Per Luke Muehlhauser's post.",
    node: (
      <>
        Per{' '}
        <A href="https://forum.effectivealtruism.org/posts/B6d8Wzk4gNzHsXvdi/ai-safety-is-extremely-bottlenecked-on-grantmakers">
          Luke Muehlhauser&apos;s post
        </A>
        .
      </>
    ),
  },
  {
    text: 'Per this post from a Longview team member, they directed over $60M in 2025, more than 2x their 2024 figure.',
    node: (
      <>
        Per{' '}
        <A href="https://forum.effectivealtruism.org/posts/aX8xLjCLd4LMDpTYL/longview-is-hiring-what-longview-is-like-from-my-perspective">
          this post from a Longview team member
        </A>
        , they directed over $60M in 2025, more than 2x their 2024 figure.
      </>
    ),
  },
  {
    text: "The number on Longview's website went up from $89M as of year-end to $266M as of June, multiplied by 2 for a full-year estimate.",
    node: (
      <>
        The number on{' '}
        <A href="https://www.longview.org/artificial-intelligence/">Longview&apos;s website</A> went
        up from $89M as of year-end to $266M as of June, multiplied by 2 for a full-year estimate.
      </>
    ),
  },
  {
    text: "Estimate: they've announced that they've made $130M in grants so far, and that they're planning to give away $1B across all cause areas in 2026.",
    node: (
      <>
        Estimate: they&apos;ve{' '}
        <A href="https://openaifoundation.org/news/resilience-in-the-age-of-ai">announced</A> that
        they&apos;ve made $130M in grants so far, and that they&apos;re planning to give away $1B
        across all cause areas in 2026.
      </>
    ),
  },
  {
    text: 'forum.effectivealtruism.org/topics/macroscopic-ventures',
    node: (
      <A href="https://forum.effectivealtruism.org/topics/macroscopic-ventures">
        https://forum.effectivealtruism.org/topics/macroscopic-ventures
      </A>
    ),
  },
  {
    text: "Macroscopic's job posting says they are planning to donate $100M this year.",
    node: (
      <>
        <A href="https://jobs.ashbyhq.com/macroscopic/0d80e3a8-2ffd-4bef-8485-03f764732a6e">
          Macroscopic&apos;s job posting
        </A>{' '}
        says they are planning to donate $100M this year.
      </>
    ),
  },
  {
    text: 'survivalandflourishing.fund/2025/recommendations',
    node: (
      <A href="https://survivalandflourishing.fund/2025/recommendations">
        https://survivalandflourishing.fund/2025/recommendations
      </A>
    ),
  },
  {
    text: 'survivalandflourishing.fund/2025/recommendations',
    node: (
      <A href="https://survivalandflourishing.fund/2025/recommendations">
        https://survivalandflourishing.fund/2025/recommendations
      </A>
    ),
  },
  {
    text: "Per SFF's announcement, they are planning to give $20–40M.",
    node: (
      <>
        Per{' '}
        <A href="https://survivalandflourishing.fund/2026/application">SFF&apos;s announcement</A>,
        they are planning to give $20–40M.
      </>
    ),
  },
  {
    text: 'schmidtsciences.org new $10M AI safety science program (foundational research)',
    node: (
      <A href="https://www.schmidtsciences.org/new-10-million-ai-safety-science-program-launched-for-foundational-research/">
        https://www.schmidtsciences.org/new-10-million-ai-safety-science-program-launched-for-foundational-research/
      </A>
    ),
  },
  {
    text: 'schmidtsciences.org new $10M AI safety science program (foundational research)',
    node: (
      <A href="https://www.schmidtsciences.org/new-10-million-ai-safety-science-program-launched-for-foundational-research/">
        https://www.schmidtsciences.org/new-10-million-ai-safety-science-program-launched-for-foundational-research/
      </A>
    ),
  },
  {
    text: 'Estimate: total for previous 2026 RFP not published.',
    node: (
      <>
        Estimate: total for{' '}
        <A href="https://web.archive.org/web/20260222153754/https://www.schmidtsciences.org/opportunity/2026-science-of-trustworthy-ai-rfp/">
          previous 2026 RFP
        </A>{' '}
        not published.
      </>
    ),
  },
  {
    text: '$30M funds raised so far over 3 years; amount deployed not reported.',
    node: <>$30M funds raised so far over 3 years; amount deployed not reported.</>,
  },
  {
    text: 'manifund.org/about',
    node: <A href="https://manifund.org/about">https://manifund.org/about</A>,
  },
  {
    text: 'manifund.org/about',
    node: <A href="https://manifund.org/about">https://manifund.org/about</A>,
  },
  {
    text: 'Around $3M in first half of year.',
    node: <>Around $3M in first half of year.</>,
  },
  {
    text: "According to this LinkedIn post, where they say they're planning to 10x their $400k in grants.",
    node: (
      <>
        According to{' '}
        <A href="https://www.linkedin.com/posts/anglilian_weve-awarded-400k-in-career-transition-activity-7453112364004102145-KSv2/">
          this LinkedIn post
        </A>
        , where they say they&apos;re planning to 10x their $400k in grants.
      </>
    ),
  },
  {
    text: "Past payouts have been higher, but they haven't posted a payout report in a long time, and they are in a transitional period.",
    node: (
      <>
        <A href="https://funds.effectivealtruism.org/funds/far-future">Past payouts</A> have been
        higher, but they haven&apos;t posted a payout report in a long time, and they are in a
        transitional period.
      </>
    ),
  },
]

function Footnote({ n }: { n: number }) {
  return (
    <a
      href={`#note-${n}`}
      title={NOTES[n - 1]?.text}
      className="ml-0.5 align-super text-[0.65em] font-medium text-orange-600 no-underline hover:underline"
    >
      {n}
    </a>
  )
}

function NumCell({ cell }: { cell: Cell }) {
  return (
    <>
      {cell.v}
      {cell.n ? <Footnote n={cell.n} /> : null}
    </>
  )
}

function Check({ on }: { on: boolean }) {
  return on ? <span className="text-orange-600">✓</span> : <span className="text-gray-300">—</span>
}

function AtAGlanceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-gray-500">
            <th className="p-2 font-semibold">Funder name</th>
            <th className="p-2 font-semibold">$ donated in 2025</th>
            <th className="p-2 font-semibold"># grants made in 2025</th>
            <th className="p-2 font-semibold">Expected $ donated in 2026</th>
            <th className="p-2 font-semibold">FTE</th>
            <th className="p-2 text-center font-semibold">General applications</th>
            <th className="p-2 text-center font-semibold">Open RFPs</th>
            <th className="p-2 text-center font-semibold">Accepting donations</th>
          </tr>
        </thead>
        <tbody>
          {AT_A_GLANCE.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 align-top">
              <td className="p-2 font-medium">
                {row.href ? <A href={row.href}>{row.name}</A> : row.name}
              </td>
              <td className="p-2">
                <NumCell cell={row.donated2025} />
              </td>
              <td className="p-2">
                <NumCell cell={row.grants2025} />
              </td>
              <td className="p-2">
                <NumCell cell={row.expected2026} />
              </td>
              <td className="p-2">{row.fte}</td>
              <td className="p-2 text-center">
                <Check on={row.generalApps} />
              </td>
              <td className="p-2 text-center">
                <Check on={row.openRfps} />
              </td>
              <td className="p-2 text-center">
                <Check on={row.donations} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Funder({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-gray-200 py-1">
      <summary className="cursor-pointer list-none py-2 font-semibold text-gray-900 marker:content-none">
        <span className="mr-2 inline-block text-orange-500 transition-transform group-open:rotate-90">
          ▸
        </span>
        {title}
      </summary>
      <div className="prose-sm pb-3 pl-6 text-sm text-gray-600 [&_a]:text-orange-600 [&_li]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </details>
  )
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group mt-12">
      <summary className="flex cursor-pointer list-none items-center text-2xl font-bold text-gray-900 marker:content-none">
        <span className="mr-2 inline-block text-orange-500 transition-transform group-open:rotate-90">
          ▸
        </span>
        {title}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

export default function AisFunderBulletinPage() {
  return (
    <div className="px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-gray-900">
          AI Safety Funder Bulletin
        </h1>
        <p className="mb-6 text-sm text-gray-400">Last updated {LAST_UPDATED}</p>

        <div className="space-y-4 text-gray-600">
          <p>
            This is a digest of funders in the AI safety space. The goal is to give an overview of
            who is funding in the space that includes the most relevant information for people
            seeking funds, looking to donate, or looking to work in grantmaking.
          </p>
          <p>
            These tables are a rough summary of the numbers in the digest and the numbers are often
            best guesses based on public info; more detail is in the writeup and the footnotes. For
            funders that do work in multiple cause areas, it only considers grantmaking and staff
            focused on AIS. Some of the funding may repeat between rows—e.g. Coefficient donating to
            BlueDot or AISTOF making grants through Manifund—but this shouldn&apos;t substantially
            change the big-picture numbers.
          </p>
          <p>
            This is intended to be a living document that updates regularly. If you have any
            corrections, please reach out!
          </p>
        </div>

        <h2 className="mb-4 mt-10 text-2xl font-bold text-gray-900">At a glance</h2>
        <AtAGlanceTable />

        <h2 className="mb-2 mt-12 text-2xl font-bold text-gray-900">Funder profiles</h2>
        <p className="mb-4 text-sm text-gray-500">
          These are roughly sorted by money moved per year.
        </p>

        <div className="rounded-lg border border-gray-200">
          <div className="px-4">
            <Funder title="Coefficient Giving">
              <ul>
                <li>
                  <A href="https://coefficientgiving.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>
                      Previously Open Philanthropy, it grew out of a partnership between GiveWell
                      (founded in 2007 by Holden Karnofsky and Elie Hassenfeld) and Good Ventures
                      (foundation started in 2011 by Cari Tuna and Dustin Moskovitz). They&apos;re
                      mainly funded by Tuna and Moskovitz, but looking to work with more donors.
                    </li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      The biggest funder in the space by far; AI safety is one of a dozen cause
                      areas they make grants in. Grants are usually sourced through their own
                      research rather than applications.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>
                      donations: allocating{' '}
                      <A href="https://forum.effectivealtruism.org/posts/sHF2yjAnNNhxZ56jf/coefficient-giving-is-hiring-grantmakers-and-senior">
                        $1b to catastrophic risks in 2026
                      </A>
                    </li>
                    <li>grant sizes: $10k to $50m</li>
                    <li>
                      number of grants: the Navigating Transformative AI Fund lists 184 in 2025 and
                      46 in 2026
                    </li>
                    <li>
                      staff: ~180 total. ~30/70 staff working on grants seem to be focused on AIS,
                      and I estimated 70 total by amortizing the staff working on operations,
                      communications, and partnerships.
                    </li>
                  </ul>
                </li>
                <li>
                  Recent updates:
                  <ul>
                    <li>
                      They&apos;re hiring for{' '}
                      <A href="https://jobs.ashbyhq.com/coefficientgiving/5496d5b6-d7d2-4390-b577-af6b0c3bf24b">
                        DC-based roles in US AI policy
                      </A>
                      ; applications are due August 2.
                    </li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding:
                      <ul>
                        <li>
                          They have open RFPs for:
                          <ul>
                            <li>
                              <A href="https://coefficientgiving.org/funds/navigating-transformative-ai/funding-for-work-that-builds-capacity-to-address-risks-from-transformative-ai/">
                                capacity-building
                              </A>{' '}
                              (e.g. training and mentorship programs, events, groups, coworking
                              spaces, media, online infrastructure, career advising) — decisions
                              within 3 months
                            </li>
                            <li>
                              <A href="https://coefficientgiving.org/funds/global-catastrophic-risks-opportunities/career-development-and-transition-funding/">
                                career transition funding
                              </A>{' '}
                              (e.g. graduate school, internships, or independent study for building
                              career capacity for people working on reducing global catastrophic
                              risk) — decisions within 6 weeks
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li>
                      Donate: they are recruiting funders giving &gt; $250k/year; reach out to{' '}
                      <A href="mailto:partnerwithus@coefficientgiving.org">
                        partnerwithus@coefficientgiving.org
                      </A>
                    </li>
                    <li>
                      Apply for a job: see roles{' '}
                      <A href="https://coefficientgiving.org/about-us/careers/">here</A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Longview Philanthropy">
              <ul>
                <li>
                  <A href="https://www.longview.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>Founded in 2018 by barrister Natalie Cargill.</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Primarily a donor advisor: they design giving strategies for major
                      philanthropists and move most money via grant recommendations, alongside their
                      own discretionary funds (Frontier AI Fund, Digital Minds Fund).
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>donations: total of $266m to AI risk reduction since 2018</li>
                    <li>staff: ~25 FTE, around half working on AIS gets 13</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: they post periodic RFPs{' '}
                      <A href="https://www.longview.org/grantmaking/#funding-opportunities">here</A>
                      ; otherwise opportunities are sourced via proactive research
                    </li>
                    <li>
                      Donate: <A href="https://www.longview.org/contact/">contact form</A>;
                      they&apos;re interested in donors giving at least $1m/year
                    </li>
                    <li>
                      Apply for a job: no current open roles, but you can express interest{' '}
                      <A href="https://www.longview.org/careers/">here</A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="OpenAI Foundation">
              <ul>
                <li>
                  <A href="https://openaifoundation.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>
                      A nonprofit that owns a large stake in OpenAI, spun off in 2025. Their AI
                      resilience team is run by OpenAI cofounder Wojciech Zaremba.
                    </li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Their cause areas so far are life sciences, economic impact, AI resilience,
                      and supporting communities. Within AI resilience, they&apos;re focused on
                      biosecurity, cybersecurity, AI model safety, and AI&apos;s impact on young
                      people.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>
                      donations:{' '}
                      <A href="https://openaifoundation.org/news/resilience-in-the-age-of-ai">
                        $130m made but not announced yet
                      </A>
                    </li>
                    <li>staff: 2 publicly listed in AI resilience; team is still small</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for a job: they&apos;re hiring for many roles, listed{' '}
                      <A href="https://openaifoundation.org/careers#open-roles">here</A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Macroscopic">
              <ul>
                <li>
                  <A href="https://macroscopic.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>
                      Swiss nonprofit founded by Ruairi Donnelly, Jonas Vollmer, David Althaus, and
                      Daniel Kestenholz in 2019. Formerly Center for Emerging Risk Research and
                      Polaris Ventures.
                    </li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Within AI safety, they&apos;re focused on preventing AI misuse, AI welfare,
                      and cooperation between advanced AI systems. They also donate to reason &amp;
                      democracy and animal welfare and do for-profit investing in their areas of
                      interest.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>donating: up to $100m this year</li>
                    <li>grant sizes: $100k to $15m</li>
                    <li>staff: ~8 FTE</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: you can email{' '}
                      <A href="mailto:info@macroscopic.org">info@macroscopic.org</A>, though most
                      grants are sourced through proactive research and they don&apos;t respond to
                      most proposals
                    </li>
                    <li>
                      Donate: they&apos;re not seeking donations, but they&apos;re happy to advise
                      those donating &gt; $100k
                    </li>
                    <li>
                      Apply for a job: no current open roles, but you can express interest{' '}
                      <A href="https://jobs.ashbyhq.com/macroscopic/0d80e3a8-2ffd-4bef-8485-03f764732a6e">
                        here
                      </A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Survival and Flourishing Fund (SFF)">
              <ul>
                <li>
                  <A href="https://survivalandflourishing.fund/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>Founded in 2019 and funded by Jaan Tallinn.</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      SFF is a virtual fund focused on organizing grant processes to support the
                      long-term survival and flourishing of sentient life. Most grants go to
                      reducing AI x-risk. Jaan Tallinn&apos;s priorities include efforts to restrict
                      AI—datacenter certifications, speed limits, liability laws, labeling
                      requirements, veto committees, and off-switches—as well as constructive
                      efforts to set examples for the positive use of AI—AI assistance for human
                      intelligence, AI healthcare tech, positive moralities, safety specs for AI,
                      and hardware-level AI controls.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>typically deploy around $30-40m across 100 grants in recent years</li>
                    <li>
                      staff: ~7 staff at Survival and Flourishing Corp. Recommendations are done by
                      part-time recommenders.
                    </li>
                  </ul>
                </li>
                <li>
                  Recent updates:
                  <ul>
                    <li>
                      The S-process grant rounds closed in April-July and recommendations will be
                      announced in September-November.
                    </li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding:{' '}
                      <A href="https://survivalandflourishing.fund/speculation-grants">
                        instructions
                      </A>{' '}
                      for applying to a Speculation Grant
                      <ul>
                        <li>
                          Speculation Grants are faster grants of typically up to $400k outside the
                          S-Process timeline.
                        </li>
                        <li>
                          Submitting an application also puts you in consideration for the next
                          S-Process Grant round.
                        </li>
                      </ul>
                    </li>
                    <li>
                      Donate: They don&apos;t appear to be actively soliciting cofunders, but
                      consider reaching out to{' '}
                      <A href="mailto:sff-contact@googlegroups.com">sff-contact@googlegroups.com</A>
                      .
                    </li>
                    <li>
                      Apply for a job: They are currently hiring for a{' '}
                      <A href="https://survivalandflourishing.com/careers/full-stack-engineer">
                        software engineer
                      </A>{' '}
                      role.
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Lightcone Commons">
              <ul>
                <li>
                  <A href="https://www.lightconecommons.com/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>
                      Announced by Oliver Habryka in 2026. Initial funding is coming from Jaan
                      Tallinn, Dustin Moskovitz, LTFF, and others.
                    </li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Lightcone Commons is using the same S-process used by SFF, but aiming to make
                      the application and evaluation processes less time-intensive and run four
                      rounds a year.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>donating around $20m in the first round</li>
                    <li>staff: recommendations done by part-time evaluators</li>
                  </ul>
                </li>
                <li>
                  Recent updates:
                  <ul>
                    <li>
                      Applications for the first round are due by August 23 and recommendations will
                      come out October 23.
                    </li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: <A href="https://www.lightconecommons.com/apply">here</A>
                      <ul>
                        <li>
                          They also import applications from grantmaking.ai, Manifund, and LTFF.
                        </li>
                      </ul>
                    </li>
                    <li>
                      Donate: They are looking to onboard donors giving at least $50k: book an
                      onboarding call{' '}
                      <A href="https://calendly.com/oliver-habryka/lightcone-commons-funder-call">
                        here
                      </A>
                      .
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Schmidt Sciences">
              <ul>
                <li>
                  <A href="https://www.schmidtsciences.org/focus-area-ai/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>Science-focused foundation funded by Eric and Wendy Schmidt.</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      They fund several different areas of science, focused on academic research.
                      Their broader AI portfolio is more focused on beneficial AI in a broad sense
                      and on accelerating AI capabilities, but they also fund research on AI safety.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>
                      donations:{' '}
                      <A href="https://www.schmidtsciences.org/new-10-million-ai-safety-science-program-launched-for-foundational-research/">
                        $10m to AI safety in 2025
                      </A>
                    </li>
                    <li>staff: 13 in AI, but mostly not focused on AI safety, estimate 2 in AIS</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding:
                      <ul>
                        <li>
                          They currently have a{' '}
                          <A href="https://schmidtsciences.smapply.io/prog/scaling_ai_safety_for_a_multi_agent_world/">
                            joint RFP on multi-agent safety
                          </A>{' '}
                          with Google DeepMind, Cooperative AI Foundation, and others with
                          applications due August 8.
                        </li>
                        <li>Otherwise, they don&apos;t accept unsolicited proposals.</li>
                      </ul>
                    </li>
                    <li>
                      Apply for a job: They are hiring for scientists, engineers, and technical
                      advisors in AI <A href="https://www.schmidtsciences.org/careers/">here</A>.
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="AI Safety Tactical Opportunities Fund (AISTOF)">
              <ul>
                <li>
                  Background:
                  <ul>
                    <li>Founded by JueYan Zhang (former BlackRock PM) in 2023</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>A multi-donor fund focused on moving fast to fill time-sensitive gaps.</li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>funds raised: &gt; $30m</li>
                    <li>grants made: &gt; 150 since fall 2023</li>
                    <li>staff: ~1 FTE</li>
                  </ul>
                </li>
                <li>
                  Recent updates:
                  <ul>
                    <li>
                      Grants in the past month:
                      <ul>
                        <li>$150,000 for AI safety workshops for middle schoolers in India</li>
                        <li>$77,000 for Sparse Concept Anchoring</li>
                        <li>$30,000 for a European AI safety conference</li>
                        <li>$6700 for AI nutrition labels</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: there&apos;s no open application, but consider posting a
                      proposal on <A href="https://manifund.org/">Manifund</A>
                    </li>
                    <li>
                      Donate: there&apos;s no formal way to do so, but you could reach out to JueYan
                      on <A href="https://www.linkedin.com/in/jueyan/">LinkedIn</A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Manifund">
              <ul>
                <li>
                  <A href="https://manifund.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>Founded in 2023 by Austin Chen (formerly Manifold Markets).</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Manifund is an open platform where everything is public, grants can be turned
                      around in days, and regrantors make independent calls.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>
                      in 2026 so far:
                      <ul>
                        <li>$3.7m donated</li>
                        <li>~100 projects funded</li>
                      </ul>
                    </li>
                    <li>grant sizes between $0-$500k</li>
                    <li>staff: ~1 FTE</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: make a public project proposal at{' '}
                      <A href="https://manifund.org/">manifund.org</A>
                    </li>
                    <li>
                      Donate: you can donate to projects yourself, or donate to regrantors{' '}
                      <A href="https://manifund.org/about/regranting">here</A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="BlueDot Impact">
              <ul>
                <li>
                  <A href="https://bluedot.org/">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>
                      Founded in 2022 as an AI safety training organization. They started making
                      grants in 2026.
                    </li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      They give fast grants to people and projects working in AI safety, aimed at
                      new projects and individuals.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>donated: $3.8m (2026 YTD)</li>
                    <li>grants made: ~500</li>
                    <li>staff: ~10 FTE, but most not working on grants</li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: they have two grant programs:
                      <ul>
                        <li>
                          <A href="https://bluedot.org/programs/career-transition-grant">
                            Career Transition Grants
                          </A>{' '}
                          for people switching to work full-time on AI safety — application: 45
                          minutes, decision time: 17 days
                        </li>
                        <li>
                          <A href="https://bluedot.org/programs/rapid-grants">Rapid Grants</A>: up
                          to $10k for concrete AI safety projects — application: 5 minutes, decision
                          time: 3 days
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>

            <Funder title="Long-Term Future Fund (LTFF)">
              <ul>
                <li>
                  <A href="https://funds.effectivealtruism.org/funds/far-future">Website</A>
                </li>
                <li>
                  Background:
                  <ul>
                    <li>Started in 2017 as a project of Centre for Effective Altruism.</li>
                  </ul>
                </li>
                <li>
                  Thesis:
                  <ul>
                    <li>
                      Focused on giving small grants of $5k-$200k for individuals, independent
                      researchers, and new projects. They&apos;re currently in a transitional
                      period, so funding may be delayed.
                    </li>
                  </ul>
                </li>
                <li>
                  By the numbers:
                  <ul>
                    <li>donating: historically around $6m/year</li>
                    <li>number of grants: 100-200/year</li>
                    <li>grant size: between $5k-$200k</li>
                    <li>staff: all part-time, ~1 FTE</li>
                  </ul>
                </li>
                <li>
                  Recent updates:
                  <ul>
                    <li>
                      They haven&apos;t posted grant updates since 2024 Q1. As of April 2026, they{' '}
                      <A href="https://forum.effectivealtruism.org/posts/MaAzwX3erHW3rD53B/a-brief-update-on-ea-funds-and-a-recruitment-announcement">
                        announced
                      </A>{' '}
                      that they were in the process of hiring new leadership and were in a
                      transitional period.
                    </li>
                    <li>
                      They are donating $2M to this{' '}
                      <A href="https://www.lightconecommons.com/">Lightcone Commons</A> round.
                    </li>
                  </ul>
                </li>
                <li>
                  Get involved:
                  <ul>
                    <li>
                      Apply for funding: use{' '}
                      <A href="https://av20jp3z.paperform.co/?fund=Long-Term%20Future%20Fund">
                        this form
                      </A>
                    </li>
                    <li>
                      Donate: donate to EA Funds{' '}
                      <A href="https://www.givingwhatwecan.org/funds/effective-altruism-funds">
                        here
                      </A>
                    </li>
                  </ul>
                </li>
              </ul>
            </Funder>
          </div>
        </div>

        <CollapsibleSection title="Not included">
          <ul className="space-y-3 text-sm text-gray-600 [&_a]:text-orange-600">
            <li>
              <A href="https://astralisfoundation.org/">Astralis Foundation</A>: They seem fairly
              new with not a ton of public info. They&apos;re not taking unsolicited funding
              requests. Based on{' '}
              <A href="https://web.archive.org/web/20260121035945/https://effectivealtruism.nz/job-board/ai-governance-fund-lead-astralis-foundation">
                this job posting
              </A>{' '}
              from earlier in the year, they have a fund focused on international AI governance
              aiming to deploy $15m this year.
            </li>
            <li>
              <A href="https://www.navigation.org/">Navigation Fund</A>: Jed McCaleb&apos;s
              foundation. At one point they{' '}
              <A href="https://forum.effectivealtruism.org/posts/NAcN98bACuwcnB32H/the-navigation-fund-launched-is-hiring-a-program-officer-to">
                announced
              </A>{' '}
              they were giving $20m/year to AI safety, but this seems to have not materialized and
              it&apos;s now gone from their website.
            </li>
            <li>
              <A href="https://www.airiskfund.com/">AI Risk Mitigation Fund</A>: They announced a
              spinoff from LTFF in 2023, but haven&apos;t made any updates or grant announcements on
              their website. They&apos;re one of the funders of Lightcone Commons.
            </li>
            <li>
              <A href="https://futureoflife.org/">FLI</A>: They were previously more active in
              grantmaking and still have a PhD fellowship program, but seem to be less focused on
              grantmaking these days.
            </li>
            <li>
              <A href="https://www.frontiermodelforum.org/ai-safety-fund/">
                Frontier Model Forum AI Safety Fund
              </A>
              : It was funded with $10m in 2023. Most of this was distributed in 2024 and 2025 and
              they now appear to be winding down and spending their remaining funds.
            </li>
            <li>
              <A href="https://foresight.org/grants/grants-ai-for-science-safety/">
                Foresight AI for Safety and Science
              </A>
              : They award $3m annually across AI safety &amp; science.
            </li>
            <li>
              <A href="https://astera.org/ai-safety/">Astera</A>: Their webpage mentions that
              they&apos;re primarily backing <A href="https://www.simplexaisafety.com/">Simplex</A>.
            </li>
            <li>
              <A href="http://grantmaking.ai">grantmaking.ai</A>: New initiative housed under
              Manifund, with an initial $1m, see{' '}
              <A href="https://www.lesswrong.com/posts/hDQZZzYkcipgaZfxy/usd1m-ai-x-risk-grant-round-is-live-on-grantmaking-ai-apply">
                launch post
              </A>
              .
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Notes">
          <ol className="list-decimal space-y-2 pl-6 text-sm text-gray-500 [&_a]:break-all [&_a]:text-orange-600">
            {NOTES.map((note, i) => (
              <li key={i} id={`note-${i + 1}`} className="scroll-mt-4 target:text-gray-900">
                {note.node}
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      </div>
    </div>
  )
}
