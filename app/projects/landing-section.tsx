import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { Row } from '@/components/layout/row'
import Image from 'next/image'
import Link from 'next/link'

export function LandingSection() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-10 sm:px-8">
      <div className="relative mx-auto mb-5 w-fit rounded-full px-3 py-1 text-xs leading-6 ring-1 ring-white ring-opacity-20 hover:bg-white hover:bg-opacity-20">
        <span className="text-white text-opacity-50">
          Support our mission.{' '}
        </span>
        <a href="/about/donate" className="font-semibold text-white">
          Read more <ArrowLongRightIcon className="inline h-4 w-4 stroke-2" />
        </a>
      </div>
      <Row className="flex-2">
        <div>
          <p className="text-center text-3xl font-medium text-white shadow-rose-500 text-shadow-lg sm:text-4xl">
            the market for grants
          </p>
          <p className="mb-8 mt-4 text-center text-xs text-white sm:mt-5 sm:text-sm">
            Manifund is the marketplace for awesome new charities. Find
            impactful projects, buy impact certs, and weigh in on what gets
            funded.
          </p>
          <Row className="justify-center gap-3 text-sm">
            <Link
              className="group rounded-lg bg-white px-3 py-2 text-white ring-2 ring-white hover:bg-transparent"
              href="/login"
            >
              <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold text-transparent group-hover:text-white">
                Get started
              </span>
            </Link>
          </Row>
        </div>
        <Image
          className="hidden max-h-fit w-48 object-contain lg:block"
          src="/SolidWhiteManifox.png"
          alt="Manifox"
          width={1000}
          height={1000}
        />
      </Row>
    </div>
  )
}
