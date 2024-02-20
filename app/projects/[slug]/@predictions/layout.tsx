import Link from 'next/link'

export default function Layout(props: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const { children } = props
  return (
    <>
      @predictions layout
      {/* <nav>
        <Link
          href={`/projects/${props.params.slug}/pageviews`}
          className="text-green-500"
        >
          Page Views
        </Link>
        <Link
          href={`/projects/${props.params.slug}/visitors`}
          className="text-blue-500"
        >
          Visitors
        </Link>
      </nav> */}
      <div>{children}</div>
    </>
  )
}
