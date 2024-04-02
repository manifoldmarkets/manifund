import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'
import Link from 'next/link'

export default function ApproachPage9() {
  const content = (
    <Fragment>
      <p>
        If you’re interested in learning more about or getting involved with Manifund’s flavor of funding innovations,
        we’d love to hear from you.
      </p>
      <ul>
        <li>
          Apply for grant funding through our <Link href="/about/open-call">open call</Link> process,
          or through one of our <Link href="/causes">programs</Link>.
        </li>
        <li>
          Donate to a <Link href="/projects">project</Link> or invest in its impact certificates.  
        </li>
        <li>
          Keep up with Manifund on <Link href="https://manifund.substack.com/">Substack</Link> and <Link href="https://twitter.com/manifund">Twitter</Link>.
        </li>
        <li>
          Join the <Link href="https://discord.gg/ZGsDMWSA5Q">Discord</Link>.
        </li>
      </ul>
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="How You Can Get Involved"
    prevLink="/articles/approach/8"
    content={content}
  />
}