'use client'
import { Button, buttonClass } from '@/components/button'
import { Row } from '@/components/layout/row'
import { SimpleCause, Cause } from '@/db/cause'
import { FullProject, Project } from '@/db/project'
import {
  LockClosedIcon,
  PaperAirplaneIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { ProjectWithCauses } from '@/db/project'
import { useState } from 'react'
import { Tooltip } from '@/components/tooltip'
import { AmountInput, Input } from '@/components/input'
import { useRouter } from 'next/navigation'
import { Col } from '@/components/layout/col'
import { SelectCauses } from '@/components/select-causes'
import { Modal } from '@/components/modal'
import { Dialog } from '@headlessui/react'
import { FireIcon } from '@heroicons/react/20/solid'
import { checkReactivateEligible } from '@/utils/activate-project'
import Link from 'next/link'

export function CreatorActionPanel(props: {
  project: FullProject
  causesList: SimpleCause[]
  prizeCause?: Cause
}) {
  const { project, causesList, prizeCause } = props
  return (
    <Row className="items-center gap-1" id="creator-actions">
      {project.stage === 'draft' ? (
        <Publish projectSlug={project.slug} />
      ) : (
        <Edit project={project} causesList={causesList} />
      )}
      {project.stage === 'active' && <ProgressUpdate project={project} />}
      {project.stage === 'active' && <CloseProject projectId={project.id} />}
      {checkReactivateEligible(project, prizeCause) && (
        <Reactivate projectId={project.id} />
      )}
    </Row>
  )
}

const PROGRESS_UPDATE_OUTLINE = `
<h3>What progress have you made since your last update?</h3>
</br>
<h3>What are your next steps?</h3>
</br>
<h3>Is there anything others could help you with?</h3>
</br>
`
function ProgressUpdate(props: { project: Project }) {
  const { project } = props
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const PROGRESS_UPDATE_KEY = `${project.id}ProgressUpdate`
  const editor = useTextEditor(PROGRESS_UPDATE_OUTLINE, PROGRESS_UPDATE_KEY)
  return (
    <>
      <Button
        className="flex items-center"
        size="2xs"
        color="light-orange"
        onClick={() => setModalOpen(true)}
      >
        <PaperAirplaneIcon className="relative right-1 h-4 w-4" />
        Post update
      </Button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <PaperAirplaneIcon className="h-6 w-6 text-orange-600" />
        </div>
        <div className="my-3 text-center">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Post progress update
          </Dialog.Title>
          <p className="text-sm text-gray-600">
            This will be posted as a public comment and all of your{' '}
            {project.type === 'cert' ? 'investors' : 'donors'} will be notified
            of your update.
          </p>
        </div>
        <TextEditor editor={editor} />
        <div className="sm:flex-2 mt-3 flex flex-col gap-3 sm:flex-row">
          <Button
            color="gray"
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const content = editor?.getJSON()
              await fetch('/api/post-comment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content: content,
                  projectId: project.id,
                  specialType: 'progress update',
                }),
              })
              setModalOpen(false)
              setIsSubmitting(false)
              router.refresh()
            }}
          >
            Submit update
          </Button>
        </div>
      </Modal>
    </>
  )
}

const REPORT_OUTLINE = `
<h3>Description of subprojects and results, including major changes from the original proposal</h3>
</br>
<h3>Spending breakdown</h3>
</br>
`
function CloseProject(props: { projectId: string }) {
  const { projectId } = props
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const REPORT_KEY = `${projectId}Report`
  const editor = useTextEditor(REPORT_OUTLINE, REPORT_KEY)
  const router = useRouter()
  return (
    <>
      <Button
        className="flex items-center"
        size="2xs"
        color="light-orange"
        onClick={() => setModalOpen(true)}
      >
        <LockClosedIcon className="relative right-1 h-4 w-4" />
        Close project
      </Button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <LockClosedIcon className="h-6 w-6 text-orange-600" />
        </div>
        <div className="my-3 text-center">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Close project
          </Dialog.Title>
          <p className="text-sm text-gray-600">
            Closing this project ends the grant period, marks the project as
            complete, prevents future donations, and means you will not be asked
            for further project updates in the future. Do this if you have
            completed the project as described in the initial proposal, have
            spent all of the funds you recieved, and/or do not plan to work on
            this project further.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Your report will be posted as a public comment.</strong> If
            there&apos;s anything you&apos;d like to share with Manifund but
            cannot post publicly, you can email rachel@manifund.org.
          </p>
        </div>
        <TextEditor editor={editor} />
        <div className="sm:flex-2 mt-3 flex flex-col gap-3 sm:flex-row">
          <Button
            color="gray"
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const reportContent = editor?.getJSON()
              await fetch('/api/close-active-project', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId: projectId, reportContent }),
              })
              setModalOpen(false)
              setIsSubmitting(false)
              router.refresh()
            }}
          >
            Submit & close
          </Button>
        </div>
      </Modal>
    </>
  )
}

export function Reactivate(props: { projectId: string }) {
  const { projectId } = props
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <>
      <Button
        className="flex items-center"
        size="2xs"
        color="light-orange"
        onClick={() => {
          setModalOpen(true)
        }}
      >
        <FireIcon className="relative right-1 h-4 w-4" />
        Reactivate project
      </Button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <FireIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
        </div>
        <div className="my-3 text-center">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Reactivate project
          </Dialog.Title>
          <p className="my-2 text-sm text-gray-500">
            Your project will be moved into the active stage and remain eligible
            for trading and retroactive funding. It will not have an AMM.
          </p>
        </div>
        <div className="sm:flex-2 mt-3 flex flex-col gap-3 sm:flex-row">
          <Button
            color="gray"
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const response = await fetch('/api/reactivate-project', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId,
                }),
              })
              setModalOpen(false)
              setIsSubmitting(false)
              router.refresh()
            }}
          >
            Reactivate
          </Button>
        </div>
      </Modal>
    </>
  )
}

function Edit(props: {
  project: ProjectWithCauses
  causesList: SimpleCause[]
}) {
  const { project, causesList } = props
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const [fundingGoal, setFundingGoal] = useState<number | undefined>(
    project.funding_goal
  )
  const [selectedCauses, setSelectedCauses] = useState(project.causes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const editor = useTextEditor(project.description ?? '')
  const selectableCauses = causesList.filter((cause) => cause.open)

  let errorMessage = null
  if (title.length === 0) {
    errorMessage = 'Enter a project title.'
  } else if (!fundingGoal || fundingGoal < project.min_funding) {
    errorMessage = `Funding goal must be at least the minimum funding of ${project.min_funding}.`
  }

  async function save() {
    setIsSubmitting(true)
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
        fundingGoal,
        causeSlugs: selectedCauses.map((cause) => cause.slug),
      }),
    })
    setModalOpen(false)
    setIsSubmitting(false)
    router.refresh()
  }
  return (
    <>
      <Button
        className="flex items-center"
        size="2xs"
        color="light-orange"
        onClick={() => setModalOpen(true)}
      >
        <PencilIcon className="relative right-1 h-4 w-4" />
        Edit project
      </Button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <PencilIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
        </div>
        <div className="my-3 text-center">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Edit project details
          </Dialog.Title>
        </div>
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
          {project.type === 'grant' && !project.lobbying && (
            <Col className="gap-1">
              <label>Funding goal</label>
              <AmountInput
                amount={fundingGoal}
                onChangeAmount={setFundingGoal}
              />
            </Col>
          )}
          <Col className="gap-1">
            <label>Causes</label>
            <SelectCauses
              causesList={selectableCauses}
              selectedCauses={selectedCauses}
              setSelectedCauses={setSelectedCauses}
            />
          </Col>
          <div className="sm:flex-2 mt-3 flex flex-col gap-3 sm:flex-row">
            <Button
              color="gray"
              className="inline-flex w-full justify-center sm:col-start-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Tooltip text={errorMessage}>
              <Button
                className="sm:flex-2 inline-flex w-full justify-center"
                loading={isSubmitting}
                disabled={!!errorMessage}
                onClick={save}
              >
                Save changes
              </Button>
            </Tooltip>
          </div>
        </Col>
      </Modal>
    </>
  )
}

function Publish(props: { projectSlug: string }) {
  return (
    <Link
      className={buttonClass('2xs', 'light-orange')}
      href={`/projects/${props.projectSlug}/publish`}
    >
      Edit & publish
    </Link>
  )
}
