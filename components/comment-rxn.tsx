import { CommentRxn } from '@/db/comment'
import { Popover } from '@headlessui/react'
import { FaceSmileIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { Row } from './layout/row'

export const freeRxns = [
  '➕',
  '➖',
  '🤔',
  '😮',
  '🥳',
  '💡',
  '❓',
  '🔥',
  '👏',
  '🌈',
]

export const paidRxns = {
  '🧡': 1,
  '🏅': 10,
  '🏆': 100,
} as { [key: string]: number }

const AddRxnIcon = () => (
  <div className="relative mt-1 w-5">
    <FaceSmileIcon className="h-5 w-5" />
    <div className="absolute right-0 top-0 rounded-full bg-white px-[0.5px] text-[10px] leading-[10px]">
      +
    </div>
  </div>
)

async function onFreeRxnClick(reaction: string, commentId: string) {
  const response = await fetch(`/api/react-to-comment`, {
    method: 'POST',
    body: JSON.stringify({
      commentId,
      reaction,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function AddRxn(props: { commentId: string }) {
  return (
    <Popover className="relative">
      <Popover.Button className="text-gray-500 hover:text-gray-700 focus:outline-0">
        <AddRxnIcon />
      </Popover.Button>

      <Popover.Panel className="absolute bottom-5 left-5 z-10 rounded-md rounded-bl-sm bg-white p-3 shadow-md">
        <h3 className="text-sm text-gray-700">Free reactions</h3>
        <div className="grid grid-cols-5 gap-2">
          {freeRxns.map((reaction) => (
            <Popover.Button
              key={reaction}
              className="text-base"
              onClick={() => onFreeRxnClick(reaction, props.commentId)}
            >
              <div className="rounded px-1 py-0.5 text-base hover:bg-gray-200">
                {reaction}
              </div>
            </Popover.Button>
          ))}
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Tipped reactions</h3>
        <Row className="justify-between gap-2">
          {Object.keys(paidRxns).map((reaction) => (
            <Popover.Button key={reaction}>
              <Row className="items-center gap-0.5 rounded px-1 py-0.5 hover:bg-gray-200">
                <span className="text-sm text-gray-700">
                  ${paidRxns[reaction]}:
                </span>
                <span className="text-base">{reaction}</span>
              </Row>
            </Popover.Button>
          ))}
        </Row>
      </Popover.Panel>
    </Popover>
  )
}

export function ExistingRxnsDisplay(props: {
  rxns: CommentRxn[]
  commentId: string
  userId?: string
}) {
  const { rxns, commentId, userId } = props
  const rxnsWithCounts = Object.fromEntries(freeRxns.map((r) => [r, 0]))
  rxns.forEach((rxn) => {
    rxnsWithCounts[rxn.reaction]++
  })
  return (
    <Row className="gap-2">
      {freeRxns.map((reaction) => {
        if (rxnsWithCounts[reaction] > 0) {
          const userDidReact = rxns.some((rxn) => rxn.reactor_id === userId)
          return (
            <button
              key={reaction}
              onClick={async () => {
                if (userId) {
                  await onFreeRxnClick(reaction, commentId)
                }
              }}
              className={clsx(
                'flex items-center gap-1 rounded px-1 py-[0.5px]',
                userDidReact
                  ? 'bg-orange-100 ring-2 ring-orange-600'
                  : 'bg-gray-100',
                userId && 'cursor-pointer'
              )}
            >
              <span className="text-sm">{reaction}</span>
              <span className="text-xs text-gray-500">
                {rxnsWithCounts[reaction]}
              </span>
            </button>
          )
        } else {
          return null
        }
      })}
    </Row>
  )
}

export function CommentRxnsPanel(props: {
  commentId: string
  rxns: CommentRxn[]
  userId?: string
}) {
  const { commentId, rxns, userId } = props
  return (
    <Row className="items-center gap-2">
      <AddRxn commentId={commentId} />
      <ExistingRxnsDisplay rxns={rxns} commentId={commentId} userId={userId} />
    </Row>
  )
}
