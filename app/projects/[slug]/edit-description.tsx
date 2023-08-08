'use client'

import { Button, IconButton } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { Project } from '@/db/project'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { Input } from '@/components/input'
import { useRouter } from 'next/navigation'
import { Col } from '@/components/layout/col'

export function EditDescription(props: { project: Project }) {
  const { project } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const editor = useTextEditor(project.description ?? '')

  if (!user || user.id !== project.creator) {
    return null
  }

  async function saveText() {
    setSaving(true)
    const content = editor?.getJSON()
    const { error } = await supabase
      .from('projects')
      .update({
        description: content,
        blurb: subtitle,
        title: title,
      })
      .eq('id', project.id)
    if (error) {
      console.error('saveText', error)
    }
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
        </Col>
      ) : (
        <Row className=" justify-end">
          <IconButton size="sm" onClick={() => setShowEditor(true)}>
            <Tooltip text="Edit project description">
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
