'use client'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { ProjectAndProfile } from '@/db/project'
import { usePDF } from 'react-to-pdf'
import { GrantAgreement } from './grant-agreement'
import { SignAgreement } from './sign-agreement'

export function GrantAgreementPageContent(props: {
  project: ProjectAndProfile
  userId?: string
}) {
  const { project, userId } = props
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' })
  return (
    <div>
      <Button onClick={() => toPDF()}>Download PDF</Button>
      <Col className="gap-5 p-5" ref={targetRef}>
        <GrantAgreement project={project} />
        {userId === project.creator && !project.signed_agreement && (
          <SignAgreement project={project} />
        )}
      </Col>
    </div>
  )
}
