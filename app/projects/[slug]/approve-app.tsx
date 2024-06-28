import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { Project } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AppStage = 'proposal' | 'not funded' | 'active' | null

// A component that allows a grantmaker to approve or reject a proposal,
// and to determine how much to fund it with, if approved.
export function JudgeApp(props: { project: Project }) {
  const { project } = props
  const router = useRouter()
  const [appStage, setAppStage] = useState<AppStage>(null)
  const [amount, setAppAmount] = useState<number>(0)
  return (
    <Col className="mt-4 max-w-md gap-4 rounded-xl border border-gray-500 p-4">
      <h2 className="text-xl font-semibold">Evaluate for LTFF</h2>

      <HorizontalRadioGroup
        options={{
          approve: 'Approve',
          reject: 'Reject',
        }}
        value={appStage === 'active' ? 'approve' : 'reject'}
        onChange={(value) => {
          setAppStage(value === 'approve' ? 'active' : 'not funded')
        }}
      />

      {appStage === 'active' && (
        <>
          Amount to fund ($)
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAppAmount(parseInt(e.target.value))}
            placeholder="Amount"
          />
        </>
      )}
      <Button
        onClick={async () => {
          try {
            await fetch('/api/judge-app', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: project.id,
                causeSlug: 'ltff',
                decision: appStage === 'active' ? 'approve' : 'reject',
                funding: amount,
              }),
            })
          } catch (e) {
            console.error(e)
          }
          router.refresh()
        }}
      >
        {appStage === 'active' ? 'Approve' : 'Reject'} {project.title}
      </Button>
    </Col>
  )
}
