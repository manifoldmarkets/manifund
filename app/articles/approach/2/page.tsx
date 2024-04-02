import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'
import Link from 'next/link'

export default function ApproachPage2() {
  const content = (
    <Fragment>
      <p>
        <Link href="/about/regranting">Regranting</Link>
        <Link href="/about/impact-certificates">Impact markets</Link>
        <Link href="/causes/acx-grants-2024">ACX Grants</Link>
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