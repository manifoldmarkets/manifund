'use client'
import { Button, buttonClass } from '@/components/button'
import { Row } from '@/components/layout/row'
import { MiniCause } from '@/db/cause'
import { FullProject, Project } from '@/db/project'
import { LockClosedIcon, PaperAirplaneIcon } from '@heroicons/react/20/solid'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { ProjectWithCauses } from '@/db/project'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Tooltip } from '@/components/tooltip'
import { Input } from '@/components/input'
import { useRouter } from 'next/navigation'
import { Col } from '@/components/layout/col'
import { SelectCauses } from '@/components/select-causes'

export function CreatorActionPanel(props: {
  project: FullProject
  causesList: MiniCause[]
}) {
  const { project, causesList } = props
  return (
    <Row className="justify-end">
      <Row className="flex-row-reverse items-center">
        <div className="relative top-0.5 z-10">
          <Edit project={project} causesList={causesList} />
        </div>
        <Row className="relative left-3 items-center gap-1 rounded bg-orange-500 p-1 pr-3">
          <ProgressUpdateButton project={project} />
          <CloseProjectButton project={project} />
        </Row>
      </Row>
    </Row>
  )
}

function ProgressUpdateButton(props: { project: Project }) {
  const { project } = props
  return (
    <Button className="flex items-center" size="2xs" color="light-orange">
      <PaperAirplaneIcon className="mr-1 h-4 w-4" />
      Post update
    </Button>
  )
}

function CloseProjectButton(props: { project: Project }) {
  const { project } = props
  return (
    <Button className="flex items-center" size="2xs" color="light-orange">
      <LockClosedIcon className="mr-1 h-4 w-4" />
      Close project
    </Button>
  )
}

function Edit(props: { project: ProjectWithCauses; causesList: MiniCause[] }) {
  const { project, causesList } = props
  const [showEditor, setShowEditor] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const [selectedCauses, setSelectedCauses] = useState(project.causes)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const editor = useTextEditor(project.description ?? '')

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
              causesList={causesList}
              selectedCauses={selectedCauses}
              setSelectedCauses={setSelectedCauses}
            />
          </Col>
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
        <button
          onClick={() => setShowEditor(true)}
          className="rounded-full bg-orange-500 p-1"
        >
          <Tooltip text="Edit project">
            <div className="h-10 w-10 rounded-full bg-orange-100 shadow hover:bg-orange-200">
              <PencilIcon
                className="h-10 w-10 p-2 text-orange-500"
                aria-hidden
              />
            </div>
          </Tooltip>
        </button>
      )}
    </div>
  )
}
