import { CommentRxn } from '@/db/comment'
import { Popover } from '@headlessui/react'
import { FaceSmileIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { buttonClass } from './button'
import { InfoTooltip } from './info-tooltip'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'

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

export function AddRxn(props: {
  postRxn: (reaction: string) => void
  userCharityBalance?: number
}) {
  const { userCharityBalance, postRxn } = props
  const includeTippedRxns = userCharityBalance !== undefined
  const [selectedTippedRxn, setSelectedTippedRxn] = useState('')
  return (
    <Popover className="relative">
      <Popover.Button className="text-gray-500 hover:text-gray-700 focus:outline-0">
        <AddRxnIcon />
      </Popover.Button>

      <Popover.Panel className="absolute bottom-5 left-5 z-10 rounded-md rounded-bl-sm bg-gray-50 p-3 shadow-md">
        <h3 className="text-sm text-gray-700">Free reactions</h3>
        <div className="grid grid-cols-5 gap-2">
          {freeRxns.map((reaction) => (
            <Popover.Button
              key={reaction}
              className="text-base"
              onClick={async () => {
                await postRxn(reaction)
              }}
            >
              <div className="rounded px-1 py-0.5 text-base hover:bg-gray-200">
                {reaction}
              </div>
            </Popover.Button>
          ))}
        </div>
        {includeTippedRxns && (
          <>
            <h3 className="mt-4 text-sm text-gray-700">
              Tipped reactions{' '}
              <InfoTooltip text="Send money from your charity balance to this commenter's charity balance as a thanks for their helpful comment." />
            </h3>
            <Row className="justify-between divide-x divide-gray-300">
              {Object.keys(paidRxns).map((reaction) => {
                const enabled = userCharityBalance >= paidRxns[reaction]
                return (
                  <div className="px-1">
                    <Tooltip text={enabled ? '' : 'Insufficient funds'}>
                      <button
                        key={reaction}
                        disabled={!enabled}
                        onClick={() => setSelectedTippedRxn(reaction)}
                        className={clsx(
                          enabled
                            ? 'cursor-pointer hover:bg-gray-200'
                            : 'cursor-not-allowed',
                          reaction === selectedTippedRxn && 'bg-gray-200',
                          'flex items-center gap-0.5 rounded px-1 py-0.5'
                        )}
                      >
                        <span className="text-xs text-gray-700">
                          ${paidRxns[reaction]}
                        </span>
                        <span className="text-base">{reaction}</span>
                      </button>
                    </Tooltip>
                  </div>
                )
              })}
            </Row>
            {!!selectedTippedRxn && (
              <Row className="mt-3 justify-center">
                <Popover.Button
                  onClick={async () => {
                    await postRxn(selectedTippedRxn)
                  }}
                  className={buttonClass('2xs', 'light-orange')}
                >
                  Send ${paidRxns[selectedTippedRxn]} tip
                </Popover.Button>
              </Row>
            )}
          </>
        )}
      </Popover.Panel>
    </Popover>
  )
}

export function ExistingRxnsDisplay(props: {
  rxns: CommentRxn[]
  postRxn: (reaction: string) => void
  userId?: string
}) {
  const { rxns, postRxn, userId } = props
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
                  await postRxn(reaction)
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
  userCharityBalance?: number
}) {
  const { commentId, rxns, userId, userCharityBalance } = props
  const router = useRouter()
  const [localRxns, setLocalRxns] = useState(rxns)
  async function postRxn(reaction: string) {
    const existingRxnIdx = rxns.findIndex(
      (rxn) => rxn.reaction === reaction && rxn.reactor_id === userId
    )
    if (existingRxnIdx === -1) {
      rxns.push({
        comment_id: commentId,
        reaction,
        reactor_id: userId ?? '',
        txn_id: null,
      })
      setLocalRxns(rxns)
    } else {
      rxns.splice(existingRxnIdx, 1)
      setLocalRxns(rxns)
    }
    await fetch(`/api/react-to-comment`, {
      method: 'POST',
      body: JSON.stringify({
        commentId,
        reaction,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    router.refresh()
  }
  return (
    <Row className="items-center gap-2 overflow-visible">
      <AddRxn postRxn={postRxn} userCharityBalance={undefined} />
      <ExistingRxnsDisplay rxns={localRxns} userId={userId} postRxn={postRxn} />
    </Row>
  )
}
