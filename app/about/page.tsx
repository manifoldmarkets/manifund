'use client'
import { ArrowLongRightIcon } from '@heroicons/react/24/solid'
import { AuctionPlayground } from './auction-playground'

export default function AboutPage() {
  return (
    <div className="prose mx-auto font-light">
      <p>
        Manifund is a platform for creating and investing in{' '}
        <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
          impact certificates
        </a>
        . It’s like Kickstarter meets the stock market, for charity!
      </p>
      <h2 id="how-does-manifund-work-">How does Manifund work?</h2>
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
      <h2 id="an-example-of-manifund-in-action">
        An example of Manifund in action
      </h2>
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
      <h2 id="-why-are-impact-certs-better-than-regular-grants-">
        <strong>Why are impact certs better than regular grants?</strong>
      </h2>
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
      <h2 id="about-us">About us</h2>
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
      <h2>Appendix: technical details</h2>
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
      {/* <AuctionPlayground /> */}
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
