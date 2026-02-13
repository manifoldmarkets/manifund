import { SUPABASE_BUCKET_URL } from '@/db/env'
import { SupabaseClient } from '@supabase/supabase-js'
import { Editor } from '@tiptap/core'
import toast from 'react-hot-toast'
import uuid from 'react-uuid'

export function handleImageOnPaste(editor: Editor | null, supabase: SupabaseClient) {
  if (!editor) return null

  const getImages = (data: DataTransfer | null) =>
    Array.from(data?.files ?? []).filter((file) => file.type.startsWith('image'))

  editor.setOptions({
    editorProps: {
      handlePaste(view, event) {
        const imageFiles = getImages(event.clipboardData)
        if (imageFiles.length) {
          event.preventDefault()
          void uploadImages(editor, imageFiles, supabase)
          return true // Prevent image in text/html from getting pasted again
        }
      },
      handleDrop(_view, event, _slice, moved) {
        // if dragged from outside
        if (!moved) {
          event.preventDefault()
          void uploadImages(editor, getImages(event.dataTransfer), supabase)
        }
      },
    },
  })
}

// Heavily modified from Manifold; this uses supabase and skips the useMutation shenagians
export async function uploadImages(editor: Editor, files: File[], supabase: SupabaseClient) {
  // Upload a single image
  async function uploadImage(file: File) {
    const id = uuid()
    const fullUrl = `${SUPABASE_BUCKET_URL}/storage/v1/object/public/image-uploads/${id}`
    const { error } = await supabase.storage.from('image-uploads').upload(id, file)
    if (error) {
      toast.error(error.message ?? error)
    } else {
      editor.chain().focus().setImage({ src: fullUrl }).createParagraphNear().run()
    }
  }

  // Upload all the images
  await Promise.all(files.map(uploadImage))
}
