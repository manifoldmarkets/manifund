import { Col } from '@/components/layout/col'
import Image from 'next/image'
import { AdjustmentsHorizontalIcon, HeartIcon } from '@heroicons/react/20/solid'

export default function DonatePage() {
  return (
    <Col className="w-full gap-10 rounded-b-lg bg-gradient-to-r from-orange-500 to-rose-500 p-5 sm:p-10">
      <h1 className="text-center text-4xl font-bold text-white">
        Donate to Manifund regranting
      </h1>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2">
          <div className="relative rounded-lg bg-white px-4 pt-4 pb-6 pl-10">
            <div className="inline font-semibold text-gray-900">
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
              budgets of regrantors with the strongest track records. We may use
              up to 5% to cover our operations.
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
              After adding money to your Manifund account, you can distribute it
              among:
              <ul className="ml-5 list-disc">
                <li>Regrantors</li>
                <li>Projects</li>
                <li>Coming soon: cause-specific funds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Col>
  )
}
