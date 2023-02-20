//this component is temporary for testing purposes
'use client'
import { Button } from '@/components/button'
import { Database } from '@/db/database.types'

type Project = Database['public']['Tables']['projects']['Row']
export function CloseBidding(props: { project: Project }) {
  const { project } = props
  return (
    <Button className="max-w-md" onClick={() => closeBidding(project)}>
      Close Bidding
    </Button>
  )
}

async function closeBidding(project: Project) {
  const response = await fetch('/api/close-bidding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: project.id,
      title: project.title,
      blurb: project.blurb,
      min_funding: project.min_funding,
      founder_portion: project.founder_portion,
    }),
  })
  const res = await response.json()
  return res
}
