import { Col } from '@/components/layout/col'
import Image from 'next/image'
import { AdjustmentsHorizontalIcon, PhoneIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { Row } from '@/components/layout/row'
import { CardlessProject } from '@/components/project-card'
import { FullProject } from '@/db/project'

const FEATURED_PROJECT_SLUGS = [
  'apollo-research-scale-up-interpretability--behavioral-model-evals-research',
  'optimizing-clinical-metagenomics-and-far-uvc-implementation',
  'holly-elmore-organizing-people-for-a-frontier-ai-moratorium',
  'introductory-resources-for-singular-learning-theory',
]

export default async function DonatePage() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const { data: featuredProjects } = await supabase
    .from('projects')
    .select(
      'title, creator, slug, blurb, profiles(*), txns(*), causes(title, slug)'
    )
    .in('slug', FEATURED_PROJECT_SLUGS)
    .throwOnError()
  const sortedFeaturedProjects = FEATURED_PROJECT_SLUGS.map((slug) =>
    featuredProjects?.find((project) => project.slug === slug)
  ).filter((project) => !!project) as FullProject[]
  const regrantorIds = (featuredProjects ?? [])
    .flatMap((project) => project.txns?.map((txn) => txn.from_id) ?? [])
    .filter((id) => !!id)
  const { data: regrantorProfiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', regrantorIds)
    .eq('regranter_status', true)
    .throwOnError()
  return (
    <div>
      <div className="grid w-full grid-cols-1 gap-8 rounded-b-lg bg-gradient-to-r from-orange-500 to-rose-500 p-5 sm:grid-cols-2">
        <Col className="flex flex-col justify-between gap-4 sm:h-full">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Ways to give
          </h1>
          <p className="text-white text-opacity-80">
            Our donation options offer a range of flexibility and control: you
            can choose whichever one feels right given your level of trust in us
            and our regrantors and the amount of time and thought you want to
            put into your giving.
          </p>
          <Row className="mt-5 w-full justify-center gap-5">
            {!user && <SignInButton />}
            <BookCallButton />
          </Row>
        </Col>
        <div className="mx-auto max-w-7xl">
          <Col className="mx-auto max-w-2xl gap-6 text-base leading-7 text-gray-600">
            <div className="relative rounded-lg bg-white px-4 pt-4 pb-6 pl-10">
              <div className="inline font-semibold text-gray-900  ">
                <Image
                  className="absolute left-3 top-5 h-5 w-5 stroke-2 text-orange-600"
                  src="/SolidOrangeManifox.png"
                  alt="Manifox"
                  width={1000}
                  height={1000}
                />
                General regranting
              </div>
              <p className="text-sm text-gray-500">
                This will be used to onboard new regrantors and to raise the
                budgets of regrantors with strong track records. We may use up
                to 5% to cover our operations.
              </p>
            </div>
            <div className="relative rounded-lg bg-white px-4 pt-4 pb-6 pl-10">
              <div className="inline font-semibold text-gray-900">
                <AdjustmentsHorizontalIcon
                  className="absolute left-3 top-5 h-5 w-5 stroke-2 text-orange-500"
                  aria-hidden="true"
                />
                Custom allocation
              </div>
              <div className="text-sm text-gray-500">
                After adding money to your Manifund account, you can distribute
                it among:
                <ul className="ml-5 list-disc">
                  <li>Regrantors</li>
                  <li>Projects</li>
                  <li>Coming soon: cause-specific funds</li>
                </ul>
              </div>
            </div>
          </Col>
        </div>
      </div>
      <div className="p-4">
        <div className="prose mx-auto mt-5 sm:mt-10">
          <h2>Why donate through regranting?</h2>
          <ul>
            <li>
              <strong>
                There are specific regrantors you would trust to donate on your
                behalf.
              </strong>{' '}
              That is, there are experts in the areas you support who you think,
              relative to you, have a comparative advantage giving your money to
              the best projects in that area. These people don&apos;t
              necessarily need to be on our site already; if you have someone in
              mind you&apos;d like to sponsor, book a call and we can talk
              through facilitating that!
            </li>
            <li>
              <strong>You value transparency.</strong> When you give through
              Manifund, you&apos;ll be able to see where your money goes and
              why.
            </li>
            <li>
              <strong>You believe in other benefits of our approach.</strong> We
              think that the speed, transparency, and experimentation aspects of
              our approach have big positive externalities for our grantees and
              for philanthropy at large. When projects get funded faster, they
              can start sooner. By being transparent, we provide information to
              everyone about what grantmakers look for, help build grantmaker
              trackrecords, keep ourselves accountable to public opinion, and
              put pressure on other funders to be more transparent. By
              experimenting with alternative mechanisms, we have the potential
              to find better approaches to non-profit funding that could be
              applied elsewhere.
            </li>
          </ul>
          <h2>Why not donate through regranting?</h2>
          You might not want to donate through regranting if you have strong
          takes on which projects within the cause area you care most about are
          the highest impact, and want to devote your own time to evaluating
          projects and charities yourself. In that case, you might think
          outsourcing your donation decisions to a regrantor would result in the
          money going to less impactful projects than if you distributed it
          personally.
        </div>
        <div className="prose mx-auto mt-10">
          <h2>Some of our past grants</h2>
        </div>
        <ul className="mx-auto mt-5 max-w-xl divide-y divide-gray-200">
          {sortedFeaturedProjects.map((project) => (
            <li key={project.title} className="py-3">
              <CardlessProject
                key={project.slug}
                project={project}
                regrantors={
                  regrantorProfiles?.filter((regrantor) =>
                    project.txns.find((txn) => txn.from_id === regrantor.id)
                  ) ?? []
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function BookCallButton() {
  return (
    <a
      className="group flex w-fit items-center gap-1 rounded-lg bg-white p-2 pr-3 text-white ring-2 ring-white hover:bg-transparent"
      href="https://calendly.com/rachel-weinberg/manifund-1-1s"
      target="_blank"
    >
      <PhoneIcon className="h-4 w-4 text-orange-500 group-hover:animate-[wiggle_0.12s_cubic-bezier(0.99,0,0.99,3.0)_infinite] group-hover:text-white" />
      <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold text-transparent group-hover:text-white">
        Book a call!
      </span>
    </a>
  )
}

function SignInButton() {
  return (
    <Link
      className="group flex w-fit items-center gap-1 rounded-lg p-2 text-white ring-2 ring-white hover:bg-white"
      href="/login"
    >
      <span className="from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold group-hover:bg-gradient-to-r group-hover:text-transparent">
        Sign in to donate
      </span>
    </Link>
  )
}
