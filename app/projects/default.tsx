import Link from 'next/link'

export default function ProjectDefaults(props: { params: { slug: string } }) {
  const { params } = props
  return (
    <div>
      <h1>Project Defaults</h1>
      <nav>
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
      </nav>
    </div>
  )
}
