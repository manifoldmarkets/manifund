import Link from 'next/link'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { ReactNode } from 'react'

export default function ArticlePage(props: {
  articleTitle: string,
  pageTitle: string,
  prevLink?: string,
  nextLink?: string,
  nextLinkText?: string,
  content: ReactNode
}) {
  const { articleTitle, pageTitle, prevLink, nextLink, nextLinkText,
    content } = props
  return (
    <div className="prose mx-auto p-5 font-light">
      <h1 className="relative top-5">
        {articleTitle}
      </h1>
      <h2>
        {pageTitle}
      </h2>
      {content}
      <div className="flex justify-between">
        {prevLink &&
          <Link
            href={prevLink}
            className="text-md font-semibold text-orange-500"
          >
            <ArrowLongLeftIcon className="mr-1 inline h-6 w-6 stroke-2" />
            Previous
          </Link>
        }
        {nextLink && nextLinkText &&
          <Link
            href={nextLink}
            className="text-md font-semibold text-orange-500"
          >
            {nextLinkText}
            <ArrowLongRightIcon className="ml-1 inline h-6 w-6 stroke-2" />
          </Link>
        }
      </div>
    </div>
  )
}