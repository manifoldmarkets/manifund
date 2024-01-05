'use client'
import { Profile } from '@/db/profile'
import { CommentAndProfile, sendComment } from '@/db/comment'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { Project } from '@/db/project'
import { ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { Row } from '@/components/layout/row'
import { IconButton } from '@/components/button'
import { useEffect, useState } from 'react'
import { orderBy, sortBy } from 'lodash'
import { Tooltip } from '@/components/tooltip'
import { Avatar } from '@/components/avatar'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { JSONContent } from '@tiptap/react'
import clsx from 'clsx'
import { clearLocalStorageItem } from '@/hooks/use-local-storage'
import { Comment } from '@/components/comment'

export function Comments(props: {
  project: Project
  comments: CommentAndProfile[]
  commenterContributions: Record<string, string>
  userProfile?: Profile
  specialPrompt?: string
}) {
  const {
    project,
    comments,
    commenterContributions,
    userProfile,
    specialPrompt,
  } = props
  const [replyingTo, setReplyingTo] = useState<CommentAndProfile | null>(null)
  const rootComments = comments.filter(
    (comment) => comment.replying_to === null
  )
  const replyComments = comments.filter(
    (comment) => comment.replying_to !== null
  )
  if (comments.length === 0 && !userProfile)
    return (
      <p className="text-center italic text-gray-500">
        No comments yet.{' '}
        <a href="/login" className="hover:underline">
          Sign in
        </a>{' '}
        to create one!
      </p>
    )
  const threads = genThreads(rootComments, replyComments)
  const commentsDisplay = threads.map((thread) => {
    const replyButton = (replyingTo: CommentAndProfile) => (
      <Tooltip text="Reply">
        <ArrowUturnRightIcon
          className="h-4 w-4 rotate-180 cursor-pointer stroke-2 text-gray-500 hover:text-gray-700"
          onClick={() => setReplyingTo(replyingTo)}
        />
      </Tooltip>
    )
    return (
      <div key={thread.root.id} className="mt-6">
        <Row className="w-full">
          <div className="w-full">
            <Comment
              comment={thread.root}
              commenter={thread.root.profiles}
              commentHref={`/projects/${project.slug}?tab=comments#${thread.root.id}`}
              writtenByCreator={thread.root.commenter === project.creator}
              contributionText={commenterContributions[thread.root.commenter]}
            >
              {userProfile && replyButton(thread.root)}
            </Comment>
            <div className="relative">
              {/* Bar along the left side of threads */}
              <div className="absolute bottom-6 left-[62px] -z-10 h-full w-10 rounded-xl border-b-[3px] border-l-[3px]" />
              {thread.replies.map((reply) => (
                <div className="relative ml-12 mt-1" key={reply.id}>
                  <Comment
                    comment={reply}
                    commenter={reply.profiles}
                    commentHref={`/projects/${project.slug}?tab=comments#${reply.id}`}
                    writtenByCreator={reply.commenter === project.creator}
                    contributionText={commenterContributions[reply.commenter]}
                  >
                    {userProfile && replyButton(reply)}
                  </Comment>
                </div>
              ))}
            </div>
            {(replyingTo?.id === thread.root.id ||
              replyingTo?.replying_to === thread.root.id) &&
              userProfile && (
                <div className="ml-12 mt-1">
                  <WriteComment
                    project={project}
                    commenter={userProfile}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                  />
                </div>
              )}
          </div>
        </Row>
      </div>
    )
  })
  return (
    <div>
      {userProfile && (
        <div className="mb-5" id="main-write-comment">
          <WriteComment
            project={project}
            commenter={userProfile}
            specialPrompt={specialPrompt}
          />
        </div>
      )}
      {commentsDisplay}
    </div>
  )
}

type Thread = {
  root: CommentAndProfile
  replies: CommentAndProfile[]
}
function genThreads(
  rootComments: CommentAndProfile[],
  replyComments: CommentAndProfile[]
) {
  const threads = Object.fromEntries(
    rootComments.map((comment) => [
      comment.id,
      { root: comment, replies: [] } as Thread,
    ])
  )
  replyComments.forEach((reply) => {
    threads[reply.replying_to ?? 0].replies.push(reply)
  })
  const threadsArray = Object.values(threads)
  threadsArray.forEach((thread) => {
    thread.replies = sortBy(thread.replies, 'created_at')
  })
  return orderBy(threadsArray, 'root.created_at', 'desc')
}

const CREATOR_UPDATE_OUTLINE = `
<h3>What progress have you made since your last update?</h3>
</br>
<h3>What are your next steps?</h3>
</br>
<h3>Is there anything others could help you with?</h3>
</br>
`

export function WriteComment(props: {
  project: Project
  commenter: Profile
  replyingTo?: CommentAndProfile
  setReplyingTo?: (id: CommentAndProfile | null) => void
  onSubmit?: () => void
  specialPrompt?: string
}) {
  const {
    project,
    commenter,
    replyingTo,
    setReplyingTo,
    onSubmit,
    specialPrompt,
  } = props
  const { supabase } = useSupabase()
  const [isCreatorUpdate, setIsCreatorUpdate] = useState(false)
  useEffect(() => {
    if (replyingTo) {
      setIsCreatorUpdate(false)
    }
  }, [replyingTo])
  const showCancelButton = !!setReplyingTo
  const startingText: JSONContent | string = !!replyingTo
    ? {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mention',
                attrs: {
                  id: replyingTo.commenter,
                  label: replyingTo.profiles.username,
                },
              },
              {
                text: ' ',
                type: 'text',
              },
            ],
          },
        ],
      }
    : ''
  const storageKey = `CommentOn${project.id}${
    replyingTo ? `ReplyingTo${replyingTo.id}` : ''
  }`
  const editor = useTextEditor(
    startingText,
    storageKey,
    replyingTo ? 'Write your reply...' : 'Write a comment...',
    'border-0 focus:!outline-none focus:ring-0 text-sm sm:text-md'
  )
  useEffect(() => {
    if (editor && !editor.isDestroyed && (replyingTo || specialPrompt)) {
      editor.commands.focus()
    }
  }, [replyingTo, specialPrompt, editor])
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = async () => {
    if (editor?.getText()?.trim()) {
      setIsSubmitting(true)
      const content = editor?.getJSON()
      const htmlContent = editor?.getHTML()
      if (!content || content.length === 0 || !editor || !htmlContent) {
        return
      }
      // TODO: move onto edge
      await sendComment(
        supabase,
        content,
        project.id,
        commenter.id,
        replyingTo?.replying_to
          ? (replyingTo.replying_to as string)
          : replyingTo?.id,
        isCreatorUpdate ? 'update' : undefined
      )
      if (setReplyingTo) {
        setReplyingTo(null)
      }
      editor.commands.clearContent()
      if (onSubmit) {
        onSubmit()
      }
      setIsSubmitting(false)
      clearLocalStorageItem(storageKey)
      router.refresh()
    }
  }

  return (
    <Row className="w-full gap-2">
      <Avatar
        username={commenter.username}
        avatarUrl={commenter.avatar_url}
        size="sm"
        id={commenter.id}
      />
      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-xl rounded-tl-sm bg-white p-0 shadow',
          specialPrompt && 'shadow-[0_0px_10px_5px_rgb(249,115,22,0.5)]'
        )}
      >
        {specialPrompt && (
          <p className="z-10 w-full bg-orange-500 text-center text-xs text-white">
            {specialPrompt}
          </p>
        )}
        <TextEditor editor={editor}>
          {/* Spacer element to match the height of the toolbar */}
          <div className="py-1" aria-hidden="true">
            {/* Matches height of button in toolbar (1px border + 36px content height) */}
            <div className="py-px">
              <div className="h-9" />
            </div>
          </div>
          <Row
            className={clsx(
              'absolute bottom-0 w-full items-center border-t border-t-gray-200 bg-white py-0.5 pl-3',
              showCancelButton ? 'justify-between' : 'justify-end'
            )}
          >
            {showCancelButton && (
              <button
                onClick={() => setReplyingTo(null)}
                className="text-sm text-gray-500 hover:cursor-pointer hover:text-gray-700"
              >
                Cancel
              </button>
            )}
            <IconButton
              loading={isSubmitting}
              onClick={async () => {
                await handleSubmit()
              }}
            >
              <PaperAirplaneIcon className="h-6 w-6 text-gray-500 hover:cursor-pointer hover:text-orange-500" />
            </IconButton>
          </Row>
        </TextEditor>
      </div>
    </Row>
  )
}
