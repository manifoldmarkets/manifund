import { ArrowLongRightIcon } from '@heroicons/react/20/solid'

export default function ApproachPage() {
  return (
    <div className="prose mx-auto p-5 font-light">
      <h1 className="relative top-5" id="impact-certificates">
        Manifund’s Approach to Thinking About Charitable Funding
      </h1>
      <p>
        From 2023 retrospective: &quot;Our initial thesis was that grant applications and screening largely can be done in public, and should be.&quot;
      </p>
      <h2 id="-economic-experimentation-">
        Economic Experimentation
      </h2>
      <p>
          Manifund’s sister company, Manifold, runs experiments with
          prediction markets. Because Manifold runs on play money, and because
          users get to participate on the market-creation side as well as the
          prediction side, it’s arguably the best playground in the world for
          experimenting rapidly with financial mechanisms. Since official
          currency isn’t involved, both Manifold and its users (and the two in
          combination) can run experiments rapid-fire without jumping through
          many hoops. For instance, Manifold has tried various types of
          automatic market-making algorithms, mechanisms for multiple-choice
          questions, short selling, limit orders, contests, leagues, even a
          dating app spinoff. And users have made bots, non-question questions
          like “___ stock (never resolves)”, markets that serve as bounties to
          incentivize particular events to happen, questions with meta
          resolution criteria like “Will the total volume of YES trading on
          this question be more than x mana?”.
      </p>
      <p>
        Manifund is different, because lots of real money is moving through our
        programs. But we’re still small and fast-moving ([example of grant
        turnaround time]), and our ethos is similar: we aim to be an incubator
        for lots of small- and medium-scale experiments testing out funding
        mechanisms for charity and public goods.
      </p>
      <p>
        Effective altruism originally asked the question, “What properties make
        a charitable project useful, efficient, and valuable?” Manifund is an
        attempt to extend that question in two ways:
      </p>
      <ol>
        <li>
          What kinds of systems incentivize projects that have those properties?
          </li>
        <li>
          How can we use improvements to the grantee experience to make funding
          programs more effective?
        </li>
      </ol>
      <h2 id="-programs-manifund-has-run-">
        <strong>Programs Manifund has run</strong>
      </h2>
      <p>
        <h3>Regranting</h3>
        <h3>ACX grants</h3>
        <h3>Impact certificates</h3>
        <h3>Assurance contract auctions</h3>
      </p>
      <h2 id="-how-to-think-about-funding">
        <strong>How to think about funding</strong>
      </h2>
      <p>
        Is there anything general we can say about these kinds of experiments?
      </p>
      <p>
        Take the system of impact certificates, for example. There are a couple 
        of differences from how charity is traditionally funded. The donations 
        come after the fact, for one thing, rather than in advance. And 
        there’s a middleman involved, who doesn’t even necessarily have 
        to have altruistic motives.
      </p>
      <p>
        Theoretically, this leads to neat results. There’s no need to learn 
        new ways to evaluate charities, or to make people more altruistic. The 
        addition of an intermediate market makes it more efficient to figure 
        out the most efficient allocation of funds by the donor’s own 
        metrics.
      </p>
      <p>
        But also, it seems a little contrived? Each individual step of this 
        process is perfectly understandable if you understand the analogous 
        element of private markets. But altogether, it’s a lot of new moving 
        parts to conceptualize at once, and it’s not obvious how to come up 
        with similar ideas or how to evaluate them.
      </p>
      <p>
        So we’ve come up with a first pass at a general framework for 
        thinking about the design of novel funding mechanisms.
      </p>
      <ol>
        <li>
          <strong>Predict</strong>
          <p>
            <strong>What does it entail?</strong> Make a good guess about which
            projects will be likely to achieve their aims, what impacts those
            achievements will have, and which teams can achieve the best
            results for the lowest cost.
          </p>
          <p>
            <strong>What are the desirables?</strong> Predict accurately and at
            low cost.
          </p>
        </li>
        <li>
          <strong>Front</strong>
          <p>
            <strong>What does it entail?</strong> Make a good guess about which
            projects will be likely to achieve their aims, what impacts those
            achievements will have, and which teams can achieve the best
            results for the lowest cost.
          </p>
        </li>
        <li>
          <strong>Execute</strong>
          <p>
            <strong>What does it entail?</strong> Carry out the project.
          </p>
          <p>
            <strong>What are the desirables?</strong> Do something people
            actually want. Do it well. Do it inexpensively.  Don’t run off
            with the money.
          </p>
        </li>
        <li>
          <strong>Evaluate</strong>
          <p>
            <strong>What does it entail?</strong> Determine how valuable the
            project was.
          </p>
          <p>
            <strong>What are the desirables?</strong> Align the measure with
            the target – that is, [explain further]. Account for
            externalities– for example, [example of private funding][example of
            big donor funding for reputation].
          </p>
        </li>
        <li>
          <strong>Pay out</strong>
          <p>
            <strong>What does it entail?</strong> Allocate money as a function
            of the evaluation of the project’s impact. In some cases, like
            traditional grantmaking, the fronting is also the payout (although
            to some extent this is a question of definitions; you could also
            think of traditional grantmaking as just skipping the fronting
            step).
          </p>
          <p>
            <strong>What are the desirables?</strong> Incentivize the execution
            of projects with the most impact.
          </p>
        </li>
      </ol>
      <h2 id="-some-examples">
        Some examples
      </h2>
      <h3>The startup model</h3>
      <p>
        Predict: investors
      </p>
      <p>
        Front: investors
      </p>
      <p>
        Execute: founder
      </p>
      <p>
        Evaluate: consumers
      </p>
      <p>
        Pay out: consumers
      </p>
      <p>
        Benefit: founder (as profit), investors (as profit), consumers (as consumer surplus)
      </p>
      <h3>The bootstrapping model</h3>
      <p>
        Predict: founder
      </p>
      <p>
        Front: founder
      </p>
      <p>
        Execute: founder
      </p>
      <p>
        Evaluate: consumers
      </p>
      <p>
        Pay out: consumers
      </p>
      <p>
        Benefit: founder (as profit), consumers (as consumer surplus)
      </p>
      <h3>The government model</h3>
      <p>
        Predict: elected officials or bureaucrats
      </p>
      <p>
        Front: citizens (as taxpayers)
      </p>
      <p>
        Execute: contractors
      </p>
      <p>
        Evaluate: citizens (indirectly, as voters)
      </p>
      <p>
        Pay out: citizens (as taxpayers)
      </p>
      <p>
        Benefit: citizens, contractors (as profit), officials (as goodwill for
        subsequent elections)
      </p>
      <h3>The wealthy philanthropist model</h3>
      <p>
        Predict: donor
      </p>
      <p>
        Front: donor
      </p>
      <p>
        Execute: donor
      </p>
      <p>
        Evaluate: donor
      </p>
      <p>
        Pay out: donor
      </p>
      <p>
        Benefit: charity beneficiaries
      </p>
      <h3>The classical Effective Altruism model</h3>
      <p>
        Predict: donor, with an Our World In Data tab open
      </p>
      <p>
        Front: donor
      </p>
      <p>
        Execute: donor
      </p>
      <p>
        Evaluate: donor
      </p>
      <p>
        Pay out: donor
      </p>
      <p>
        Benefit: charity beneficiaries
      </p>
      <h3>The charity evaluator model</h3>
      <p>
        Predict: charity evaluator
      </p>
      <p>
        Front: donors
      </p>
      <p>
        Execute: founders
      </p>
      <p>
        Evaluate: charity evaluator
      </p>
      <p>
        Pay out: donors
      </p>
      <p>
        Benefit: charity beneficiaries
      </p>
      <h4>The impact certificate model</h4>
      <p>
        Predict: investors
      </p>
      <p>
        Front: investors
      </p>
      <p>
        Execute: founder
      </p>
      <p>
        Evaluate: donor
      </p>
      <p>
        Pay out: donor
      </p>
      <p>
        Benefit: founder (as profit), investors (as profit), charity beneficiaries
      </p>
      <h3>The quadratic funding model</h3>
      <p>
        Predict: contributors
      </p>
      <p>
        Front: contributors and matching-pool sponsors
      </p>
      <p>
        Execute: founder
      </p>
      <p>
        Evaluate: contributors
      </p>
      <p>
        Pay out: contributors and matching-pool sponsors
      </p>
      <p>
        Benefit: contributors
      </p>
      <p>
        <br />
        There are a couple of things to notice here.
      </p>
      <h3>
        Some distinctions don’t always occur
      </h3>
      <p>
        “Predict” and “evaluate” are often the same, as are “front” and “pay
        out”. These are for cases where money is given out ahead of time, in a
        way that’s – well, not no-strings-attached, the founders have to make a
        reasonable attempt and not just grab the money and run off to hide out in
        Antarctica; but it’s not contingent on the project actually succeeding.
        Maybe the company goes bust, the idea doesn’t work, the nonprofit falls
        apart, whatever. Or maybe the project does what it says it will, but it
        turns out no one really likes or wants the result after all. But when
        there’s not a separate evaluation step and payout step, then those
        contingencies are beyond the purview of the funding mechanism to
        influence. Trying to fund stuff that won’t fail is baked into the
        prediction and fronting steps.
      </p>
      <p>
        This is especially true for new endeavors. With well-established
        charities and companies, the ability to secure future funding is an
        indirect incentive to execute current projects well. But for new
        organizations that have no track record at all (or sometimes, even
        new projects started by existing organizations), you have to fall
        back on looking at the track record of the people founding them, and
        if the founders are relatively unknown, there’s not much of an
        incentive to give them a chance as opposed to taking safe bets. Taking
        big swings that you’ll usually miss on, but that will occasionally have
        wildly outsized returns, is sometimes called “hits-based giving”; some
        effective-altruist organizations explicitly try to use this strategy,
        and the reason it’s even necessary for them to specify that – after
        all, hits-based investing is how venture capital works be default – is
        that the incentives for an individual employee of a typical
        philanthropic foundation, like the incentives for an individual
        bureaucrat, are to be risk-averse and lean toward safe bets rather
        than innovation.
      </p>
      <h3>
        Some mechanisms are “full-stack”; others exist at one or two layers
      </h3>
      <p>
        Some mechanisms, like the examples mentioned above, offer an
        implementation of the entire framework.
      </p>
      <p>
        But a large swath of mechanisms can be understood as innovations on
        one or two of the steps. For example:
      </p>
      <h3 id="-coupling-and-decoupling-">
        <strong>
          Coupling and decoupling are central tools of funding-mechanism design
        </strong>
      </h3>
        <p>
          No mechanism listed here has all its six steps carried out by different
          actors. In other words, various subsets of the steps are coupled
          together: for instance, quadratic funding is able to price demand for a
          public good because potential beneficiaries put up some of their own
          money, which ensures they’re credibly signaling their real preference
          for the good. Or for a more obvious example, democracy is more
          responsive to the needs of its populace than monarchy is because
          elected officials have to predict which policies will be popular in
          order to win re-election. That’s because coupling two steps aligns
          their incentives: combining an information-gathering step with a
          money-moving step ensures that decision-makers have skin in the game.
        </p>
        <p>
          But there’s a limit to the benefits of coupling. The ultimate fully
          coupled funding system is “everyone builds everything for themselves
          and pays for it themselves.” Then the incentives are very aligned!
          But on the other hand, it’s tremendously inefficient – no
          specialization, no division of labor.
        </p>
        <p>
          So decoupling turns the knob the other way. For example, in a market
          for impact certificates, instead of donors doing all the work of
          assessing applicants and allocating funds (by making grants in
          advance based on who looks most promising), you split the process
          into two layers: investors, who are purely speculators, and donors,
          who only have to evaluate projects’ impact afterwards.
        </p>
        <p>
          Another example is the design-bid-build system of construction
          contracting. Instead of the government choosing a single bid for a
          contractor to design and then carry out a construction project,
          with design-bid-build they accept one contractor’s bid to create a
          design, then put out a separate call for a (potentially) different
          contractor to implement it; see Asterisk Magazine’s 
          <a href="https://asteriskmag.com/issues/05/all-aboard-the-bureaucracy-train"> interview </a>
          with urbanist Alon Levy, who argues that this framework
          is more cost-effective than the single-bid (”design-build”) system in
          most places that run it.
        </p>
        <p>
        In general, decoupling allows for improved competition and
        specialization, which is especially useful in philanthropic cases,
        where it’s hard to operate a single nonprofit as efficiently as a
        corporation of the same size. But too much decoupling can cause
        principal-agent problems, as often happens in bureaucracy, and can be
        outweighed by economies of scale.
        </p>
      <p>
        Design-bid-build – decouple evaluation from execution
      </p>

      <h3 id="-psychological-benefits-">
        <strong>Psychological</strong>
      </h3>
      <p>
      Aside from all the financial considerations, there are a couple of social
      and psychological levers entailed in grantmaking. One lesson Manifund has
      gleaned from Manifold, our sister prediction-market company, is that you
      can operate a finance-like system without any actual money involved,
      because people also value:
      </p>
      <ol>
        <li>
          reputation – the glory of visibly performing well and accumulating
          scarce prestige, and
        </li>
        <li>
          agency – the feeling that their actions cause something to come into
          being that wouldn’t have otherwise. This is the sensation of knowing
          that when you push the button, something will actually happen.
        </li>
      </ol>
      <p>
        The slower-moving and less accessible a philanthropic organization is,
        the harder it is for many individuals to achieve either of those two. On
        a crowdfunding platform like Kickstarter, users can get a sense of
        agency, but not so much of accumulating reputation. Anything that
        resembles a game, like investing or predicting, and that has real-world
        effects, hits both these criteria: you can succeed relative to others,
        and you can succeed in the sense that you did some actions on a website
        and now a real physical project is getting accomplished.
      </p>
      <h3 id="-effective-iteration-">
        <strong>Effective iteration</strong>
      </h3>
      <h3 id="-caveat-">
        Caveat: different value systems
      </h3>
      <p>
        One limitation of this model is that it’s not obvious how well it applies
        to entities that don’t naturally fit into standard economic models because
        they can’t easily participate in markets: children, animals, people who
        might exist in the distant future. For people whose value systems heavily
        incorporate any of these groups’ preferences, *all* market-based funding
        solutions might prove inadequate. In these cases, funding is closer to a
        strict question of altruism than a coordination problem; donors have to
        speculate on behalf of those who can’t (financially) speculate for
        themselves. These causes lend themselves better to direct improvements
        in prediction and evaluation than to financial mechanisms that couple
        those steps with fronting and paying out; it’s not really clear how you’d
        align your own incentives with the incentives of someone in the year
        2300, except by saying “I care abstractly about making future people
        happy.”
      </p>
      <p>
        Even in these areas, though, there are often some smaller subproblems
        related to coordination, and so market mechanisms can offer at least
        some improvements. For example, grant proposals often become the
        victims of “funder chicken,” where each potential donor, having a
        limited budget, likes a proposal but hopes one of the others will fund
        it first. And even if you can’t evaluate one year from now whether a
        project intended to improve outcomes on a century-long timescale has
        succeeded in that, you can at least check whether the project did what 
        it said it would, or whether it achieved the kind of result that you
        already believe for other reasons would be valuable for the far future.
        It’s hard to incentivize terminal goals this way, but for incentivizing
        instrumental goals, market structures are pretty good.
      </p>
      <p>
        On some level, you can think of altruism <i>itself</i> as a public good:
        like, ten thousand people are all sad about cows getting factory-farmed
        and would rather the cows be freed to roam on beautiful verdant
        pastures, and so cow liberation is a public good to all those people
        insofar as it’s something that would make them all happy. This doesn’t
        necessarily evaluate how much the <i>cow</i> would prefer freedom to its
        current life; you could just as easily imagine that ten thousand other
        people would enjoy seeing a herd of cows dressed up in identical little
        bow ties, and so purchasing a pack of wide-necked bow ties would be a
        public-goods-funding coordination problem in just the same way. The
        “figuring out what would be best for cows” problem, and below it the
        more fundamental “figuring out what my altruistic values are” problem,
        aren’t easily solvable by markets. But in either case, once you make
        up your mind as to what your goals are, market mechanisms become useful
        tools to help you get there.
      </p>
    </div>
  )
}