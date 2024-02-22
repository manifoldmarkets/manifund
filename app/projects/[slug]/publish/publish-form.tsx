'use client'

import { useState } from 'react'
import { AmountInput, Input } from '@/components/input'
import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { ProjectWithCauses, TOTAL_SHARES } from '@/db/project'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import Link from 'next/link'
import { add, format } from 'date-fns'
import { Col } from '@/components/layout/col'
import { RequiredStar } from '@/components/tags'
import { clearLocalStorageItem } from '@/hooks/use-local-storage'
import { Row } from '@/components/layout/row'
import { Cause, MiniCause, SimpleCause } from '@/db/cause'
import { SelectCauses } from '@/components/select-causes'
import { InvestmentStructurePanel } from '@/components/investment-structure'
import { Tooltip } from '@/components/tooltip'
import { Checkbox } from '@/components/input'
import { usePartialUpdater } from '@/hooks/user-partial-updater'
import { JSONContent } from '@tiptap/core'
import { roundLargeNumber } from '@/utils/formatting'
import { getCreateProjectErrorMessage } from '@/app/create/create-project-form'
import { createUpdateFromParams } from '@/utils/upsert-project'

export type ProjectParams = {
  title: string
  subtitle: string | null
  minFunding?: number
  fundingGoal?: number
  verdictDate: string
  description?: JSONContent | string
  location: string
  selectedCauses: MiniCause[]
  selectedPrize: Cause | null
  founderPercent: number
  agreedToTerms: boolean
  lobbying: boolean
}

export function PublishProjectForm(props: {
  project: ProjectWithCauses
  causesList: SimpleCause[]
  prizeCause?: Cause
}) {
  const { causesList, prizeCause, project } = props
  const [projectParams, updateProjectParams] = usePartialUpdater<ProjectParams>(
    {
      title: project.title,
      subtitle: project.blurb,
      minFunding: project.min_funding,
      fundingGoal: project.funding_goal,
      verdictDate: format(
        new Date(project.auction_close ?? add(new Date(), { months: 1 })),
        'yyyy-MM-dd'
      ),
      location: project.location_description ?? '',
      selectedCauses: project.causes,
      selectedPrize: prizeCause ?? null,
      founderPercent: prizeCause
        ? roundLargeNumber(
            (1 -
              (prizeCause.cert_params?.defaultInvestorShares ?? 0) /
                TOTAL_SHARES) *
              100
          )
        : (project.founder_shares * TOTAL_SHARES) / 100,
      agreedToTerms: false,
      lobbying: false,
    }
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const descriptionKey = `ProjectDescription${project.slug}`
  const editor = useTextEditor(project.description, descriptionKey)
  const selectableCauses = causesList.filter(
    (cause) => cause.open && !cause.prize
  )
  const minMinFunding = projectParams.selectedPrize?.cert_params
    ? projectParams.selectedPrize.cert_params.minMinFunding
    : 500
  const certParams = projectParams.selectedPrize?.cert_params ?? null
  const errorMessage = getCreateProjectErrorMessage(
    projectParams,
    minMinFunding
  )

  const router = useRouter()
  const cancel = () => {
    router.push(`/projects/${project.slug}`)
  }
  const save = async () => {
    setIsSubmitting(true)
    const finalDescription = editor?.getJSON() ?? '<p>No description</p>'
    await fetch('/api/edit-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectUpdate: createUpdateFromParams({
          ...projectParams,
          description: finalDescription,
        }),
        causeSlugs: projectParams.selectedCauses.map((cause) => cause.slug),
        projectId: project.id,
      }),
    })
    router.push(`/projects/${project.slug}`)
    clearLocalStorageItem(descriptionKey)
    setIsSubmitting(false)
  }
  const publish = async () => {
    setIsSubmitting(true)
    const finalDescription = editor?.getJSON() ?? '<p>No description</p>'
    await fetch('/api/publish-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...projectParams, description: finalDescription }),
    })
    router.push(`/projects/${project.slug}`)
    clearLocalStorageItem(descriptionKey)
    setIsSubmitting(false)
  }
  return (
    <Col className="gap-4 p-5">
      <div className="flex flex-col md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold">Edit & publish your project</h1>
      </div>
      <Col className="gap-1">
        <label htmlFor="title">
          Title
          <RequiredStar />
        </label>
        <Col>
          <Input
            type="text"
            id="title"
            autoComplete="off"
            maxLength={80}
            value={projectParams.title}
            onChange={(event) =>
              updateProjectParams({ title: event.target.value })
            }
          />
          <span className="text-right text-xs text-gray-600">
            Maximum 80 characters
          </span>
        </Col>
      </Col>
      <Col className="gap-1">
        <label htmlFor="subtitle">Subtitle</label>
        <Col>
          <Input
            type="text"
            id="subtitle"
            autoComplete="off"
            maxLength={160}
            value={projectParams.subtitle ?? ''}
            onChange={(event) =>
              updateProjectParams({ subtitle: event.target.value })
            }
          />
          <span className="text-right text-xs text-gray-600">
            Maximum 160 characters
          </span>
        </Col>
      </Col>
      <Col className="gap-1">
        <Row className="items-center justify-between">
          <label>
            Project description
            <RequiredStar />
          </label>
        </Row>
        <p className="text-sm text-gray-500">
          Note that the editor offers formatting shortcuts{' '}
          <Link
            className="hover:underline"
            href="https://www.notion.so/help/keyboard-shortcuts#markdown-style"
          >
            like Notion
          </Link>{' '}
          for hyperlinks, bullet points, headers, and more.
        </p>
        <TextEditor editor={editor} />
      </Col>
      {(!projectParams.selectedPrize || certParams?.proposalPhase) && (
        <Col className="gap-1">
          <label htmlFor="minFunding" className="mr-3 mt-4">
            Minimum funding (USD)
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            The minimum amount of funding you need to start this project. If
            this amount is not reached, no funds will be sent. Due to the cost
            of approving grants and processing payments, we require this to be
            at least ${minMinFunding}.
          </p>
          <Col>
            <AmountInput
              id="minFunding"
              amount={projectParams.minFunding}
              onChangeAmount={(newMin) =>
                updateProjectParams({ minFunding: newMin })
              }
              placeholder={minMinFunding.toString()}
              error={
                projectParams.minFunding !== undefined &&
                projectParams.minFunding < minMinFunding
              }
              errorMessage={`Minimum funding must be at least $${minMinFunding}.`}
            />
          </Col>
        </Col>
      )}
      {!!certParams ? (
        <InvestmentStructurePanel
          minFunding={projectParams.minFunding ?? 0}
          founderPercent={projectParams.founderPercent}
          setFounderPercent={(newPercent: number) =>
            updateProjectParams({ founderPercent: newPercent })
          }
          certParams={certParams}
          agreedToTerms={projectParams.agreedToTerms}
          setAgreedToTerms={(newAgreedToTerms: boolean) => {
            updateProjectParams({ agreedToTerms: newAgreedToTerms })
          }}
        />
      ) : (
        <Col className="gap-1">
          <label htmlFor="fundingGoal">
            Funding goal (USD)
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            Until this amount is raised, the project will be marked for donors
            as not fully funded. If this amount is different from your minimum
            funding, please explain in your project description what you could
            accomplish with the minimum funding and what you could accomplish
            with the full funding.
          </p>
          <AmountInput
            id="fundingGoal"
            amount={projectParams.fundingGoal}
            onChangeAmount={(newGoal) =>
              updateProjectParams({ fundingGoal: Number(newGoal) })
            }
            placeholder={minMinFunding.toString()}
            error={
              !!(
                projectParams.fundingGoal &&
                projectParams.minFunding &&
                (projectParams.fundingGoal < projectParams.minFunding ||
                  projectParams.fundingGoal <= 0)
              )
            }
            errorMessage="Funding goal must be greater than 0 and greater than or equal to your minimum funding."
          />
        </Col>
      )}
      {(!projectParams.selectedPrize || certParams?.proposalPhase) && (
        <Col className="gap-1">
          <label>
            Decision deadline
            <RequiredStar />
          </label>
          <p className="text-sm text-gray-600">
            After this deadline, if you have not reached your minimum funding
            bar, your application will close and you will not recieve any money.
            This date cannot be more than 6 weeks after posting.
          </p>
          <Input
            type="date"
            value={projectParams.verdictDate ?? ''}
            onChange={(event) =>
              updateProjectParams({ verdictDate: event.target.value })
            }
          />
        </Col>
      )}
      <Col className="gap-1">
        <label>Cause areas</label>
        <SelectCauses
          causesList={selectableCauses}
          selectedCauses={projectParams.selectedCauses}
          setSelectedCauses={(newCauses: MiniCause[]) =>
            updateProjectParams({ selectedCauses: newCauses })
          }
        />
      </Col>

      <Col className="gap-1">
        <label>
          In what countries are you and anyone else working on this located?
        </label>
        <p className="text-sm text-gray-600">
          This is for Manifund operations and will not be published.
        </p>
        <Input
          type="text"
          value={projectParams.location}
          onChange={(event) =>
            updateProjectParams({ location: event.target.value })
          }
        />
      </Col>

      <Row className="items-start">
        <Checkbox
          checked={projectParams.lobbying}
          onChange={(event) =>
            updateProjectParams({ lobbying: event.target.checked })
          }
        />
        <span className="ml-3 mt-0.5 text-sm leading-tight">
          <span className="font-bold">
            This project will engage in{' '}
            <a
              href="https://www.irs.gov/charities-non-profits/lobbying"
              className="text-orange-600 hover:underline"
            >
              lobbying
            </a>
            .
          </span>
          <span>
            {' '}
            Check this box if you will use this money to fund lobbying
            activities within the US or internationally.
          </span>
          <RequiredStar />
        </span>
      </Row>
      <Col className="w-full gap-3">
        <Row className="w-full gap-3">
          <Button className="w-full" color="gray-outline" onClick={cancel}>
            Cancel
          </Button>
          <Tooltip className="w-full" text={errorMessage}>
            <Button className="w-full" disabled={!!errorMessage} onClick={save}>
              Save draft
            </Button>
          </Tooltip>
        </Row>
        <Tooltip text={errorMessage}>
          <Button
            type="submit"
            className="w-full"
            disabled={!!errorMessage}
            loading={isSubmitting}
            onClick={publish}
          >
            Publish project
          </Button>
        </Tooltip>
      </Col>
    </Col>
  )
}
