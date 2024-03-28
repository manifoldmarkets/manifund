import { ArrowLongRightIcon } from '@heroicons/react/20/solid'

export default function ApproachPage() {
  return (
    <div className="prose mx-auto p-5 font-light">
      <h1 className="relative top-5" id="impact-certificates">
        Manifund&apos;s Approach to Thinking About Charitable Funding
      </h1>
      <p>
        From 2023 retrospective: &quot;Our initial thesis was that grant applications and screening largely can be done in public, and should be.&quot;
      </p>
      <h3 id="-economic-experimentation-">
        Economic Experimentation
      </h3>
      <p>
          Manifund&apos;s sister company, Manifold, runs experiments with prediction markets. (make own, contests, leagues, a dating app, etc. emergent behaviors)
          Because Manifold runs on play money, and because users get to participate on the market-creation
          side as well as the prediction side,
      </p>
      <p>
        Manifund is different, because lots of real money is moving through our programs. But we're
        still small and fast-moving ([example of grant turnaround time]), 
      </p>
      <p>Manifund aims to be similar for charitable funding</p>
      <p>Playground for experimenting with funding mechanisms</p>
      <h3 id="-programs-manifund-has-run-">
        <strong>Programs Manifund has run</strong>
      </h3>
      <p>
        <p>Regranting</p>
        <p>ACX grants</p>
        <p>Impact certificates</p>
        <p>Assurance contract auctions</p>
      </p>
      <h3 id="-impact-certificates-">
        <strong>Impact certificates</strong>
      </h3>
      <p>
        Take impact certificates, for example. [Explainer.] Then: what&apos;s neat about this? No need to learn new ways to evaluate charities, or make people more altruistic. It just introduces an extra market mechanism.
      </p>
      <p>
        Each individual step of this process is perfectly understandable if you understand the analogous thing in private markets. But altogether, it&apos;s a lot of new moving parts to conceptualize at once. Can we come up with a general framework for thinking about these kinds of market designs?
      </p>
      <h3 id="-pfeep-model">
        <strong>The PFEEP framework</strong>
      </h3>
      <p>
        the challenges of each
      </p>
      <p>
        for each: who does it? possibly, how does it happen? and what is it coupled with?
      </p>
      <ul>
        <li>
          <strong>Predict</strong>
        </li>
        <li>
        <strong>Front</strong>
        </li>
        <li>
        <strong>Execute</strong>
        </li>
        <li>
        <strong>Evaluate</strong>
        </li>
        <li>
        <strong>Pay out</strong>
        </li>
      </ul>
      <h4>The startup model</h4>
      <h4>The bootstrapping model</h4>
      <h4>The wealthy philanthropist model</h4>
      <h4>The classical Effective Altruism model</h4>
      <h4>The GiveWell model</h4>
      <p>
        stuff
      </p>
      <h4>The impact market model</h4>
      <p>
        stuff
      </p>
      <h3 id="-standalone-mechanisms-">
        <strong>Single-step mechanisms</strong>
      </h3>
      <p>
        Some mechanisms are solely designed for use on one or two steps of the framework. For example:
      </p>
      <p>
        A large swath of public-goods and charitable funding mechanisms can be understood as innovations
        on one or two steps of this framework.
      </p>
      <p>
        Challenge prizes – pay out
      </p>
      <p>
        S-process – evaluate. SFF already does this (check). Need to watch the video to learn more.
      </p>
      <p>
        Advance market commitments – pay out. Might not be the right fit for Manifund because what would we buy?
      </p>
      <p>
        Income share agreements – predict and front. No added cost to run.
      </p>
      <p>
        Schelling-point oracles – evaluate. Would entail a whole webapp, jurors, and ways to pay them.
      </p>
      <p>
        Patronage – predict and front. Cost the average &quot;sponsor me to explore in my career&quot; application is looking for, times maybe 7 or 8 as a minimum set of Manifund Fellows or w/e.
      </p>
      <p>
        Crowdfunding – pay out. No added cost to run.
      </p>
      <p>
        Regranting – predict. (Check current regranting budget)
      </p>
      <h3 id="-coupling-and-decoupling-">
        <strong>Coupling and decoupling</strong>
      </h3>
      <p>
        Design-bid-build – decouple evaluation from execution
      </p>
      <p>
        Coupling is for aligning incentives. Decoupling is for allowing specialization. (Principal-agent problems arise
        when you do too much decoupling.)
      </p>
      <h3 id="-psychological-benefits-">
        <strong>Psychological</strong>
      </h3>
      <p>
        Reputation
      </p>
      <p>
        Leverage/responsiveness/power to affect the world
      </p>
      <h3 id="-caveat-">
        <strong>Caveat: different value systems</strong>
      </h3>
      <p>
        Altruism toward non-economic entities: future people, animals, children, ...
      </p>
      <p>
        Is altruism a coordination problem?
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
      <h3 id="-effective-iteration-">
        <strong>Effective iteration</strong>
      </h3>
      <h4>Iteration speed</h4>
      <h4>Iteration volume</h4>
    </div>
  )
}