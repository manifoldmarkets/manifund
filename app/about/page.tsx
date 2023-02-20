'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/components/supabase-provider'
import { useTextEditor, TextEditor } from '@/components/editor'

export default function AboutPage() {
  return (
    <div className="prose">
      <h1>About</h1>

      <p>Manifund is a platform for impact certificates. Stay tuned!</p>
    </div>
  )
}
