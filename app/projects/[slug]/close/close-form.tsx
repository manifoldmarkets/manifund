'use client'

import { Button } from '@/components/button'
import { TextEditor } from '@/components/editor'
import { Col } from '@/components/layout/col'
import { useTextEditor } from '@/hooks/use-text-editor'
import { useRouter } from 'next/navigation'
const REPORT_OUTLINE = `
<h3>Description of subprojects and results, including major changes from the original proposal</h3>
</br>
<h3>Spending breakdown</h3>
</br>
`
export function CloseProjectForm(props: { projectSlug: string }) {
  const { projectSlug } = props
  const REPORT_KEY = `${projectSlug}Report`
  const editor = useTextEditor(REPORT_OUTLINE, REPORT_KEY)
  const router = useRouter()
  return (
    <Col className="items-center gap-5">
      <TextEditor editor={editor} />
      <Button
        size="lg"
        onClick={() => {
          const report = editor?.getJSON()
          // TODO: add API call
          router.push(`/projects/${projectSlug}`)
        }}
      >
        Submit
      </Button>
    </Col>
  )
}
