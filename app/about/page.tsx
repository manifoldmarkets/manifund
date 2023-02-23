'use client'

export default function AboutPage() {
  return (
    <div className="prose font-light">
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
          Accredited investors offer to fund the project, based on how valuable
          they think the projects will turn out. They receive shares of the
          impact certificate in exchange for their money.
        </li>
        <li>
          Investors then trade these shares on the Manifund marketplace, buying
          and selling based on how the projects are performing.
        </li>
        <li>
          Altruistic individuals or orgs can offer to buy up these shares in
          recognition of successful impact by the project.
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
          half to The Good Foundation for $4,500, and keeps the other half for
          bragging rights.
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
    </div>
  )
}
