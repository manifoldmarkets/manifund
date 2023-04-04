'use client'

import { Button, IconButton } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { useTextEditor, TextEditor } from '@/components/editor'
import { Project } from '@/db/project'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { Input } from '@/components/input'

export function EditDescription(props: { project: Project }) {
  const { project } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [subtitle, setSubtitle] = useState(project.blurb ?? '')
  const [saving, setSaving] = useState(false)
  const editor = useTextEditor(project.description)

  if (!user || user.id !== project.creator) {
    return null
  }

  async function saveText() {
    setSaving(true)
    const content = editor?.getJSON()
    // Write this to supabase
    const { data, error } = await supabase
      .from('projects')
      .update({
        description: content,
        blurb: subtitle,
      })
      .eq('id', project.id)
    if (error) {
      console.error('saveText', error)
    }
    setShowEditor(false)
    setSaving(false)
    // Hack: reload the page on save.
    window.location.reload()
  }
  return (
    <div>
      {showEditor ? (
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-500">
            Project subtitle:
          </h3>
          <Input
            className="mb-2 w-full"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />

          <h3 className="mb-2 text-xl font-bold text-gray-500">
            Project description:
          </h3>
          <TextEditor editor={editor} />
          <Row className="mt-3 justify-center gap-2">
            <Button onClick={saveText} disabled={saving} loading={saving}>
              Save
            </Button>
            <Button color="gray" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
          </Row>
        </div>
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
