import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'

export default function ApproachPage6() {
  const content = (
    <Fragment>
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
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Non-Financial Elements"
    nextLink="/articles/approach/7"
    nextLinkText="Next: Effective iteration"
    content={content}
  />
}