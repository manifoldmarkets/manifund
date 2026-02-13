'use client'

import { Profile } from '@/db/profile'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { Avatar } from '@/components/avatar'
import Link from 'next/link'
import { formatMoney } from '@/utils/formatting'
import { Card } from '@/components/layout/card'
import { UserLink } from '@/components/user-link'
import { Tag } from '@/components/tags'

// Example data structure - in real app would come from database
const EXAMPLE_GRANTS = [
  {
    regrantor_name: 'Neel Nanda',
    project_title: 'Mechanistic Interpretability Research for Unfaithful Chain of Thought',
    project_slug:
      'mechanistic-interpretability-research-for-unfaithful-chain-of-thought-1-month?tab=comments#700a0335-b141-46b2-ac78-e661aa1e2961',
    amount: 11_000,
    explanation: `I think that understanding, detecting and potentially mitigating chain of thought unfaithfulness is a very important problem, especially with the rise of o1 models... I think Arthur is fairly good at supervising projects, and that under him Jett and Ivan have a decent shot of making progress, and that enabling this to start a month earlier is clearly a good idea.`,
  },
  {
    regrantor_name: 'Leopold Aschenbrenner',
    project_title: 'Pilot for new benchmark by Epoch AI',
    project_slug:
      'pilot-for-new-benchmark-by-epoch-ai?tab=comments#09a84b12-bdde-e76a-ca30-a78e4d2a3345',
    amount: 200_000,
    explanation: `I think Epoch has done truly outstanding work on core trends in AI progress in the past few years. I'm also excited by their recent foray into benchmarking in the form of FrontierMath... Better benchmarks that help us forecast time to AGI (and especially time to relevant capabilities, such as automated AI research) and do so in a highly credible and scientific way are very valuable for informing policymakers and catalyzing important policy efforts.`,
  },
  {
    regrantor_name: 'Adam Gleave',
    project_title: 'Next steps in developmental interpretability',
    project_slug:
      'next-steps-in-developmental-interpretability?tab=comments#a420eafd-8983-4abc-b92e-b20cb9424688',
    amount: 50_000,
    explanation: `I've generally been impressed by how well Timaeus have executed. They've in short order assembled a strong team who are collaborating & working well together, producing substantial research and outreach outputs. They have a distinctive research vision, and I think deserve some credit for popularizing studying the evolution of networks throughout training from an interpretability perspective with e.g. EleutherAI's interpretability team now pursuing their own "development interpretability" flavored research.`,
  },
]

export function ExampleRegrants({ regrantors }: { regrantors: Profile[] }) {
  return (
    <Col className="my-6 space-y-6">
      {EXAMPLE_GRANTS.map((grant) => {
        const regrantor = regrantors.find((r) => r.full_name === grant.regrantor_name)
        if (!regrantor) return null

        return (
          <div key={grant.project_slug}>
            <div className="ml-10">
              <Link href={`/projects/${grant.project_slug}`}>
                {/* <Tag
                  text={`${formatMoney(grant.amount)} to ${
                    grant.project_title
                  }`}
                  className="hover:bg-orange-200"
                /> */}
                <Tag text={grant.project_title} className="hover:bg-orange-200" />
              </Link>
            </div>
            <Row className="w-full gap-2">
              <Link href={`/${regrantor.username}`}>
                <Avatar
                  username={regrantor.username}
                  avatarUrl={regrantor.avatar_url}
                  id={regrantor.id}
                  className="mt-1"
                  size="sm"
                  noLink
                />
              </Link>
              <Card className="relative w-full max-w-xl rounded-xl rounded-tl-sm px-4 py-2 pb-4">
                <Row className="mb-2 w-full items-center">
                  <Row className="items-center justify-between gap-1">
                    <UserLink
                      name={regrantor.full_name}
                      username={regrantor.username}
                      className="text-sm font-semibold"
                    />
                    <div className="rounded-full text-sm font-semibold">
                      <span className="font-light">gave</span> {formatMoney(grant.amount)}
                    </div>
                  </Row>
                </Row>
                <blockquote className="relative whitespace-pre-line text-sm font-light text-gray-700">
                  &ldquo;{grant.explanation}&rdquo;
                </blockquote>
              </Card>
            </Row>
          </div>
        )
      })}
    </Col>
  )
}
