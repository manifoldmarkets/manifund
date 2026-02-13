'use client'

import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/db/profile'
import Image from 'next/image'
import uuid from 'react-uuid'
import { SUPABASE_BUCKET_URL } from '@/db/env'
import { Cause } from '@/db/cause'

export function EditCause(props: { cause: Cause }) {
  const { cause } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [headerImage, setHeaderImage] = useState<File | null>(null)
  const editor = useTextEditor(cause.description)
  const router = useRouter()

  if (!user || !isAdmin(user)) {
    return null
  }

  async function saveText() {
    const content = editor?.getJSON()
    const { error } = await supabase
      .from('causes')
      .update({
        description: content,
      })
      .eq('title', cause.title)
    if (error) {
      console.error('saveText', error)
    }
  }

  async function saveHeaderImage() {
    if (!headerImage) {
      return
    }
    const headerImageId = uuid()
    const { error } = await supabase.storage
      .from('round-header-images')
      .upload(`${cause.slug}/${headerImageId}`, headerImage)
    if (error) {
      console.error('saveHeaderImage', error)
    }
    await saveHeaderImageUrl(headerImageId)
  }

  async function saveHeaderImageUrl(headerImageId: string) {
    const { error } = await supabase
      .from('causes')
      .update({
        header_image_url: `${SUPABASE_BUCKET_URL}/storage/v1/object/public/round-header-images/${cause.slug}/${headerImageId}`,
      })
      .eq('slug', cause.slug)
    if (error) {
      console.error('saveHeaderImageUrl', error)
    }
  }

  return (
    <div>
      {showEditor ? (
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-500">Edit cause</h3>
          <div className="my-5">
            {headerImage ? (
              <Image
                width={500}
                height={300}
                className="my-0 h-24 w-24 max-w-[6-rem] flex-shrink-0 bg-white object-cover"
                src={URL.createObjectURL(headerImage)}
                alt="new cause header image"
              />
            ) : (
              <Image
                src={cause.header_image_url ?? '/default-header.png'}
                width={500}
                height={300}
                alt="cause header image"
              />
            )}
            <input
              type="file"
              id="header"
              name="header"
              accept="image/png, image/jpeg"
              onChange={(event) => {
                setHeaderImage(event.target.files ? event.target.files[0] : null)
              }}
            />
          </div>
          <TextEditor editor={editor} />
          <div className="mt-3 flex flex-row gap-2">
            <Button
              onClick={async () => {
                setSaving(true)
                await saveText()
                await saveHeaderImage()
                setSaving(false)
                setShowEditor(false)
                router.refresh()
              }}
              disabled={saving}
              loading={saving}
            >
              Save
            </Button>
            <Button color="gray" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" color="gray" onClick={() => setShowEditor(true)}>
          Edit cause
        </Button>
      )}
    </div>
  )
}
