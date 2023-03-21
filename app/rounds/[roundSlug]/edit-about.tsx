'use client'

import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { useTextEditor, TextEditor } from '@/components/editor'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Round } from '@/db/round'
import { isAdmin } from '@/db/profile'

export function EditDescription(props: { round: Round }) {
  const { round } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const editor = useTextEditor(round.description)
  const router = useRouter()

  if (!user || !isAdmin(user)) {
    return null
  }

  async function saveText() {
    setSaving(true)
    const content = editor?.getJSON()
    const { error } = await supabase
      .from('rounds')
      .update({
        description: content,
      })
      .eq('title', round.title)
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
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-500">
            Edit round description
          </h3>
          <TextEditor editor={editor} />
          <div className="mt-3 flex flex-row gap-2">
            <Button onClick={saveText} disabled={saving} loading={saving}>
              Save
            </Button>
            <Button color="gray" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" color="gray" onClick={() => setShowEditor(true)}>
          Edit round description
        </Button>
      )}
    </div>
  )
}
