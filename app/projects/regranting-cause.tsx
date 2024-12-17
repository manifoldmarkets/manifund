import Image from 'next/image'
import Link from 'next/link'
import { Col } from '@/components/layout/col'

export function RegrantingCause() {
  return (
    <Link
      className="relative flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md sm:flex-row"
      href="/about/regranting"
    >
      <Image
        src="https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/round-header-images/regrants/getty-images-a3BzdnbjSSM-unsplash.jpg"
        width={240}
        height={120}
        className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover sm:aspect-[5/3] sm:w-60"
        alt="round header image"
      />
      <Col className="w-full justify-between">
        <Col className="mb-5 gap-2">
          <p className="text-lg font-semibold leading-tight lg:text-xl">
            AI Safety Regranting
          </p>
          <span className="text-sm text-gray-600 sm:text-base">
            We&apos;ve delegated $1.5m to experts in AI safety, who can
            independently recommend grants based on their knowledge of the
            field.
          </span>
        </Col>
      </Col>
    </Link>
  )
}
