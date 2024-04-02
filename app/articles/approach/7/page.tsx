import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'

export default function ApproachPage7() {
  const content = (
    <Fragment>
      <p>
        The examples of the internet, cultural evolution, and the stock market – not to mention prediction markets! – suggest that the most accurate information is produced at scale by a decentralized mass of actors with an incentive for the right answers to bubble to the top. First-principles speculation only goes so far – it just isn’t possible for one person or team to process as much information as a network can.      
      </p>
      <p>
        The way to use this principle to figure out which projects will work is to find ways to try lots of projects quickly: the higher the speed and greater the volume, the more effective the information-gathering. In 2023, Manifund’s first year of operations, the platform sent $2.06 million in funds to 88 projects. One of our explicit goals is to offer grantees turnaround times measured in weeks or even days instead of months. We hypothesize that timing is an underrated issue for projects that are smaller, newer, and/or run by individuals, as opposed to projects that are already ongoing or are part of existing organizations: it’s difficult to arrange your life so that you’ll be free in several months for an opportunity that might or might not materialize. In these cases, agility and speed fill a critical gap for applicants who would otherwise have been prohibitively inconvenienced by long turnaround times.
      </p>
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Effective Iteration"
    prevLink="/articles/approach/6"
    nextLink="/articles/approach/8"
    nextLinkText="Next: What about different value systems?"
    content={content}
  />
}