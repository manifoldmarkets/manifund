'use client'
import { Col } from '@/components/layout/col'
import Image from 'next/image'
import { AdjustmentsHorizontalIcon, PhoneIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useSupabase } from '@/db/supabase-provider'
import { Row } from '@/components/layout/row'

export default function DonatePage() {
  const { supabase, session } = useSupabase()
  const user = session?.user
  return (
    <div>
      <div className="grid w-full grid-cols-1 gap-8 rounded-b-lg bg-gradient-to-r from-orange-500 to-rose-500 p-5 sm:grid-cols-2">
        <Col className="flex flex-col justify-between gap-4 sm:h-full">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Ways to give
          </h1>
          <p className="text-white text-opacity-80">
            Our donation options offer a range of flexibility and control: you
            can choose whichever one feels right given your level of trust in us
            and our regrantors and the amount of time and thought you want to
            put into your giving.
          </p>
          <Row className="w-full justify-center gap-5">
            <SignInButton />
            <BookCallButton />
          </Row>
        </Col>
        <div className="mx-auto max-w-7xl">
          <Col className="mx-auto max-w-2xl gap-6 text-base leading-7 text-gray-600">
            <div className="relative rounded-lg bg-white px-4 pt-4 pb-6 pl-10">
              <div className="inline font-semibold text-gray-900  ">
                <Image
                  className="absolute left-3 top-5 h-5 w-5 stroke-2 text-orange-600"
                  src="/SolidOrangeManifox.png"
                  alt="Manifox"
                  width={1000}
                  height={1000}
                />
                General regranting
              </div>
              <p className="text-sm text-gray-500">
                This will be used to onboard new regrantors and to raise the
                budgets of regrantors with strong track records. We may use up
                to 5% to cover our operations.
              </p>
            </div>
            <div className="relative rounded-lg bg-white px-4 pt-4 pb-6 pl-10">
              <div className="inline font-semibold text-gray-900">
                <AdjustmentsHorizontalIcon
                  className="absolute left-3 top-5 h-5 w-5 stroke-2 text-orange-500"
                  aria-hidden="true"
                />
                Custom allocation
              </div>
              <div className="text-sm text-gray-500">
                After adding money to your Manifund account, you can distribute
                it among:
                <ul className="ml-5 list-disc">
                  <li>Regrantors</li>
                  <li>Projects</li>
                  <li>Coming soon: cause-specific funds</li>
                </ul>
              </div>
            </div>
          </Col>
        </div>
      </div>
    </div>
  )
}

function BookCallButton() {
  return (
    <a
      className="group flex w-fit items-center gap-1 rounded-lg bg-white p-2 pr-3 text-white ring-2 ring-white hover:bg-transparent sm:p-3 sm:pr-4"
      href="https://calendly.com/rachel-weinberg/manifund-1-1s"
      target="_blank"
    >
      <PhoneIcon className="h-4 w-4 text-orange-500 group-hover:animate-[wiggle_0.12s_cubic-bezier(0.99,0,0.99,3.0)_infinite] group-hover:text-white md:h-5 md:w-5" />
      <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold text-transparent group-hover:text-white md:text-base">
        Book a call!
      </span>
    </a>
  )
}

function SignInButton() {
  return (
    <Link
      className="group flex w-fit items-center gap-1 rounded-lg p-2 text-white ring-2 ring-white hover:bg-white sm:p-3"
      href="/login"
    >
      <span className="from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold group-hover:bg-gradient-to-r group-hover:text-transparent md:text-base">
        Sign in to donate
      </span>
    </Link>
  )
}
