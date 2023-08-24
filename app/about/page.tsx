import { FeatureCard } from '@/components/feature-card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { CardlessProfile } from '@/components/profile-card'
import { getTeamProfiles } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  EyeIcon,
} from '@heroicons/react/20/solid'
import {
  ArrowLongRightIcon,
  BeakerIcon,
  BoltIcon,
} from '@heroicons/react/24/solid'
import { AuctionPlayground } from './auction-playground'

const APROACH_FEATURES = [
  {
    title: 'Transparent',
    icon: EyeIcon,
    description:
      'We publish all grant proposals, decision rationales, and bookkeeping to facilitate public discourse and accountability.',
  },
  {
    title: 'Fast',
    icon: BoltIcon,
    description:
      "We prioritize fast turnaround times for grants and use software automations where we can so money can move where it's needed quickly.",
  },
  {
    title: 'Experimental',
    icon: BeakerIcon,
    description:
      'Oftentimes the best way to see if something will work is to try it out, so we are willing to give people and approaches a shot and then learn and iterate.',
  },
  {
    title: 'Expert led',
    icon: CheckBadgeIcon,
    description:
      'We leverage the knowledge and networks of domain experts and see our role as providing the infrastructure and operational support to make their work easier.',
  },
]

const FUNDING_MECHANISMS = [
  {
    title: 'Regranting',
    icon: ArrowPathIcon,
    description:
      'Our regranting program puts grantmaking decisions in the hands of domain experts, and allows donors to outsource their donation decisions to experts of their choice.',
  },
  {
    title: 'Impact certificates',
    icon: ArrowTrendingUpIcon,
    description:
      'In the past, we ran two funding rounds using impact certificates, which work like VC-funding, but for non-profits!',
  },
]

export default async function AboutPage() {
  const supabase = createServerClient()
  const teamProfiles = await getTeamProfiles(supabase)
  return (
    <>
      <Col className="w-full gap-10 rounded-b bg-orange-100 p-5 sm:p-10">
        <h1 className="text-center font-semibold">
          We design software and organize programs that fund impactful projects.
        </h1>
        <h2 className="text-center text-4xl font-bold">Our approach is...</h2>
        <div className="mx-auto max-w-7xl">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2">
            {APROACH_FEATURES.map((feature) => {
              return (
                <div key={feature.title} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                      className="absolute left-1 top-1 h-5 w-5 stroke-2 text-orange-600"
                      aria-hidden="true"
                    />
                    {feature.title}
                  </dt>{' '}
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              )
            })}
          </dl>
        </div>
      </Col>
      <Col className="w-full gap-10 px-5 py-20 sm:px-10">
        <h1 className="text-center text-3xl font-bold">
          Funding mechanisms we support
        </h1>
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          {FUNDING_MECHANISMS.map((mechanism, index) => {
            return (
              <FeatureCard
                key={mechanism.title}
                icon={<mechanism.icon className="h-7 w-7" />}
                title={mechanism.title}
                description={mechanism.description}
                url="/about#regranting"
              />
            )
          })}
        </div>
      </Col>
      <Col className="w-full gap-5 rounded bg-orange-100 p-5 sm:p-10">
        <h1 className="text-center text-3xl font-bold">The team</h1>
        <div className="grid grid-cols-2 gap-20">
          {teamProfiles.map((profile) => (
            <CardlessProfile key={profile.id} profile={profile} />
          ))}
        </div>
      </Col>
      <div className="prose mx-auto font-light">
        <h1 className="relative top-5">Our mission</h1>
        <p>
          Manifund builds funding infrastructure for nonprofits, primarily for
          effective altruism and longtermist causes. We provide:
        </p>
        <ul>
          <li>
            a clean user experience to grantmakers, donors, and recipients so
            money moves where it’s needed, <em>quickly</em>;
          </li>
          <li>
            open grant proposals, decision rationales, and bookkeeping for
            public accountability and tight feedback loops; and
          </li>
          <li>
            innovative funding mechanisms that align incentives with impact.
          </li>
        </ul>
        <p>
          We currently support two funding mechanisms:{' '}
          <strong>regranting</strong> and <strong>impact certificates</strong>.
        </p>

        <h1 className="relative top-5" id="regranting">
          Regranting
        </h1>
        <p>
          Regranting is a method of giving money whereby a charitable donor
          delegates a grantmaking budget to different individuals known as
          “regrantors”. Regrantors are then empowered to make grant decisions
          based on the objectives of the original donor.
        </p>
        <p>
          This model was pioneered by the FTX Future Fund; among the grantmaking
          models they experimented with in 2022, they{' '}
          <a href="https://forum.effectivealtruism.org/posts/paMYXYFYbbjpdjgbt/future-fund-june-2022-update#Expectations_vs__reality">
            considered regranting to be the most promising.
          </a>
        </p>
        <h3>Why regranting?</h3>
        <ul>
          <li>
            Regranting surfaces opportunities that a donor might otherwise miss,
            as regrantors can tap into their personal networks and fields of
            expertise.
          </li>
          <li>
            The regranting model requires less overhead than traditional
            grantmaking, as one person is responsible for the budget rather than
            a committee. This also allows for faster grant turnaround times,
            solving a key pain point for grantees.
          </li>
          <li>
            Certain cause areas like longtermism can be speculative, opaque, and
            nascent, making it harder for donors to know where to direct their
            money. Regranting allows donors to outsource these decisions to
            trustworthy individuals.
          </li>
        </ul>
        <h3>How does regranting on Manifund work?</h3>
        <p>Our website makes the regranting process simple and transparent:</p>
        <ol>
          <li>
            A donor contributes money to Manifold for Charity, a registered
            501c3 nonprofit.
          </li>
          <li>
            The donor then allocates the money between regrantors of their
            choice.
          </li>
          <li>
            Regrantors choose which opportunities (eg existing charities, new
            projects, or individuals) to spend their budgets on, writing up an
            explanation for each grant made.
          </li>
          <li>
            Manifold for Charity reviews the grant to make sure it is
            legitimate, legal, and aligned with our mission, and then wires the
            money and publishes the grant writeups.
          </li>
        </ol>
        <h3>Kickoff: Longtermist Round 1</h3>
        <p>
          On launch, there will be ~15 sponsored regrantors, each with a
          regranting budget of $50k-$400k to distribute to projects or charities
          that they believe will most improve the long-term future. These
          regrants are backed by an anonymous donor’s contribution of $1.5
          million, as well as smaller grants from EA orgs. Longtermist Round 1
          will end after this pool is spent, or after 6 months have passed.
        </p>
        <h3>FAQ</h3>
        <strong>Who can see the information about grants?</strong>
        <br />
        <p>
          Currently all grant information is made public. This includes the
          identity of the regrantor and grant recipient, the project
          description, the grant size, and the regrantor’s writeup.
        </p>
        <p>
          We strongly believe in transparency as it allows for meaningful public
          feedback, accountability of decisions, and establishment of a
          regrantor track records. We recognize that not all grants are suited
          for publishing; for now, we recommend such grants be made through
          other donors (such as LTFF, SFF, or OpenPhil).
        </p>
        <p>
          If after some time we receive feedback from regranters or recipients
          that this is significantly restricting their behavior or causing
          friction, we may add a semi-private or private option.
        </p>
        <strong>What kinds of projects are eligible for regranting?</strong>
        <br />
        <p>
          We support regrants to registered charities and individuals.
          For-profit organizations may also be eligible, pending due diligence.
          As a US-registered 501c3, we do not permit donations to political
          campaigns.
        </p>
        <p>
          We will look over all grants before fulfilling withdrawal requests to
          make sure they meet these requirements. We reserve the right to veto
          grants for any reason, though will strongly defer to regrantors’
          judgement.
        </p>
        <strong>Can regrantors send money to themselves?</strong>
        <br />
        <p>
          Regrantors are allowed to donate to their own projects, though we’ll
          evaluate these projects with more scrutiny before fulfilling
          withdrawal requests.
        </p>
        <strong>How do I become a regrantor?</strong>
        <p>
          Apply{' '}
          <a
            className="font-bold hover:underline"
            href="https://airtable.com/appOfJtzt8yUTBFcD/shrZW7S069EmghCSV"
          >
            here
          </a>
          ! We&apos;ll offer some regrantors budgets, and others we&apos;ll just
          list as regrantors so they can recieve donations from other users.
        </p>
        <p>
          Manifund will reach out personally to individuals we want to sponsor
          as regrantors.
        </p>
        <h1 className="relative top-5" id="impact-certificates">
          Impact certificates
        </h1>
        <p>
          One way to give or receive funding for projects on Manifund is through{' '}
          <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
            impact certificates
          </a>
          . The impact certificate ecosystem is like Kickstarter meets the stock
          market, for charity!
        </p>
        <h3 id="how-does-manifund-work-">
          How do impact certificates work on Manifund?
        </h3>
        <ul>
          <li>
            Founders create a proposal for a charitable project, with a minimum
            funding goal.
          </li>
          <li>
            Accredited investors initially offer to fund the proposed project
            through an auction. At a predetermined date, the auction will
            resolve: if the total amount bid meets the minimum funding goal, the
            project will be funded and top bidders by valuation will recieve
            shares in the project in exchange for money. Otherwise, the project
            will not be funded.
          </li>
          <li>
            If the project is funded, accredited investors may continue to trade
            shares in the active project, buying and selling based on how the
            projects are performing.
          </li>
          <li>
            After the project is complete, altruistic individuals or
            organizations can offer to buy up these shares in recognition of
            successful impact by the project.
          </li>
        </ul>
        <h3 id="an-example-of-manifund-in-action">
          An example of Manifund impact certificates in action
        </h3>
        <ol>
          <li>
            A research team proposes a project to develop a forecasting model to
            prevent pandemics. They ask for $5,000 to work on this project.
          </li>
          <li>
            Investor Ivan offers to buy $3,000 of impact certs at a $6,000
            valuation; other investors contribute the rest, and the project is
            successfully funded at this higher valuation.
          </li>
          <li>
            3 months later, the forecasting model proves to be effective in
            predicting the trajectory of an upcoming pandemic and helping
            hospitals take action.
          </li>
          <li>
            The Good Foundation values the project at $18,000 of impact,
            offering to buy up all of the outstanding certs.
          </li>
          <li>
            Ivan’s certs have tripled in value from $3,000 to $9,000; he sells
            half to The Good Foundation for $4,500, and burns the other half to
            claim charitable impact.
          </li>
        </ol>
        <h3 id="-why-are-impact-certs-better-than-regular-grants-">
          <strong>Why are impact certs better than regular grants?</strong>
        </h3>
        <p>
          <strong>For donors</strong>: “In an impact market, you (as the final
          oracular funder) only need to figure out which projects <em>did</em>{' '}
          work, which is much easier: for example, penicillin obviously worked,
          and flying cars obviously didn&apos;t. Then you buy the shares of
          those projects, and your job is done. Private investors still have to
          do the prediction behind the scenes, but they&apos;re only risking
          their own money, not charitable dollars, and they&apos;re properly
          incentivized to get the right answers.”
          <br />
          &nbsp;—
          <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
            <em>ACX</em>
          </a>
        </p>
        <p>
          <strong>For investors:</strong> If you have a good eye for what
          projects and founders are likely to be successful, you can now earn
          profits off of your skill — while helping early-stage projects get off
          the ground.
        </p>
        <p>
          <strong>For founders:</strong> Manifund is like a Common App for
          charitable funding: instead of applying one-by-one to a bunch of
          different grantmakers, you only need to create a single project
          proposal. This makes it easy to apply, even for very small amounts of
          funding (as low $250). Interested investors can then offer to fund
          your project through our site.
        </p>
        <p>
          Like startup equity, you can keep a portion of your impact cert
          shares, to sell later or distribute to other people who help your
          project.
        </p>
        <h3 id="see-also">See also</h3>
        <ul>
          <li>
            <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
              Impact Markets: The Annoying Details
            </a>{' '}
            by Scott Alexander
          </li>
          <li>
            <a href="https://medium.com/ethereum-optimism/retroactive-public-goods-funding-33c9b7d00f0c">
              Retroactive Public Goods Funding
            </a>{' '}
            by Vitalik Buterin
          </li>
          <li>
            <a href="https://impactpurchase.org/why-certificates/">
              Why Certificates?
            </a>{' '}
            by Paul Christiano and Katja Grace
          </li>
        </ul>
        <h1 id="about-us" className="relative top-5">
          About us
        </h1>
        <p>
          Manifund is built by the team behind{' '}
          <a href="http://manifold.markets/">Manifold Markets</a>, primarily{' '}
          <a href="https://manifold.markets/Austin">Austin Chen</a> and{' '}
          <a href="https://manifold.markets/rachel">Rachel Weinberg</a>.
        </p>
        <p>
          Come chat with us on{' '}
          <a href="https://discord.gg/zPnPtx6jBS">Discord</a>, or reach out to
          austin@manifold.markets!
        </p>
        <h1 className="relative top-5">Appendix: technical details</h1>
        <h3 id="the-auction-mechanism">The Auction Mechanism</h3>
        <p>
          On Manifund, project proposals start with a fundraising <b>auction</b>
          , where investors can offer to fund the project at a different
          <b> valuations</b>. At a predetermined auction close date, typically a
          week or two after the proposal is posted, the auction will resolve as
          follows:
        </p>
        <p>
          Bids will be read in order from highest valuation to lowest valuation.
          Bids will be paid out until all shares are bought at the price set by
          the lowest successful bid. If the total amount bid exceeds the minimum
          funding but not all shares are sold, then all bids will go through,
          the project will be funded, and remaining shares will go up for sale
          at that valuation on the market (this only happens if all bids were
          above the minimum valuation for the project). Otherwise, the minimum
          funding bar was not met by all bids combined and the project will not
          proceed.
        </p>
        <AuctionPlayground />
        <p>
          For example, let’s go back to that research team with a forecasting
          project to prevent pandemics with a minimum funding bar of $5,000.
          Here are a few ways the auction could go:
        </p>
        <div className="grid grid-cols-5">
          <ul className="col-span-2 flex flex-col justify-center">
            <li>$1,000 at 10k valuation</li>
            <li>$3,000 at 8k valuation</li>
            <li>$2,000 at 6k valuation</li>
            <li>$3,000 at 5k valuation</li>
          </ul>
          <div className="flex h-full flex-col justify-center">
            <ArrowLongRightIcon className="h-10" />
          </div>
          <div className="col-span-2 flex h-full flex-col justify-center">
            <p>First three bids go through at a valuation of $6k</p>
          </div>
        </div>
        <hr className="mb-3 mt-5 h-0.5 rounded-sm bg-gray-500" />

        <div className="grid grid-cols-5">
          <ul className="col-span-2 flex flex-col justify-center">
            <li>$2,000 at 10k valuation</li>
            <li>$3,000 at 10k valuation</li>
          </ul>
          <div className="flex h-full flex-col justify-center">
            <ArrowLongRightIcon className="h-10" />
          </div>
          <div className="col-span-2 flex h-full flex-col justify-center">
            <p>
              Both bids go through at a valuation of $10k, leaving 50% of the
              equity to be sold on the market at that same valuation
            </p>
          </div>
        </div>
        <hr className="mb-3 mt-5 h-0.5 rounded-sm bg-gray-500" />

        <div className="grid grid-cols-5">
          <ul className="col-span-2 flex flex-col justify-center">
            <li>$2,000 at 5k valuation</li>
            <li>$2,000 at 5k valuation</li>
          </ul>
          <div className="flex h-full flex-col justify-center">
            <ArrowLongRightIcon className="h-10" />
          </div>
          <div className="col-span-2 flex h-full flex-col justify-center">
            <p>
              The bids did not meet the minimum funding bar so no bids go
              through and the project is not funded.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
