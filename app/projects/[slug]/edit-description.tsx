'use client'

import { Button } from '@/components/button'
import { useSupabase } from '@/components/supabase-provider'
import { useTextEditor, TextEditor } from '@/components/editor'
import { Project } from '@/db/project'
import { useState } from 'react'

export function EditDescription(props: { project: Project }) {
  const { project } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
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
      })
      .eq('id', project.id)
    if (error) {
      console.error(error)
    } else {
      console.log('done', data)
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
            Edit project description
          </h3>
          <TextEditor editor={editor} />
          <div className="flex flex-row gap-2">
            <Button onClick={saveText} disabled={saving} loading={saving}>
              Save
            </Button>
            <Button color="gray" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowEditor(true)}>
          Edit project description
        </Button>
      )}
    </div>
  )
}
