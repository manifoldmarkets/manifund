import { CommentRxn } from '@/db/comment'
import { Popover } from '@headlessui/react'
import { FaceSmileIcon, PaperAirplaneIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { buttonClass } from './button'
import { InfoTooltip } from './info-tooltip'
import { Col } from './layout/col'
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

export const tippedRxns = {
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
  rxns: CommentRxn[]
  userId?: string
  userCharityBalance?: number
}) {
  const { postRxn, rxns, userId, userCharityBalance } = props
  const userExists = userCharityBalance !== undefined && !!userId
  const userRxns = userExists
    ? rxns.filter((rxn) => rxn.reactor_id === userId)
    : []
  const [selectedTippedRxn, setSelectedTippedRxn] = useState('')
  return (
    <Popover className="relative">
      <Popover.Button className="text-gray-500 hover:text-gray-700 focus:outline-0">
        <AddRxnIcon />
      </Popover.Button>

      <Popover.Panel className="absolute bottom-5 left-5 z-10 rounded-md rounded-bl-sm bg-gray-50 p-3 shadow-md">
        <Col className="w-40">
          <h3 className="text-sm text-gray-700">Free reactions</h3>
          <div className="mx-auto grid w-fit grid-cols-5 gap-2">
            {freeRxns.map((reaction) => {
              const userDidReact = !!userRxns.find(
                (rxn) => rxn.reaction === reaction
              )
              return (
                <Popover.Button
                  key={reaction}
                  className="text-base"
                  onClick={async () => {
                    await postRxn(reaction)
                  }}
                >
                  <div
                    className={clsx(
                      'rounded px-1 py-0.5 text-base hover:bg-gray-300',
                      userDidReact && 'bg-gray-200'
                    )}
                  >
                    {reaction}
                  </div>
                </Popover.Button>
              )
            })}
          </div>
        </Col>
        {userExists && (
          <Col className="w-40">
            <h3 className="mt-4 text-sm text-gray-700">
              Tipped reactions{' '}
              <InfoTooltip text="Send money from your charity balance to this commenter's charity balance as a thanks for their helpful comment." />
            </h3>
            <Row className="mx-auto justify-between divide-x divide-gray-300">
              {Object.keys(tippedRxns).map((reaction) => {
                const userDidReact = !!userRxns.find(
                  (rxn) => rxn.reaction === reaction
                )
                const sufficientFunds =
                  userCharityBalance >= tippedRxns[reaction]
                const enabled = sufficientFunds && !userDidReact
                return (
                  <div className="px-1" key={reaction}>
                    <Tooltip
                      text={
                        !sufficientFunds
                          ? 'Insufficient funds'
                          : userDidReact
                          ? 'Already used'
                          : ''
                      }
                    >
                      <button
                        key={reaction}
                        disabled={!enabled}
                        onClick={() =>
                          setSelectedTippedRxn(
                            selectedTippedRxn === reaction ? '' : reaction
                          )
                        }
                        className={clsx(
                          enabled
                            ? 'cursor-pointer hover:bg-gray-200'
                            : 'cursor-not-allowed',
                          userDidReact && 'bg-gray-200',
                          reaction === selectedTippedRxn &&
                            'bg-gray-200 ring-2 ring-gray-300',
                          'flex items-center gap-0.5 rounded px-1 py-0.5'
                        )}
                      >
                        <span className="text-xs text-gray-700">
                          ${tippedRxns[reaction]}
                        </span>
                        <span className="text-base">{reaction}</span>
                      </button>
                    </Tooltip>
                  </div>
                )
              })}
            </Row>
            {!!selectedTippedRxn && (
              <Row className="mt-3 justify-end">
                <Popover.Button
                  onClick={async () => {
                    await postRxn(selectedTippedRxn)
                    setSelectedTippedRxn('')
                  }}
                  className={clsx(
                    buttonClass('2xs', 'light-orange'),
                    'flex gap-1'
                  )}
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Send ${tippedRxns[selectedTippedRxn]} tip
                </Popover.Button>
              </Row>
            )}
          </Col>
        )}
      </Popover.Panel>
    </Popover>
  )
}

export function ExistingFreeRxnsDisplay(props: {
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
          const userDidReact = !!rxns.find(
            (rxn) => rxn.reactor_id === userId && rxn.reaction === reaction
          )
          return (
            <button
              key={reaction}
              onClick={async () => {
                if (userId) {
                  await postRxn(reaction)
                }
              }}
              className={clsx(
                'flex items-center gap-1 rounded bg-gray-100 px-1.5 py-[0.5px] hover:bg-gray-200',
                userDidReact && 'ring-2 ring-gray-300',
                userId && 'cursor-pointer'
              )}
            >
              <span className="text-sm">{reaction}</span>
              {rxnsWithCounts[reaction] > 1 && (
                <span className="text-xs text-gray-500">
                  {rxnsWithCounts[reaction]}
                </span>
              )}
            </button>
          )
        } else {
          return null
        }
      })}
    </Row>
  )
}

export function ExistingTippedRxnsDisplay(props: {
  rxns: CommentRxn[]
  userId?: string
}) {
  const { rxns, userId } = props
  const tippedRxnsArray = Object.keys(tippedRxns)
  const rxnsWithCounts = Object.fromEntries(tippedRxnsArray.map((r) => [r, 0]))
  rxns.forEach((rxn) => {
    rxnsWithCounts[rxn.reaction]++
  })
  return (
    <Row className="gap-2">
      {tippedRxnsArray.map((reaction) => {
        if (rxnsWithCounts[reaction] > 0) {
          const userDidReact = !!rxns.find(
            (rxn) => rxn.reactor_id === userId && rxn.reaction === reaction
          )
          return (
            <Tooltip text={`$${tippedRxns[reaction]}`} key={reaction}>
              <div
                className={clsx(
                  'flex cursor-default items-center gap-1 rounded bg-gradient-to-r from-orange-500 to-rose-500 px-1.5 py-[0.5px]',
                  userDidReact && 'ring-2 ring-orange-600'
                )}
              >
                <span className="text-sm">{reaction}</span>
                {rxnsWithCounts[reaction] > 1 && (
                  <span className="text-xs text-gray-500">
                    {rxnsWithCounts[reaction]}
                  </span>
                )}
              </div>
            </Tooltip>
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
    <Row className="items-center gap-2">
      <AddRxn
        postRxn={postRxn}
        rxns={localRxns}
        userId={userId}
        userCharityBalance={userCharityBalance}
      />
      <ExistingFreeRxnsDisplay
        rxns={localRxns}
        userId={userId}
        postRxn={postRxn}
      />
      <ExistingTippedRxnsDisplay rxns={localRxns} userId={userId} />
    </Row>
  )
}
