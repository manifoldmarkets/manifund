import { Row } from '@/components/layout/row'
import {
  CheckIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/20/solid'

export function ProposalStepsOutline(props: {
  approved: boolean
  signedAgreement: boolean
  reachedMinFunding: boolean
  projectSlug: string
}) {
  const { approved, signedAgreement, projectSlug, reachedMinFunding } = props
  const requirements = [
    {
      name: 'Sign grant agreement',
      complete: signedAgreement,
      href: `/projects/${projectSlug}/agreement`,
    },
    {
      name: 'Reach minimum funding goal',
      complete: reachedMinFunding,
      href: null,
    },
    {
      name: 'Get Manifund admin approval',
      complete: approved,
      href: null,
    },
  ]
  return (
    <Row
      role="list"
      className="relative w-full justify-between gap-2 rounded-xl border border-gray-300"
    >
      <p className="absolute -top-2 left-2 bg-gray-50 px-2 text-xs text-gray-500">
        Steps to funding
      </p>
      {requirements.map((req) => (
        <Row key={req.name} className="relative px-2">
          {req.complete ? (
            <Row className="w-full items-center">
              <Row className="items-center py-3 text-xs">
                <Row className="h-4 w-4 items-center justify-center rounded-full bg-orange-600">
                  <CheckIcon
                    className="h-3 w-4 text-white"
                    aria-hidden="true"
                  />
                </Row>
                {req.href ? (
                  <a href={req.href} className="ml-2  text-gray-900">
                    {req.name}
                  </a>
                ) : (
                  <span className="ml-2 text-gray-900">{req.name}</span>
                )}
              </Row>
            </Row>
          ) : (
            <Row className="items-center">
              <Row className="items-center py-3 text-xs">
                <Row className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300">
                  <EllipsisHorizontalCircleIcon
                    className="h-4 w-4 text-gray-300"
                    aria-hidden="true"
                  />
                </Row>
                {req.href ? (
                  <a
                    href={req.href}
                    className="ml-2 text-gray-500 hover:underline"
                  >
                    {req.name}
                  </a>
                ) : (
                  <span className="ml-2 text-gray-500">{req.name}</span>
                )}
              </Row>
            </Row>
          )}
        </Row>
      ))}
    </Row>
  )
}
