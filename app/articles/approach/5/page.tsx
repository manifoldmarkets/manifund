import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'

export default function ApproachPage5() {
  const content = (
    <Fragment>
      <p>
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
        antarctica; but it’s not contingent on the project actually succeeding.
        maybe the company goes bust, the idea doesn’t work, the nonprofit falls
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
      <p>  
        <strong>Challenge prizes:</strong> pay out.
      </p>
      <p>  
        <strong>S-process:</strong> evaluate.
      </p>
      <p>  
        <strong>Advance market commitments </strong> pay out.
      </p>
      <p>  
        <strong>Income share agreements </strong> predict and front.
      </p>
      <p>  
        <strong>Schelling-point oracles: </strong> evaluate.
      </p>
      <p>  
        <strong>Patronage: </strong> predict and front.
      </p>
      <p>  
        <strong>Crowdfunding: </strong> pay out.
      </p>
      <p>  
        <strong>Regranting: </strong> predict.
      </p>
      <p>  
        <strong>Prediction markets: </strong> predict.
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
        and pays for it themselves.” then the incentives are very aligned!
        but on the other hand, it’s tremendously inefficient – no
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
        contractor to implement it; see Asterisk magazine’s 
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
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Observations About These Examples"
    nextLink="/articles/approach/6"
    nextLinkText="Next: Non-financial elements"
    content={content}
  />
}