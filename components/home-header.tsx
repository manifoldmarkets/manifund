import { Row } from '@/components/layout/row'

interface HomeHeaderProps {
  title: string
  viewAllLink: string
}

export function HomeHeader({ title, viewAllLink }: HomeHeaderProps) {
  return (
    <>
      <div className="my-4 flex items-center justify-center">
        <div className="h-px flex-1 bg-gray-300"></div>
        <h2 className="px-6 font-serif text-2xl tracking-wide text-gray-700">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gray-300"></div>
      </div>
      <Row className="justify-end">
        <a
          href={viewAllLink}
          className="font-serif text-sm italic text-gray-600 hover:text-gray-900"
        >
          View all →
        </a>
      </Row>
    </>
  )
}
