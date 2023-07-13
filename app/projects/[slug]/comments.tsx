'use client'
import { Profile } from '@/db/profile'
import { CommentAndProfile, sendComment } from '@/db/comment'
import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent, TextEditor, useTextEditor } from '@/components/editor'
import { Project } from '@/db/project'
import { ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { Row } from '@/components/layout/row'
import { IconButton } from '@/components/button'
import { useState } from 'react'
import { orderBy, sortBy } from 'lodash'
import { Col } from '@/components/layout/col'
import { Tooltip } from '@/components/tooltip'
import { Tag } from '@/components/tags'
import { Avatar } from '@/components/avatar'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { JSONContent } from '@tiptap/react'
import clsx from 'clsx'

export function Comments(props: {
  project: Project
  comments: CommentAndProfile[]
  commenterContributions: Record<string, string>
  userProfile?: Profile
}) {
  const { project, comments, commenterContributions, userProfile } = props
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
  const commentsDisplay = threads.map((thread) => (
    <div key={thread.root.id} className="mt-6">
      <Row className="w-full">
        <div className="w-full">
          <Comment
            comment={thread.root}
            writtenByCreator={thread.root.commenter === project.creator}
            contributionText={commenterContributions[thread.root.commenter]}
          />
          {userProfile && (
            <Row className="w-full justify-end">
              <Tooltip text="Reply">
                <IconButton onClick={() => setReplyingTo(thread.root)}>
                  <ArrowUturnRightIcon className="relative bottom-2 h-4 w-4 rotate-180 stroke-2 text-gray-500 hover:text-gray-700" />
                </IconButton>
              </Tooltip>
            </Row>
          )}
          {thread.replies.map((reply) => (
            <div className="ml-8 mt-1" key={reply.id}>
              <Comment
                comment={reply}
                writtenByCreator={reply.commenter === project.creator}
                contributionText={commenterContributions[reply.commenter]}
              />
              <Row className="w-full justify-end">
                <Tooltip text="Reply">
                  <IconButton onClick={() => setReplyingTo(reply)}>
                    <ArrowUturnRightIcon className="relative bottom-2 h-4 w-4 rotate-180 stroke-2 text-gray-500 hover:text-gray-700" />
                  </IconButton>
                </Tooltip>
              </Row>
            </div>
          ))}
          {(replyingTo?.id === thread.root.id ||
            replyingTo?.replying_to === thread.root.id) &&
            userProfile && (
              <div className="mt-1 ml-8">
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
  ))
  return (
    <div>
      {userProfile && (
        <div className="mb-5">
          <WriteComment project={project} commenter={userProfile} />
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

function Comment(props: {
  comment: CommentAndProfile
  writtenByCreator?: boolean
  contributionText?: string
}) {
  const { comment, writtenByCreator, contributionText } = props
  return (
    <div>
      <Row className="w-full items-center justify-between gap-2">
        <Row className="items-center gap-1">
          <UserAvatarAndBadge
            profile={comment.profiles}
            creatorBadge={writtenByCreator}
            className="text-sm text-gray-800"
          />
          <p className="hidden text-xs text-gray-500 sm:inline">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </p>
        </Row>
        <Col className="items-center">
          {contributionText && <Tag text={contributionText} color="orange" />}
          <p className="text-xs text-gray-500 sm:hidden">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </p>
        </Col>
      </Row>
      <div className="relative left-8 w-11/12">
        <RichContent content={comment.content} />
      </div>
    </div>
  )
}

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
  const startingText: JSONContent | string = replyingTo?.replying_to
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
  const editor = useTextEditor(
    startingText,
    'border-0 focus:!outline-none focus:ring-0',
    specialPrompt ?? replyingTo ? 'Write your reply...' : 'Write a comment...'
  )
  if (replyingTo || specialPrompt) {
    editor?.commands.focus()
  }
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
      await sendComment(
        supabase,
        content,
        project.id,
        commenter.id,
        replyingTo?.replying_to
          ? (replyingTo.replying_to as string)
          : replyingTo?.id
      )
      if (setReplyingTo) {
        setReplyingTo(null)
      }
      editor.commands.clearContent()
      if (onSubmit) {
        onSubmit()
      }
      setIsSubmitting(false)
      router.refresh()
    }
  }

  return (
    <Row className="w-full">
      <Avatar
        username={commenter.username}
        avatarUrl={commenter.avatar_url}
        size={replyingTo?.id ? 6 : 10}
        className="mr-2"
      />
      <div
        className={clsx(
          'w-full overflow-hidden rounded-md bg-white shadow',
          specialPrompt && 'shadow-[0_0px_10px_5px_rgb(249,115,22,0.5)]'
        )}
      >
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
              'absolute inset-x-0 bottom-0 border-t border-t-gray-200 bg-white py-0.5 pl-3',
              setReplyingTo ? 'justify-between' : 'justify-end'
            )}
          >
            {setReplyingTo && (
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
