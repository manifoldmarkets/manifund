'use client'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { useState } from 'react'

type TaxFlags = {
  w9Received: boolean
  w8Received: boolean
  determinationLetterOnFile: boolean
  foreignWithholding: boolean
}

// Staff-only. The forms themselves are collected over email, as before; this
// just records that we have them, at the point where an admin is already
// looking at the agreement to countersign it.
export function AdminTaxPanel(props: {
  projectId: string
  taxId: string | null
  signatoryEmail: string | null
  initial: TaxFlags
}) {
  const { projectId, taxId, signatoryEmail, initial } = props
  const [flags, setFlags] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (patch: Partial<TaxFlags>) => {
    setFlags({ ...flags, ...patch })
    setSaved(false)
  }

  async function save() {
    setIsSaving(true)
    setError(null)
    const res = await fetch('/api/update-agreement-tax-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...flags }),
    })
    setIsSaving(false)
    if (!res.ok) {
      setError((await res.text()) || 'Could not save.')
      return
    }
    setSaved(true)
  }

  const rows: { key: keyof TaxFlags; label: string }[] = [
    { key: 'w9Received', label: 'W-9 received' },
    { key: 'w8Received', label: 'W-8 received' },
    { key: 'determinationLetterOnFile', label: '501(c)(3) determination letter on file' },
    { key: 'foreignWithholding', label: 'Subject to foreign withholding' },
  ]

  return (
    <Col className="gap-4 rounded-md border border-dashed border-gray-400 bg-gray-50 p-5">
      <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Admin only
      </span>
      <Col className="gap-1 text-sm text-gray-700">
        <span>
          <strong>EIN:</strong> {taxId || 'none on file'}
        </span>
        <span>
          <strong>Signatory email:</strong> {signatoryEmail || 'none on file'}
        </span>
      </Col>
      <Col className="gap-2">
        {rows.map((row) => (
          <Row key={row.key} className="items-center gap-3">
            <Checkbox
              id={`tax-${row.key}`}
              checked={flags[row.key]}
              onChange={(e) => set({ [row.key]: e.target.checked } as Partial<TaxFlags>)}
            />
            <label htmlFor={`tax-${row.key}`} className="text-sm text-gray-900">
              {row.label}
            </label>
          </Row>
        ))}
      </Col>
      <Row className="items-center justify-end gap-3">
        {saved && <span className="text-sm text-gray-500">Saved.</span>}
        {error && <span className="text-sm text-rose-600">{error}</span>}
        <Button color="gray" onClick={save} loading={isSaving}>
          Save
        </Button>
      </Row>
    </Col>
  )
}
