'use client'

import { Row } from '@/components/layout/row'
import { LinkIcon, EyeIcon } from '@heroicons/react/24/outline'

export function ViewerActionPanel() {
  return (
    <Row className="flex items-center justify-end gap-3">
      <LinkIcon className="h-5 w-5 stroke-2 text-gray-600" />
      <EyeIcon className="h-5 w-5 stroke-2 text-gray-600" />
    </Row>
  )
}
