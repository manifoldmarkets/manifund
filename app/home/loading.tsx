import { Col } from '@/components/layout/col'

export default function HomeLoading() {
  return (
    <Col className="gap-8 px-3 py-5 sm:px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
      </div>

      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-20 rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </Col>
  )
}
