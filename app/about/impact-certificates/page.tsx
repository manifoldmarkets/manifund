import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { AuctionPlayground } from './auction-playground'

export default function ImpactCertsPage() {
  return (
    <div className="prose mx-auto p-5 font-light">
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
          will be funded and top bidders by valuation will receive shares in the
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
          Three months later, the forecasting model proves to be effective in
          predicting the trajectory of an upcoming pandemic and helping
          hospitals take action.
        </li>
        <li>
          The Good Foundation values the project at $18,000 of impact, offering
          to buy up all of the outstanding certs.
        </li>
        <li>
          Since Ivan owns 50% of the project's certs, his stake has tripled in
          value from $3,000 to $9,000; he sells them for $9,000 to The Good
          Foundation, netting a $6,000 profit. (Important note: for legal reasons,
          profits on Manifund impact certificates can currently only be used to
          donate to charity and can't be cashed out in the normal way.)
        </li>
      </ol>
      <h3 id="-why-are-impact-certs-better-than-regular-grants-">
        <strong>Why are impact certs better than regular grants?</strong>
      </h3>
      <p>
        <strong>For donors</strong>: “In an impact market, you (as the final
        oracular funder) only need to figure out which projects <em>did</em>{' '}
        work, which is much easier: for example, penicillin obviously worked,
        and flying cars obviously didn&apos;t. Then you buy the shares of those
        projects, and your job is done. Private investors still have to do the
        prediction behind the scenes, but they&apos;re only risking their own
        money, not charitable dollars, and they&apos;re properly incentivized to
        get the right answers.”
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
      <h3 id="see-also">See also</h3>
      <ul>
        <li>
          <a href="https://astralcodexten.substack.com/p/impact-markets-the-annoying-details">
            Impact Markets: The Annoying Details
          </a>{' '}
          by Scott Alexander
        </li>
        <li>
          <a href="https://www.brasstacks.blog/explain-im/">
            Explaining Impact Markets
          </a>{' '}
          by Saul Munn
        </li>
        <li>
          <a href="https://impactpurchase.org/why-certificates/">
            Why Certificates?
          </a>{' '}
          by Paul Christiano and Katja Grace
        </li>
        <li>
          <a href="https://medium.com/ethereum-optimism/retroactive-public-goods-funding-33c9b7d00f0c">
            Retroactive Public Goods Funding
          </a>{' '}
          by Vitalik Buterin
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
