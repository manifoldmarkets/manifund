import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'

export default function ApproachPage3() {
  const content = (
    <Fragment>
            <h2>1. Predict</h2>
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
      <h2>2. Front</h2>
      <p>
        <strong>What does it entail?</strong> Supply the immediate
        funding for the costs a team will incur in the process of
        doing their project. 
      </p>
      <p>
        <strong>What are the desirables?</strong> Predict accurately and at
        low cost.
      </p>
      <h2>3. Execute</h2>
      <p>
        <strong>What does it entail?</strong> Carry out the project.
      </p>
      <p>
        <strong>What are the desirables?</strong> Do something people
        actually want. Do it well. Do it inexpensively.  Don’t run off
        with the money.
      </p>
      <h2>4. Evaluate</h2>
      <p>
        <strong>What does it entail?</strong> Determine how valuable the
        project was.
      </p>
      <p>
        <strong>What are the desirables?</strong> Figure out both how successful
        the project was and how much impact that success had. Make the targets clear
        so founders know what to aim for, but avoid using measures that are too easy
        to game. Account for
        externalities – for example, if the project was moderately beneficial
        to the group that commissioned it, but also benefited lots of
        other people as well, then we’d like that to be factored in.
      </p>
      <h2>5. Pay out</h2>
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
      <h2>6. Benefit</h2>
      <p>
        <strong>What does it entail?</strong> Enjoy the benefits
        of whatever it was that got funded.
      </p>
      <p>
        <strong>What are the desirables?</strong> Be helped by the project.
        Do not be harmed by the project.
      </p>
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="The Six Steps of Funding"
    prevLink="/articles/approach/2"
    nextLink="/articles/approach/4"
    nextLinkText="Next: Some examples"
    content={content}
  />
}