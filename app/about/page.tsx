'use client'
import { ArrowLongRightIcon } from '@heroicons/react/24/solid'
import { AuctionPlayground } from './auction-playground'

export default function AboutPage() {
  return (
    <div className="prose mx-auto font-light">
      <h1 className="relative top-5">Our mission</h1>
      <p>
        Manifund builds funding infrastructure for non-profits, particularly
        aimed at the effective altruism and longtermist spaces. We aim to
        provide clean user experiences for grantmakers, donors, and recipients
        so money moves where it’s needed faster, clear records and communication
        channels to improve feedback and accountability, and innovative
        mechanisms that better align incentives with impact.
      </p>
      <p>
        Currently we support two funding mechanisms: regranting and impact
        certificates, which you can read more about below!
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
      </p>
      <a href="https://forum.effectivealtruism.org/posts/paMYXYFYbbjpdjgbt/future-fund-june-2022-update#Expectations_vs__reality">
        considered regranting to be the most promising.
      </a>
      <h3>Why regranting?</h3>
      <ul>
        <li>
          Regranting surfaces opportunities that a donor might otherwise miss,
          as regrantors can tap into their personal networks and fields of
          expertise.
        </li>
        <li>
          The regranting model requires less overhead than traditional
          grantmaking, as one person is responsible for the budget rather than a
          committee. This also allows for faster grant turnaround times, solving
          a key pain point for grantees.
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
          A donor contributes money to Manifold for Charity, a registered 501c3
          nonprofit.
        </li>
        <li>
          The donor then allocates the money between regrantors of their choice.
        </li>
        <li>
          Regrantors choose which opportunities (eg existing charities, new
          projects, or individuals) to spend their budgets on, writing up an
          explanation for each grant made.
        </li>
        <li>
          Manifold for Charity reviews the grant to make sure it is legitimate,
          legal, and aligned with our mission, and then wires the money and
          publishes the grant writeups.
        </li>
      </ol>
      <h3>Kickoff round</h3>
      <p>
        On launch, there will be 5 sponsored regrantors, each of whom will get a
        regranting budget of $500k to distribute to projects or charities that
        they believe will most improve the future. These regrants are backed by
        an anonymous donor’s contribution of $1.5 million; Longtermist Round 1
        will end after this pool is spent, or after 6 months have passed.
      </p>
      <p>
        Sponsored regranters will be compensated $100 + 0.5% of each grant that
        they make, excluding grants for their own projects.
      </p>
      <p>
        We plan to launch the program on Friday, June 2nd. At this point,
        regrantors may begin giving grants.
      </p>
      <h3>FAQ</h3>
      <strong>Who can see the information about grants?</strong>
      <br />
      <p>
        Currently all grant information is made public. This includes the
        identity of the regrantor and grant recipient, the project description,
        the grant size, and the regrantor’s writeup.
      </p>
      <p>
        We strongly believe in transparency as it allows for meaningful public
        feedback, accountability of decisions, and establishment of a regrantor
        track records. We recognize that not all grants are suited for
        publishing; for now, we recommend such grants be made through other
        donors (such as LTFF, SFF, or OpenPhil).
      </p>
      <p>
        If after some time we receive feedback from regranters or recipients
        that this is significantly restricting their behavior or causing
        friction, we may add a semi-private or private option.
      </p>
      <strong>What kinds of projects are eligible for regranting?</strong>
      <br />
      <p>
        We support regrants to registered charities and individuals. For-profit
        organizations may also be eligible, pending due diligence. As a
        US-registered 501c3, we do not permit donations to political campaigns.
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
        Regranters are allowed to donate to their own projects, though we’ll
        evaluate these projects with more scrutiny before fulfilling withdrawal
        requests.
      </p>
      <strong>How do I become a regrantor?</strong>
      <p>
        Anyone can become a regrantor just be altering a setting on their
        profile. This will advertise their profile as a regrantor and allow them
        to create grants out of their budget.
      </p>
      <p>
        Manifund will reach out personally to individuals we want to sponsor as
        regrantors.
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
          through an auction. At a predetermined date, the auction will resolve:
          if the total amount bid meets the minimum funding goal, the project
          will be funded and top bidders by valuation will recieve shares in the
          project in exchange for money. Otherwise, the project will not be
          funded.
        </li>
        <li>
          If the project is funded, accredited investors may continue to trade
          shares in the active project, buying and selling based on how the
          projects are performing.
        </li>
        <li>
          After the project is complete, altruistic individuals or organizations
          can offer to buy up these shares in recognition of successful impact
          by the project.
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
          The Good Foundation values the project at $18,000 of impact, offering
          to buy up all of the outstanding certs.
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
        and flying cars obviously didn’t. Then you buy the shares of those
        projects, and your job is done. Private investors still have to do the
        prediction behind the scenes, but they’re only risking their own money,
        not charitable dollars, and they’re properly incentivized to get the
        right answers.”
        <br />
        &nbsp;—
        <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
          <em>ACX</em>
        </a>
      </p>
      <p>
        <strong>For investors:</strong> If you have a good eye for what projects
        and founders are likely to be successful, you can now earn profits off
        of your skill — while helping early-stage projects get off the ground.
      </p>
      <p>
        <strong>For founders:</strong> Manifund is like a Common App for
        charitable funding: instead of applying one-by-one to a bunch of
        different grantmakers, you only need to create a single project
        proposal. This makes it easy to apply, even for very small amounts of
        funding (as low $250). Interested investors can then offer to fund your
        project through our site.
      </p>
      <p>
        Like startup equity, you can keep a portion of your impact cert shares,
        to sell later or distribute to other people who help your project.
      </p>
      <h1 id="about-us" className="relative top-5">
        About us
      </h1>
      <p>
        Manifund is built by the team behind{' '}
        <a href="http://manifold.markets/">Manifold Markets</a>, primarily{' '}
        <a href="https://manifold.markets/Austin">Austin Chen</a> and{' '}
        <a href="https://manifold.markets/RachelWeinberg">Rachel Weinberg</a>.
      </p>
      <p>
        Come chat with us on <a href="https://discord.gg/zPnPtx6jBS">Discord</a>
        , or reach out to austin@manifold.markets!
      </p>
      <h2 id="see-also">See also</h2>
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
      <h1 className="relative top-5">Appendix: technical details</h1>
      <h3 id="the-auction-mechanism">The Auction Mechanism</h3>
      <p>
        On Manifund, project proposals start with a fundraising <b>auction</b>,
        where investors can offer to fund the project at a different
        <b> valuations</b>. At a predetermined auction close date, typically a
        week or two after the proposal is posted, the auction will resolve as
        follows:
      </p>
      <p>
        Bids will be read in order from highest valuation to lowest valuation.
        Bids will be paid out until all shares are bought at the price set by
        the lowest successful bid. If the total amount bid exceeds the minimum
        funding but not all shares are sold, then all bids will go through, the
        project will be funded, and remaining shares will go up for sale at that
        valuation on the market (this only happens if all bids were above the
        minimum valuation for the project). Otherwise, the minimum funding bar
        was not met by all bids combined and the project will not proceed.
      </p>
      <AuctionPlayground />
      <p>
        For example, let’s go back to that research team with a forecasting
        project to prevent pandemics with a minimum funding bar of $5,000. Here
        are a few ways the auction could go:
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
            The bids did not meet the minimum funding bar so no bids go through
            and the project is not funded.
          </p>
        </div>
      </div>
    </div>
  )
}
