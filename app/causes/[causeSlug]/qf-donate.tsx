'use client'

import { useState } from 'react'
import { Button } from '@/components/button'

type Project = {
  id: string
  title: string
}

type Props = {
  projects: Project[]
  matchAmounts: Record<string, number>
}

export function QuadraticMatchDonateButton({ projects, matchAmounts }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDonate = async () => {
    let totalDonated = 0
    setIsLoading(true)
    try {
      for (const project of projects) {
        // Round amounts up to nearest dollar
        const amount = Math.ceil(matchAmounts[project.id] || 0)
        if (amount > 10) {
          console.log('Donating to project', project.title, project.id, amount)
          await fetch('/api/place-bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              valuation: 0,
              amount,
              type: 'donate',
            }),
          })
          totalDonated += amount
        }
      }
      alert(`Donations completed successfully! Total donated: $${totalDonated}`)
    } catch (error) {
      console.error('Error donating:', error)
      alert('An error occurred while donating. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDonate} disabled={isLoading}>
      {isLoading ? 'Donating...' : 'Donate Quadratic Match'}
    </Button>
  )
}
