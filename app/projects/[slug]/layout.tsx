import { Tabs } from '@/components/tabs'
import Link from 'next/link'

export default function ProjectLayout(props: {
  children: React.ReactNode
  predictions: React.ReactNode
  params: { slug: string }
}) {
  const { children, predictions } = props
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <nav>Project layout</nav>
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
      {predictions}
      {/* <Tabs
        tabs={[
          {
            name: 'predictions',
            id: 'predictions',
            display: predictions as JSX.Element,
          },
          {
            name: 'evals',
            id: 'evals',
            display: evals as JSX.Element,
          },
        ]}
      /> */}

      {children}
    </section>
  )
}
