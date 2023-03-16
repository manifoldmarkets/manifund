'use client'
import { Button } from '@/components/button'
import { Database } from '@/db/database.types'
import { useState } from 'react'

type Project = Database['public']['Tables']['projects']['Row']
export function CloseBidding(props: { project: Project }) {
  const { project } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Button
      className="max-w-xs"
      color="gray"
      loading={isSubmitting}
      onClick={async () => {
        setIsSubmitting(true)
        await closeBidding(project)
        setIsSubmitting(false)
      }}
    >
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
      minFunding: project.min_funding,
      founderShares: project.founder_portion,
      creator: project.creator,
    }),
  })
  const res = await response.json()
  return res
}
