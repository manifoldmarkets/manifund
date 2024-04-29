import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from '@heroicons/react/20/solid'
import {
  ArrowLongRightIcon,
  BeakerIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/layout/card'
import { MegaphoneIcon } from '@heroicons/react/24/outline'
import { Suspense } from 'react'
import Loading from '../loading'
import { StatsServerComponent } from './stats-sc'
import { SiteLink } from '@/components/site-link'

const APPROACH_FEATURES = [
  {
    title: 'Transparent',
    icon: EyeIcon,
    description: (
      <p>
        Everything about Manifund is public: our grant proposals, evals, and
        finances. Even our{' '}
        <SiteLink
          followsLinkClass
          className="font-semibold"
          href="https://github.com/manifoldmarkets/manifund"
        >
          source code
        </SiteLink>{' '}
        and{' '}
        <SiteLink
          followsLinkClass
          className="font-semibold"
          href="https://manifoldmarkets.notion.site/c99d2ce9dfd3419090818122c0b4d540?v=d96610d8da914f46b6c42d2d2a4395d5&pvs=4"
        >
          meeting notes
        </SiteLink>
        !
      </p>
    ),
  },
  {
    title: 'Fast',
    icon: BoltIcon,
    description:
      "We turn around grants in days instead of weeks, and automate flows with software, so money can move where it's needed — quickly.",
  },
  {
    title: 'Experimental',
    icon: BeakerIcon,
    description:
      "We bet on unproven people, speculative projects, and weird funding mechanisms. Not everything works, and that's okay!",
  },
  {
    title: 'Collaborative',
    icon: UserGroupIcon,
    description:
      "We're good at building websites, but we don't know everything — so we ask domain experts (and people like you!) to help decide what to fund.",
  },
]

// TODO: our partners (logos)
// TODO: testimonials

const FUNDING_MECHANISMS = [
  {
    title: 'Regranting',
    icon: <ArrowPathIcon className="h-6 w-6 stroke-2 text-white" />,
    description:
      'We delegate grant budgets to regrantors who are experts in their fields, and let donors choose which regrantors best align with their interests.',
    href: '/about/regranting',
  },
  {
    title: 'Impact markets',
    icon: <ArrowTrendingUpIcon className="h-6 w-6 stroke-2 text-white" />,
    description:
      'We run funding rounds where funders can invest in projects vying for charitable prizes — similarly to a venture-capital ecosystem.',
    href: '/about/impact-certificates',
  },
  {
    title: 'Open call',
    icon: <MegaphoneIcon className="h-6 w-6 stroke-2 text-white" />,
    description:
      'We let anyone propose a charitable project and look for funders on our site, acting as Kickstarter for nonprofits.',
    href: '/about/open-call',
  },
]

const TEAM_MEMBERS = [
  {
    name: 'Austin Chen',
    title: 'Cofounder, CEO',
    avatarUrl:
      'https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/10bd8a14-4002-47ff-af4a-92b227423a74/avatar',
    username: 'Austin',
  },
  {
    name: 'Rachel Weinberg',
    title: 'Cofounder, Engineer',
    avatarUrl:
      'https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/4de2634d-3802-4141-881e-9ce687f87485/8271a711-1159-0a97-6620-bd082b6ebc3b',
    username: 'Rachel',
  },
  {
    name: 'Saul Munn',
    title: 'Strategy & Ops',
    avatarUrl:
      'https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/afc2bd64-9df3-4706-b5d8-752c5681283e/bcd39763-0107-14de-68ca-a79b0bf0f54a',
    username: 'saulmunn',
  },
]

export default function AboutPage() {
  return (
    <>
      <Col className="w-full gap-10 rounded-b-lg bg-gradient-to-r from-orange-500 to-rose-500 p-5 sm:p-10">
        <h1 className="text-center font-semibold text-white">
          We write code and run programs to fund impactful projects.
        </h1>
        <h2 className="text-center text-4xl font-bold text-white">
          Our approach is...
        </h2>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2">
            {APPROACH_FEATURES.map((feature) => {
              return (
                <Card
                  key={feature.title}
                  className="relative px-4 pb-6 pl-10 pt-4"
                >
                  <div className="inline font-semibold text-gray-900">
                    <feature.icon
                      className="absolute left-3 top-5 h-5 w-5 stroke-2 text-orange-600"
                      aria-hidden="true"
                    />
                    {feature.title}
                  </div>{' '}
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
        <Link
          href="/about/donate"
          className="w-full text-right text-sm font-semibold text-white"
        >
          Donate to Manifund
          <ArrowLongRightIcon className="ml-1 inline h-6 w-6 stroke-2" />
        </Link>
      </Col>
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error Server Components */}
        <StatsServerComponent />
      </Suspense>
      <Col className="w-full gap-10 px-5 py-5 sm:px-10">
        <h1 className="text-center text-3xl font-bold">How we fund projects</h1>
        {FUNDING_MECHANISMS.map((mechanism, index) => {
          return (
            <FundingMechanism
              key={mechanism.title}
              {...mechanism}
              leftAligned={index === 1}
            />
          )
        })}
        <Image
          src="/ManifundProcessHorizontal.png"
          alt="Manifund funding process diagram"
          className="mx-auto hidden sm:block"
          height={1000}
          width={1000}
        />
        <Image
          src="/ManifundProcessVertical.png"
          alt="Manifund funding process diagram"
          className="mx-auto sm:hidden"
          height={1000}
          width={1000}
        />
      </Col>
      <Col className="w-full gap-5 p-5 sm:p-10">
        <h1 className="text-center text-3xl font-bold">Our team</h1>
        <div className="grid grid-cols-2 gap-10">
          {TEAM_MEMBERS.map((person) => (
            <Col key={person.name} className="items-center gap-3">
              <Avatar
                avatarUrl={person.avatarUrl}
                username={person.username}
                id=""
                size={36}
                className="hidden shadow-md sm:block"
              />
              <Avatar
                avatarUrl={person.avatarUrl}
                username={person.username}
                id=""
                size={24}
                className="shadow-md sm:hidden"
              />
              <Link href={`/${person.username}`} className="">
                <h1 className="mb-2 text-center font-semibold text-gray-900 sm:text-lg">
                  {person.name}
                </h1>
                <h2 className="text-center text-sm text-gray-600 sm:text-base">
                  {person.title}
                </h2>
              </Link>
            </Col>
          ))}
        </div>
      </Col>
    </>
  )
}

function FundingMechanism(props: {
  title: string
  description: string
  href: string
  icon: JSX.Element
  leftAligned?: boolean
}) {
  const { title, description, href, icon, leftAligned } = props
  return (
    <Link className="group" href={href}>
      <Row
        className={clsx(
          'mb-2 justify-between',
          leftAligned && 'flex-row-reverse'
        )}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="rounded-lg bg-orange-600 p-2">{icon}</div>
      </Row>
      <p className="text-gray-600">{description}</p>
      <div className="w-full text-right font-semibold text-orange-600 group-hover:underline">
        Learn more
        <ArrowLongRightIcon className="ml-1 inline h-6 w-6 stroke-2" />
      </div>
    </Link>
  )
}

function FundingProcessDiagram() {
  return (
    <Row className="items-center gap-5">
      <Col className="gap-5">
        <Step title="Grant applicant posts project" />
        <Step title="Regrantor posts project" />
      </Col>
      <ArrowLongRightIcon className="ml-1 inline h-6 w-6 stroke-2" />
      <Stage title="Proposal" />
    </Row>
  )
}

function Step(props: { title: string; description?: string }) {
  const { title, description } = props
  return (
    <div className="rounded-md bg-white p-3 shadow ring-2 ring-orange-600">
      <h1 className="text-gray-900">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Stage(props: { title: string; description?: string }) {
  const { title, description } = props
  return (
    <div className="rounded-md bg-orange-600 p-5 text-white shadow">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-200">{description}</p>
    </div>
  )
}
