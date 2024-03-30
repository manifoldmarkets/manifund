import Link from 'next/link'
import { ArrowLongRightIcon } from '@heroicons/react/20/solid'

export default function ArticlePage(props: {
  articleTitle: string,
  pageTitle: string,
  nextLink: string,
  nextLinkText: string,
  content: string
}) {
  const { articleTitle, pageTitle, nextLink, nextLinkText, content } = props
    return (
      <div className="prose mx-auto p-5 font-light">
        <h1 className="relative top-5">
          {articleTitle}
        </h1>
        <h2>
          {pageTitle}
        </h2>
        {content}
        <Link
            href={nextLink}
            className="w-full text-right float-right text-md font-semibold \
              text-orange-500"
          >
            {nextLinkText}
            <ArrowLongRightIcon className="ml-1 inline h-6 w-6 stroke-2" />
          </Link>
      </div>
    )
  }
}