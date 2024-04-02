import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'
import Link from 'next/link'

export default function ApproachPage2() {
  const content = (
    <Fragment>
      In 2023, Manifund ran a few different granting programs.
      <ul>
        <li>
          <strong><Link href="/about/regranting">Regranting</Link></strong>: Donors delegate grantmaking budgets to regrantors, who
          allocate the funds to the most promising projects they come across.
        </li>
        <li>
          <strong><Link href="/about/impact-certificates">Impact markets</Link></strong>: Donors offer retroactive prize funding to
          successful and impactful projects, and project founders sell shares in these prizes to fund their projects.
        </li>
        <li>
          <strong><Link href="/about/open-call">Open call with assurance-contract donations</Link></strong>: Manifund runs an open call for projects,
          which operates like Kickstarter for charity: if a project receives donation offers totaling at least its minimum funding goal,
          then the donations kick in and it receives funding.
        </li>
      </ul>
      <p>
        (You can read more about these programs in our <Link href="https://www.lesswrong.com/posts/cxjRjs5BWw5pBHZiA/manifund-2023-in-review#2023_Programs">2023 retrospective</Link>.)
      </p>
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
        But also, it’s easy to feel like the mechanism just came out of nowhere. Each individual step of this 
        process is perfectly understandable if you understand the analogous 
        element of private markets. But altogether, it’s a lot of new moving 
        parts to conceptualize at once, and it’s not obvious how to come up 
        with similar ideas or how to evaluate them.
      </p>
      <p>
        So we’ve come up with a first pass at a general framework for 
        thinking about the design of novel funding mechanisms.
      </p>
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Some Programs We've Run"
    prevLink="/articles/approach/1"
    nextLink="/articles/approach/3"
    nextLinkText="Next: The six steps of funding"
    content={content}
  />
}