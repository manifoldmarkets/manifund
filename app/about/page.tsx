'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/components/supabase-provider'
import { useTextEditor, TextEditor } from '@/components/tiptap'

export default function AboutPage() {
  const editor = useTextEditor()
  const { supabase, session } = useSupabase()
  async function saveText() {
    const content = editor?.getJSON()

    console.log('saving', content)
    // Write this to supabase
    const { data, error } = await supabase
      .from('projects')
      .update({
        description: content,
      })
      .eq('id', '5ece2c57-a889-4f69-be9b-30fceb7e67dd')
      .select()
    if (error) {
      console.error(error)
    } else {
      console.log('done', data)
    }
  }
  return (
    <div>
      About
      <TextEditor editor={editor} />
      <Button onClick={saveText}>Save</Button>
    </div>
  )
}
