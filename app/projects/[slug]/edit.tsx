'use client'

import { Button, IconButton } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { Project, ProjectWithCauses, TOTAL_SHARES } from '@/db/project'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { AmountInput, Input } from '@/components/input'
import { useRouter } from 'next/navigation'
import { Col } from '@/components/layout/col'
import { Cause, CertParams, MiniCause } from '@/db/cause'
import { SelectCauses } from '@/components/select-causes'
import { isAdmin } from '@/db/txn'
import {
  calcInitialValuation,
  InvestmentStructurePanel,
} from '@/app/create/investment-structure'
import { Bid } from '@/db/bid'
import { getProposalValuation } from '@/utils/math'

export function Edit(props: {
  project: ProjectWithCauses
  bids: Bid[]
  causesList: MiniCause[]
  prizeCauses: Cause[]
}) {
  const { project, causesList, prizeCauses } = props
  const { session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const [selectedCauses, setSelectedCauses] = useState(project.causes)
  const [minFunding, setMinFunding] = useState<number | undefined>(
    project.min_funding
  )
  const [founderPercent, setFounderPercent] = useState(
    (project.founder_shares / TOTAL_SHARES) * 100
  )

  const [saving, setSaving] = useState(false)
  const selectableCauses = causesList.filter((cause) => {
    return !prizeCauses.find((prizeCause) => prizeCause.slug === cause.slug)
  })
  const prizeCause = prizeCauses.find((cause) =>
    project.causes.find((c) => c.slug === cause.slug)
  )
  const certParams = prizeCause?.cert_params
  const router = useRouter()
  const editor = useTextEditor(project.description ?? '')
  if (!user || (!isAdmin(user) && user.id !== project.creator)) {
    return null
  }

  async function saveText() {
    setSaving(true)
    const description = editor?.getJSON()
    await fetch('/api/edit-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        title,
        subtitle,
        description,
        causeSlugs: selectedCauses.map((cause) => cause.slug),
        // TODO: handle these variables on the backend
        minFunding,
        founderPercent,
      }),
    })
    setShowEditor(false)
    setSaving(false)
    router.refresh()
  }
  return (
    <div>
      {showEditor ? (
        <Col className="gap-3">
          <Col className="gap-1">
            <label>Title</label>
            <Col>
              <Input
                maxLength={80}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <span className="text-right text-xs text-gray-600">
                Maximum 80 characters
              </span>
            </Col>
          </Col>
          <Col className="gap-1">
            <label>Subtitle</label>
            <Col>
              <Input
                maxLength={160}
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
              />
              <span className="text-right text-xs text-gray-600">
                Maximum 160 characters
              </span>
            </Col>
          </Col>
          <Col className="gap-1">
            <label>Description</label>
            <TextEditor editor={editor} />
          </Col>
          <Col className="gap-1">
            <label>Causes</label>
            <SelectCauses
              causesList={selectableCauses}
              selectedCauses={selectedCauses}
              setSelectedCauses={setSelectedCauses}
            />
          </Col>
          <Col className="gap-1">
            <label>Minimum funding</label>
            <Col>
              <AmountInput
                type="number"
                amount={minFunding}
                onChangeAmount={setMinFunding}
              />
            </Col>
          </Col>
          {certParams && certParams.adjustableInvestmentStructure && (
            <InvestmentStructurePanel
              minFunding={minFunding ?? 0}
              founderPercent={founderPercent}
              setFounderPercent={setFounderPercent}
              certParams={certParams}
            />
          )}
          <Row className="mt-3 justify-center gap-5">
            <Button
              color="gray"
              onClick={() => setShowEditor(false)}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Tooltip text={title ? '' : 'Enter a project title.'}>
              <Button
                onClick={saveText}
                disabled={saving || !title}
                loading={saving}
                className="font-semibold"
              >
                Save
              </Button>
            </Tooltip>
          </Row>
        </Col>
      ) : (
        <Row className="justify-end">
          <IconButton size="sm" onClick={() => setShowEditor(true)}>
            <Tooltip text="Edit project">
              <div className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600">
                <PencilIcon className="h-10 w-10 p-2 text-white" aria-hidden />
              </div>
            </Tooltip>
          </IconButton>
        </Row>
      )}
    </div>
  )
}

function getEditError(
  project: Project,
  bids: Bid[],
  title: string,
  certParams?: CertParams,
  minFunding?: number,
  founderPercent?: number
) {
  const fundingBids = bids.filter((bid) =>
    project.type === 'grant'
      ? bid.type === 'donate'
      : bid.type === 'assurance buy'
  )
  const totalRaised = fundingBids.reduce((total, bid) => total + bid.amount, 0)
  const currentValuation = getProposalValuation(project)
  const newValuation =
    certParams && minFunding && founderPercent
      ? calcInitialValuation(certParams, minFunding, founderPercent)
      : 0
  const minMinFunding = certParams ? certParams.minMinFunding : 500
  if (!title) {
    return 'Enter a project title'
  } else if (project.type === 'cert' && !certParams) {
    return 'Something went wrong'
  } else if (!minFunding) {
    return 'Enter a minimum funding amount'
  } else if (minFunding < minMinFunding) {
    return `Your minimum funding must be at least $${minMinFunding}`
  }
  const neededToProceed =
    project.type === 'grant'
      ? minFunding
      : ((certParams?.ammShares ?? 0) / TOTAL_SHARES) * newValuation +
        minFunding
  if (neededToProceed < totalRaised) {
    return `Since you've already raised $${totalRaised}, you must set your minimum funding such that the amount needed to proceed to the active stage is less than or equal to $${totalRaised}`
  }
  if (fundingBids.length > 0 && newValuation > currentValuation) {
    return 'Cannot increase valuation while there are existing bids'
  }
}
