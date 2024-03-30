export default function ApproachPage4() {
  return (
    <div className="prose mx-auto p-5 font-light">
      <h1 className="relative top-5" id="impact-certificates">
        Manifund’s Approach to Thinking About Charitable Funding
      </h1>
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
    </div>
  )
}