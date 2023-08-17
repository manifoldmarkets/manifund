'use client'

import { Button, IconButton } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { ProjectWithTopics } from '@/db/project'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { Input } from '@/components/input'
import { useRouter } from 'next/navigation'
import { Col } from '@/components/layout/col'
import { MiniTopic } from '@/db/topic'
import { SelectTopics } from '@/components/select-topics'
import { uniq } from 'lodash'

export function Edit(props: {
  project: ProjectWithTopics
  topicsList: MiniTopic[]
}) {
  const { project, topicsList } = props
  const { session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const currentTopics = uniq(
    project.project_topics
      .map((projectTopic) =>
        topicsList.find((t) => t.slug === projectTopic.topic_slug)
      )
      .filter((t) => t !== undefined) as MiniTopic[]
  )
  const [selectedTopics, setSelectedTopics] = useState(currentTopics)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const editor = useTextEditor(project.description ?? '')
  if (!user || user.id !== project.creator) {
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
        topicSlugs: selectedTopics.map((topic) => topic.slug),
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
            <label>Topics</label>
            <SelectTopics
              topicsList={topicsList}
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
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
        <Row className=" justify-end">
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
