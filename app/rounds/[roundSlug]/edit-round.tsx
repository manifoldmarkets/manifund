'use client'

import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Round } from '@/db/round'
import { isAdmin } from '@/db/profile'
import Image from 'next/image'
import uuid from 'react-uuid'
import { SUPABASE_BUCKET_URL } from '@/db/env'

export function EditRound(props: { round: Round }) {
  const { round } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [headerImage, setHeaderImage] = useState<File | null>(null)
  const editor = useTextEditor(round.description)
  const router = useRouter()

  if (!user || !isAdmin(user)) {
    return null
  }

  async function saveText() {
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
  }

  async function saveHeaderImage() {
    if (!headerImage) {
      return
    }
    const headerImageId = uuid()
    const { error } = await supabase.storage
      .from('round-header-images')
      .upload(`${round.slug}/${headerImageId}`, headerImage)
    if (error) {
      console.error('saveHeaderImage', error)
    }
    await saveHeaderImageUrl(headerImageId)
  }

  async function saveHeaderImageUrl(headerImageId: string) {
    const { error } = await supabase
      .from('rounds')
      .update({
        header_image_url: `${SUPABASE_BUCKET_URL}/storage/v1/object/public/round-header-images/${round.slug}/${headerImageId}`,
      })
      .eq('title', round.title)
    if (error) {
      console.error('saveHeaderImageUrl', error)
    }
  }

  return (
    <div>
      {showEditor ? (
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-500">Edit round</h3>
          <div className="my-5">
            {headerImage ? (
              <Image
                width={500}
                height={300}
                className="my-0 h-24 w-24 max-w-[6-rem] flex-shrink-0 bg-white object-cover"
                src={URL.createObjectURL(headerImage)}
                alt="new round header image"
              />
            ) : (
              <Image
                src={round.header_image_url ?? '/default-header.png'}
                width={500}
                height={300}
                alt="round header image"
              />
            )}
            <input
              type="file"
              id="header"
              name="header"
              accept="image/png, image/jpeg"
              onChange={(event) => {
                setHeaderImage(
                  event.target.files ? event.target.files[0] : null
                )
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
          Edit round
        </Button>
      )}
    </div>
  )
}
