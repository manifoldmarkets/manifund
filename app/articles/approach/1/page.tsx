import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'


export default function ApproachPage1() {
  const content = (
    <Fragment>
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
        programs. But we’re still small and fast-moving,
        and our ethos is similar: we aim to be an incubator
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
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Economic Experimentation"
    nextLink="/articles/approach/2"
    nextLinkText="Next: Some programs we've run"
    content={content}
  />
}